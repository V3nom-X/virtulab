#!/usr/bin/env node
/**
 * Verifies that the `avatars` storage bucket is correctly locked down:
 *
 *  1. Anonymous clients cannot LIST objects (no directory listing).
 *  2. Anonymous clients cannot READ another user's avatar by path.
 *  3. Authenticated users CAN issue signed URLs for their own avatar.
 *  4. Authenticated users CANNOT issue signed URLs for someone else's
 *     avatar (RLS denies the underlying SELECT before the signed URL
 *     is minted).
 *
 * Run in CI after each deploy. Required env:
 *   SUPABASE_URL, SUPABASE_ANON_KEY
 * Optional (enables checks 3–4):
 *   TEST_USER_EMAIL, TEST_USER_PASSWORD
 *   OTHER_USER_AVATAR_PATH   e.g. "<other-user-uuid>/avatar.png"
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_ANON_KEY env vars");
  process.exit(2);
}

let failures = 0;
const fail = (m) => { failures++; console.error("✗", m); };
const pass = (m) => console.log("✓", m);

const anon = createClient(URL, KEY);

// 1. Anonymous list MUST be empty / denied.
{
  const { data, error } = await anon.storage.from("avatars").list("", { limit: 100 });
  if (error || !data || data.length === 0) pass("anon cannot list avatars bucket");
  else fail(`anon could list ${data.length} object(s) in avatars bucket`);
}

// 2. Anonymous signed URL request for an arbitrary path must fail.
{
  const probePath = "00000000-0000-0000-0000-000000000000/avatar.png";
  const { data, error } = await anon.storage.from("avatars").createSignedUrl(probePath, 60);
  if (error || !data?.signedUrl) pass("anon cannot mint signed URL for foreign path");
  else fail("anon was able to mint a signed URL without auth");
}

if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
  const authed = createClient(URL, KEY);
  const { data: signIn, error: signInErr } = await authed.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  });
  if (signInErr || !signIn?.user) {
    fail(`auth sign-in failed: ${signInErr?.message}`);
  } else {
    const myId = signIn.user.id;

    // 3. Owner can list their own folder (returns 0+ items, must not error).
    {
      const { error } = await authed.storage.from("avatars").list(myId, { limit: 5 });
      if (!error) pass("authenticated user can list their own folder");
      else fail(`owner list failed: ${error.message}`);
    }

    // 4. Owner can mint a signed URL inside their own folder.
    {
      const probe = `${myId}/probe-${Date.now()}.png`;
      const { error } = await authed.storage.from("avatars").createSignedUrl(probe, 60);
      // Object may not exist; that's fine. What we care about is "no permission" vs "not found".
      if (!error || /not found|object does not exist/i.test(error.message)) {
        pass("owner can request signed URL for own path");
      } else {
        fail(`owner signed-URL request rejected by RLS: ${error.message}`);
      }
    }

    // 5. Owner CANNOT mint a signed URL for another user's avatar.
    if (process.env.OTHER_USER_AVATAR_PATH) {
      const { data, error } = await authed.storage
        .from("avatars")
        .createSignedUrl(process.env.OTHER_USER_AVATAR_PATH, 60);
      if (error || !data?.signedUrl) pass("authenticated user cannot sign foreign avatar path");
      else fail("RLS leak: signed URL minted for another user's avatar");
    } else {
      console.log("(skipping foreign-path probe — set OTHER_USER_AVATAR_PATH to enable)");
    }
  }
} else {
  console.log("(skipping authenticated probes — set TEST_USER_EMAIL / TEST_USER_PASSWORD)");
}

console.log(failures === 0 ? "\nAll avatar access checks passed." : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
