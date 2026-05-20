## Plan

### 1. Remove MagneticDock permanently

- Delete `src/components/layout/AppDock.tsx` and `src/components/ui/magnetic-dock.tsx`.
- Remove `AppDock` import/usage and `hideDock` prop from `src/components/layout/Layout.tsx`.
- Adjust main padding (`pb-28` → `pb-8`) now that there's no bottom/top dock.
- Grep for any other `AppDock` / `MagneticDock` references and clean them up.

### 2. Adjust and Fix Matrix Rain visibility on Auth page

- Inspect `src/components/ui/matrix-rain.tsx` and `src/pages/Auth.tsx`.
- Ensure the canvas is `position: fixed inset-0`, `z-0`, with parent `isolate` and no opaque background hiding it.
- Make sure the auth panel uses a translucent background (`bg-background/60 backdrop-blur`) so rain shows through.
- Force animation start on mount (don't gate behind reduced motion when user hasn't enabled it); verify canvas sizing on resize and devicePixelRatio.

### 3. Harden MFA flows (TOTP)

Audit `src/pages/Auth.tsx`, `src/contexts/AuthContext.tsx`, `src/components/auth/MfaChallenge.tsx`, `src/components/settings/MfaSettings.tsx`:

- **Enrollment**: confirm `supabase.auth.mfa.enroll({ factorType: 'totp' })` → render QR (`data.totp.qr_code`) + secret with copy button → `challenge` + `verify` to activate. Handle errors (already enrolled, network).
- **Removal**: confirm `unenroll({ factorId })` with confirmation dialog; refresh factor list.
- **Login**: when `signIn` returns `mfaRequired`, render `MfaChallenge`. Add a **Cancel** path that calls `supabase.auth.signOut()` so user isn't stuck in aal1 with pending challenge. Block navigation to `/` until aal2 reached.
- **Edge cases**: invalid 6-digit code, expired challenge (re-issue), no factors found (force unenroll/sign out), page refresh during MFA (re-check AAL on mount).

### 4. Storage: lock down `avatars` bucket

Migration:

- Set bucket `public = false`.
- Drop the broad public SELECT policy on `storage.objects` for `avatars`.
- Add RLS: users can INSERT/UPDATE/DELETE only their own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
- SELECT: allow only the owner; everyone else must go through signed URLs.
- Update avatar fetch sites (`Profile`, `Navbar`, `AuraAssistant`, etc.) to use `supabase.storage.from('avatars').createSignedUrl(path, 3600)` and cache the URL.

### 5. GraphQL / anon SELECT exposure

- Run `supabase--linter` + `security--run_security_scan` to enumerate exposed tables.
- Migration to `REVOKE SELECT ON ALL TABLES IN SCHEMA public FROM anon;` then re-`GRANT SELECT` only to tables intentionally public pre-auth (`badges`, `challenges`, `experiments`, `quizzes`, `profiles` if needed).
- Tighten `profiles` "viewable by everyone" → authenticated-only (currently leaks usernames/avatars to anon GraphQL).
- Tighten `experiment_comments` SELECT to authenticated.
- Disable `pg_graphql` introspection for anon if still needed: `REVOKE USAGE ON SCHEMA graphql FROM anon;` (verify no public-facing GraphQL usage in client first — the app uses PostgREST, so this is safe).

### 6. Re-scan and report

- Re-run `supabase--linter` and `security--run_security_scan`.
- Report remaining warnings (HIBP password protection toggle, leaked password protection, Postgres version, etc.) with one-line remediation each.

### Technical notes

- Files removed: `AppDock.tsx`, `magnetic-dock.tsx`.
- Files edited: `Layout.tsx`, `Auth.tsx`, `matrix-rain.tsx`, `AuthContext.tsx`, `MfaChallenge.tsx`, `MfaSettings.tsx`, avatar consumers.
- Migrations: 1 for storage policies + bucket privacy, 1 for GraphQL/anon grants and profile RLS tightening.
- No new dependencies.