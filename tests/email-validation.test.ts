import { describe, expect, it } from "vitest";
import { emailDecision } from "../supabase/functions/validate-email/policy";
describe("signup email policy", () => {
  const real = { format_valid: true, mx_found: true, smtp_check: true, disposable: false, free: true };
  it("rejects disposable addresses", () => expect(emailDecision({ ...real, disposable: true }).valid).toBe(false));
  it("accepts real free-provider addresses", () => expect(emailDecision(real).valid).toBe(true));
  it("rejects nonexistent mailboxes", () => expect(emailDecision({ ...real, smtp_check: false }).valid).toBe(false));
  it("fails closed when verification is inconclusive", () => expect(emailDecision({}).valid).toBe(false));
});