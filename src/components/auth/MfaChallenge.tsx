import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";

const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app.");

type MfaFactor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
};

interface MfaChallengeProps {
  factors: MfaFactor[];
  onVerified: () => void;
  onCancel: () => void;
}

export function MfaChallenge({ factors, onVerified, onCancel }: MfaChallengeProps) {
  const [selectedFactorId, setSelectedFactorId] = useState(factors[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const selectedFactor = factors.find((factor) => factor.id === selectedFactorId) ?? factors[0];

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success || !selectedFactor) {
      toast.error(parsed.success ? "Choose a verification factor." : parsed.error.errors[0].message);
      return;
    }

    setIsVerifying(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: selectedFactor.id,
      code: parsed.data,
    });
    setIsVerifying(false);

    if (error) {
      toast.error(error.message.includes("verification") ? "Invalid or expired MFA code." : error.message);
      return;
    }

    toast.success("MFA verified.");
    onVerified();
  };

  return (
    <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-background/80 p-6 shadow-2xl shadow-foreground/10 backdrop-blur-2xl sm:p-8">
      <Alert className="mb-6 bg-card/80">
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Multi-factor verification</AlertTitle>
        <AlertDescription>Enter the current code from your authenticator app to finish signing in.</AlertDescription>
      </Alert>

      <form onSubmit={handleVerify} className="space-y-4">
        {factors.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="mfa-factor">Authenticator</Label>
            <select
              id="mfa-factor"
              value={selectedFactorId}
              onChange={(event) => setSelectedFactorId(event.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {factors.map((factor) => (
                <option key={factor.id} value={factor.id}>
                  {factor.friendly_name || "Authenticator app"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="mfa-code">6-digit code</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            className="text-center font-mono text-lg tracking-[0.4em]"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isVerifying || !selectedFactor}>
          {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Verify and continue
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onCancel} disabled={isVerifying}>
          Back to sign in
        </Button>
      </form>
    </div>
  );
}
