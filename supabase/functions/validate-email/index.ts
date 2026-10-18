import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { emailDecision } from "./policy.ts";

const schema = z.object({ email: z.string().trim().email().max(254) }).strict();
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Public by design: address validation must happen before a user has a session.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ message: "Method not allowed." }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 1024) return reply({ message: "Request too large." }, 413);
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return reply({ valid: false, message: "Enter a valid email address." }, 400);
    const key = Deno.env.get("MAILBOXLAYER_API_KEY");
    if (!key) return reply({ valid: false, message: "Email verification is unavailable. Please try again later." }, 503);
    const url = new URL("https://apilayer.net/api/check");
    url.searchParams.set("access_key", key);
    url.searchParams.set("email", parsed.data.email);
    url.searchParams.set("smtp", "1");
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return reply({ valid: false, message: "Email verification is unavailable. Please try again later." }, 503);
    const result = await response.json();
    if (result.success === false) {
      // Never log provider bodies or URLs, which can contain credentials or addresses.
      console.error("Mailboxlayer rejected validation", { code: result.error?.code ?? "unknown" });
      return reply({ valid: false, message: "Email verification is unavailable. Please try again later." }, 503);
    }
    return reply(emailDecision(result));
  } catch {
    return reply({ valid: false, message: "Email verification is unavailable. Please try again later." }, 503);
  }
});