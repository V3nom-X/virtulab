export function emailDecision(result: Record<string, unknown>): { valid: boolean; message: string } {
  if (result.disposable === true) return { valid: false, message: "Disposable email addresses are not allowed. Use a permanent email address." };
  if (result.format_valid === false || result.mx_found === false || result.smtp_check === false) {
    return { valid: false, message: "This address could not be verified. Check the spelling or use another email address." };
  }
  if (result.format_valid !== true || result.mx_found !== true || result.disposable !== false || result.smtp_check !== true) {
    return { valid: false, message: "Email verification is unavailable. Please try again later." };
  }
  return { valid: true, message: "Email address verified." };
}