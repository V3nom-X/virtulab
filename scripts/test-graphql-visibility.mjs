#!/usr/bin/env node
/**
 * Role-based GraphQL / PostgREST visibility test.
 *
 * Asserts that the *anon* and *authenticated* roles can only SELECT
 * the tables we intentionally expose to them. Run in CI after each
 * deploy:
 *
 *   SUPABASE_URL=...  SUPABASE_ANON_KEY=...  \
 *   TEST_USER_EMAIL=ci@example.com  TEST_USER_PASSWORD=...  \
 *   node scripts/test-graphql-visibility.mjs
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_ANON_KEY env vars");
  process.exit(2);
}

// Intended exposure matrix. Update when intent changes.
const ANON_ALLOW = ["badges", "challenges", "experiments", "quizzes", "profiles"];
const AUTH_EXTRA_ALLOW = [
  "user_badges", "user_progress", "user_preferences", "user_roles",
  "custom_experiments", "experiment_comments", "experiment_likes",
  "experiment_requests", "collaboration_rooms", "room_participants",
  "chat_messages", "favorite_channels", "quiz_results",
];

const ALL_TABLES = [...ANON_ALLOW, ...AUTH_EXTRA_ALLOW];

let failures = 0;
const fail = (msg) => { failures++; console.error("✗", msg); };
const pass = (msg) => console.log("✓", msg);

async function probe(client, table) {
  const { error } = await client.from(table).select("*", { head: true, count: "exact" }).limit(1);
  // PostgREST returns 42501 / 'permission denied' when the role lacks SELECT.
  if (error && /permission denied|not exist|42501|PGRST/i.test(error.message + error.code)) return false;
  return !error;
}

const anon = createClient(URL, KEY);
console.log("\n— Anonymous role —");
for (const t of ALL_TABLES) {
  const visible = await probe(anon, t);
  const should = ANON_ALLOW.includes(t);
  if (visible === should) pass(`${t} ${visible ? "visible" : "hidden"} as expected`);
  else fail(`${t}: expected ${should ? "visible" : "hidden"}, got ${visible ? "visible" : "hidden"}`);
}

if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
  console.log("\n— Authenticated role —");
  const authed = createClient(URL, KEY);
  const { error: signInErr } = await authed.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  });
  if (signInErr) {
    fail(`auth sign-in failed: ${signInErr.message}`);
  } else {
    const ALLOW = new Set([...ANON_ALLOW, ...AUTH_EXTRA_ALLOW]);
    for (const t of ALL_TABLES) {
      const visible = await probe(authed, t);
      const should = ALLOW.has(t);
      if (visible === should) pass(`${t} ${visible ? "visible" : "hidden"} as expected`);
      else fail(`${t}: expected ${should ? "visible" : "hidden"}, got ${visible ? "visible" : "hidden"}`);
    }
  }
} else {
  console.log("\n(skipping authenticated probes — set TEST_USER_EMAIL/PASSWORD to enable)");
}

console.log(failures === 0 ? "\nAll visibility checks passed." : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
