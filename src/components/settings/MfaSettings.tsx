import { useEffect, useState } from "react";
import { KeyRound, Loader2, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";

const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app.");

type Factor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: string;
  created_at?: string;
};

type Enrollment = {
  id: string;
  qrCode: string;
  secret: string;
};

export function MfaSettings() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [aal, setAal] = useState<{ currentLevel: string | null; nextLevel: string | null }>({ currentLevel: null, nextLevel: null });
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollCode, setEnrollCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [busyFactorId, setBusyFactorId] = useState<string | null>(null);

  const refreshMfaState = async () => {
    setIsLoading(true);
    const [{ data: factorData, error: factorError }, { data: aalData, error: aalError }] = await Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]);

    if (factorError) toast.error(factorError.message);
    if (aalError) toast.error(aalError.message);

    setFactors((factorData?.all ?? []) as Factor[]);
    if (aalData) setAal({ currentLevel: aalData.currentLevel, nextLevel: aalData.nextLevel });
    setIsLoading(false);
  };

  useEffect(() => {
    void refreshMfaState();
  }, []);

  const verifiedFactors = factors.filter((factor) => factor.status === "verified");
  const pendingFactors = factors.filter((factor) => factor.status !== "verified");
  const requiresStepUp = aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";

  const startEnrollment = async () => {
    setIsEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "VirtuLab authenticator",
      issuer: "VirtuLab",
    });
    setIsEnrolling(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setEnrollment({
      id: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setEnrollCode("");
    toast.success("Scan the QR code, then enter the 6-digit code.");
  };

  const verifyEnrollment = async () => {
    if (!enrollment) return;
    const parsed = otpSchema.safeParse(enrollCode);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setIsVerifying(true);
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
    if (challengeError) {
      setIsVerifying(false);
      toast.error(challengeError.message);
      return;
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId: challengeData.id,
      code: parsed.data,
    });
    setIsVerifying(false);

    if (error) {
      toast.error(error.message.includes("verification") ? "Invalid or expired MFA code." : error.message);
      return;
    }

    toast.success("MFA enabled for your account.");
    setEnrollment(null);
    setEnrollCode("");
    await refreshMfaState();
  };

  const verifyExistingFactor = async (factorId: string) => {
    const code = window.prompt("Enter the 6-digit authenticator code to verify this session.");
    const parsed = otpSchema.safeParse(code ?? "");
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setBusyFactorId(factorId);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: parsed.data });
    setBusyFactorId(null);

    if (error) {
      toast.error(error.message.includes("verification") ? "Invalid or expired MFA code." : error.message);
      return;
    }

    toast.success("Session verified with MFA.");
    await refreshMfaState();
  };

  const removeFactor = async (factor: Factor) => {
    if (!window.confirm(`Remove ${factor.friendly_name || "this authenticator"}?`)) return;
    setBusyFactorId(factor.id);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setBusyFactorId(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("MFA factor removed.");
    await refreshMfaState();
  };

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Multi-factor Authentication</h2>
        <Badge variant={verifiedFactors.length ? "default" : "secondary"} className="ml-auto">
          {verifiedFactors.length ? "Enabled" : "Optional"}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading MFA status…
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Add an authenticator app code as an optional second step for sign-in and sensitive account changes.
          </p>

          {requiresStepUp && verifiedFactors[0] && (
            <Alert className="bg-muted/40">
              <KeyRound className="h-4 w-4" />
              <AlertTitle>Verify this session</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>Use MFA once in this session before removing a verified authenticator.</p>
                <Button size="sm" variant="outline" onClick={() => verifyExistingFactor(verifiedFactors[0].id)} disabled={busyFactorId === verifiedFactors[0].id}>
                  {busyFactorId === verifiedFactors[0].id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify session
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {verifiedFactors.length > 0 && (
            <div className="space-y-3">
              {verifiedFactors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/60 p-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Smartphone className="h-4 w-4 text-primary" />
                      {factor.friendly_name || "Authenticator app"}
                    </p>
                    <p className="text-xs text-muted-foreground">Verified TOTP factor</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeFactor(factor)} disabled={!!busyFactorId}>
                    {busyFactorId === factor.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {pendingFactors.length > 0 && !enrollment && (
            <p className="text-xs text-muted-foreground">You have an unfinished MFA setup. Start again if you need a fresh QR code.</p>
          )}

          {enrollment ? (
            <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <img src={enrollment.qrCode} alt="MFA setup QR code" className="h-40 w-40 rounded-lg bg-white p-2" />
                <div className="space-y-3">
                  <div>
                    <Label>Manual setup key</Label>
                    <code className="mt-1 block break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{enrollment.secret}</code>
                  </div>
                  <div>
                    <Label htmlFor="mfa-enroll-code">6-digit code</Label>
                    <Input
                      id="mfa-enroll-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={enrollCode}
                      onChange={(event) => setEnrollCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1 text-center font-mono tracking-[0.35em]"
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={verifyEnrollment} disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Verify and enable
                </Button>
                <Button variant="ghost" onClick={() => setEnrollment(null)} disabled={isVerifying}>
                  Cancel setup
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Separator />
              <Button onClick={startEnrollment} disabled={isEnrolling}>
                {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                Add authenticator app
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
