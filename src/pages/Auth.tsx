import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/layout/BackButton";
import { MatrixRain } from "@/components/ui/matrix-rain";
import { AuthPanel } from "@/components/ui/auth-modal";
import { MfaChallenge } from "@/components/auth/MfaChallenge";
import { z } from "zod";
import { emailSchema, passwordSchema, usernameSchema, assertPayloadSize } from "@/lib/validation";

type MfaFactor = { id: string; friendly_name?: string; factor_type: string };

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function useRateLimiter() {
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, force] = useState(0);

  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => {
      force((n) => n + 1);
      if (Date.now() >= lockedUntil) {
        setAttempts(0);
        setLockedUntil(0);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const isLocked = Date.now() < lockedUntil;
  const remainingSeconds = isLocked ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const recordAttempt = () => {
    const next = attempts + 1;
    setAttempts(next);
    if (next >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
      toast.error("Too many attempts. Please wait 15 minutes before trying again.");
    }
  };
  const reset = () => {
    setAttempts(0);
    setLockedUntil(0);
  };
  return { isLocked, remainingSeconds, attempts, recordAttempt, reset };
}

function formatRemaining(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, resetPassword, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<MfaFactor[]>([]);
  const [isMfaPending, setIsMfaPending] = useState(false);

  const loginLimiter = useRateLimiter();
  const signupLimiter = useRateLimiter();

  useEffect(() => {
    if (user && !isMfaPending && mfaFactors.length === 0) navigate("/");
  }, [user, isMfaPending, mfaFactors.length, navigate]);

  const handleLogin = async (email: string, password: string) => {
    if (loginLimiter.isLocked) {
      toast.error(`Locked. Try again in ${formatRemaining(loginLimiter.remainingSeconds)}.`);
      return;
    }
    try {
      assertPayloadSize({ email, password });
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      else if (err instanceof Error) toast.error(err.message);
      return;
    }
    setIsSubmitting(true);
    setIsMfaPending(true);
    const { error, mfaRequired, factors } = await signIn(email, password);
    if (error) {
      setIsMfaPending(false);
      loginLimiter.recordAttempt();
      toast.error(error.message.includes("Invalid login credentials") ? "Invalid email or password" : error.message);
    } else if (mfaRequired && factors?.length) {
      setMfaFactors(factors);
      toast.info("Enter your MFA code to finish signing in.");
    } else {
      setIsMfaPending(false);
      loginLimiter.reset();
      toast.success("Welcome back!");
      navigate("/");
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (data: { email: string; password: string; username?: string; fullName?: string }) => {
    if (signupLimiter.isLocked) {
      toast.error(`Locked. Try again in ${formatRemaining(signupLimiter.remainingSeconds)}.`);
      return;
    }
    try {
      assertPayloadSize(data);
      emailSchema.parse(data.email);
      passwordSchema.parse(data.password);
      if (data.username) usernameSchema.parse(data.username);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      else if (err instanceof Error) toast.error(err.message);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, { username: data.username, full_name: data.fullName });
    if (error) {
      signupLimiter.recordAttempt();
      toast.error(error.message.includes("already registered") ? "This email is already registered." : error.message);
    } else {
      signupLimiter.reset();
      toast.success("Account created. Check your email to verify.");
      navigate("/");
    }
    setIsSubmitting(false);
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setIsGoogleLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(forgotEmail);
    } catch (err) {
      if (err instanceof z.ZodError) toast.error(err.errors[0].message);
      return;
    }
    setIsResetting(true);
    const { error } = await resetPassword(forgotEmail);
    if (error) toast.error(error.message);
    else {
      toast.success("Password reset email sent!");
      setShowForgot(false);
      setForgotEmail("");
    }
    setIsResetting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeLimit = loginLimiter.isLocked
    ? `Too many attempts — locked for ${formatRemaining(loginLimiter.remainingSeconds)}.`
    : signupLimiter.isLocked
      ? `Too many attempts — locked for ${formatRemaining(signupLimiter.remainingSeconds)}.`
      : null;

  return (
    <div className="min-h-screen relative isolate overflow-hidden bg-black flex items-center justify-center p-4">
      {/* MatrixRain background shader */}
      <MatrixRain
        className="!fixed inset-0 z-0 h-screen w-screen"
        variant="fixed"
        fixedColor="#00ff9c"
        fontSize={16}
        speed={0.08}
      />
      {/* Soft radial veil for readability behind the panel */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.15)_60%,transparent_100%)]" />


      <BackButton />

      {mfaFactors.length > 0 ? (
        <MfaChallenge
          factors={mfaFactors}
          onVerified={() => {
            loginLimiter.reset();
            setIsMfaPending(false);
            setMfaFactors([]);
            navigate("/");
          }}
          onCancel={() => {
            setIsMfaPending(false);
            setMfaFactors([]);
          }}
        />
      ) : showForgot ? (
        <Card className="w-full max-w-md relative z-10 bg-background/70 backdrop-blur-2xl border-border">
          <CardHeader>
            <button onClick={() => setShowForgot(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
            <CardTitle>Reset your password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input id="forgot-email" type="email" required maxLength={254} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Send reset link
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <AuthPanel
          loading={isSubmitting}
          googleLoading={isGoogleLoading}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onGoogle={handleGoogle}
          onForgotPassword={() => setShowForgot(true)}
          rateLimitMessage={activeLimit}
        />
      )}
    </div>
  );
};

export default Auth;
