
## Scope

Eight related changes plus a security audit. One item (backend rate limiting) cannot be implemented as requested — see the note at the end.

---

### 1. Reduced-motion verification (video + parallax)

- Audit `ParallaxVideoSection.tsx`, `Parallax.tsx`, `ShaderBackground.tsx`, `OnboardingTour.tsx`, `HeroSection.tsx`.
- Ensure when `useReducedMotion()` is true:
  - `<video>` does not autoplay, does not preload, and renders the poster only (set `preload="none"`, drop `src` until user gestures).
  - `Parallax` returns children with no transform/scroll listener.
  - `canvas[data-shader]` hidden via existing CSS rule.
  - Onboarding tour uses no entrance/exit motion.
- Manually verify at 320 / 375 / 414 / 768 / desktop using the preview viewport tool.
- Add a small `ReducedMotionAudit` dev panel (toggle `?rmaudit=1`) listing every animated element on the page and whether it's currently disabled — used for QA only.

### 2. Video analytics events

- Add a thin `trackVideoEvent(name, props)` helper in `src/lib/analytics.ts` (console + `window.dispatchEvent` for now; pluggable later).
- Emit from `ParallaxVideoSection.tsx`:
  - `video_autoplay_attempt`, `video_autoplay_success`, `video_autoplay_blocked`
  - `video_canplay` (with ms since mount)
  - `video_fallback_poster` with `reason: "reduced_motion" | "save_data" | "low_bandwidth" | "user_pref_off" | "autoplay_blocked"`
- No backend writes — purely client events.

### 3. Remove duplicate nav menu button

- `Navbar.tsx` currently renders both `CardNav` (which has its own hamburger) and a separate `DropdownMenu` Menu button. Remove the standalone `DropdownMenu` "Menu" trigger from `RightContent`. Keep Theme/Help/Admin icons.

### 4. MagneticDock as primary nav on key pages

Pages: Home (`/`), Profile, Settings, Help, Analytics, Library, Videos, Workspace, Builder, Community.

- Create `src/components/ui/magnetic-dock.tsx` reconstructing the component from the attached spec (the doc has OCR artifacts — I'll write clean TS using framer-motion `useMotionValue/useSpring/useTransform` with the same API: `items, iconSize, maxScale, magneticDistance, showLabels, position, variant`).
- Create `src/components/layout/AppDock.tsx` that wires lucide icons (Home, Library, Videos, Workspace, Builder, Community, Profile, Settings, Help) to routes and highlights the active route.
- Mount it inside `Layout.tsx` (fixed bottom, `position-bottom`) so every page using `<Layout>` gets it. Hide on mobile <480px in favor of existing bottom nav OR shrink iconSize — TBD per QA.
- Keep `Navbar`/`CardNav` at the top for branding + sign-in CTA. Dock is the secondary quick-nav.

### 5. Auth page: MatrixRain shader + AuthModal

- Create `src/components/ui/matrix-rain.tsx` reconstructed from spec: canvas-based rain, `variant: "default" | "fixed"`, `fontSize`, `speed`, `fixedColor`, theme-aware (light bg = light theme), respects `prefers-reduced-motion` (renders static frame).
- Create `src/components/ui/auth-modal.tsx` reconstructed as an inline panel (not a modal — we'll use the "open" content directly on `/auth`) with email + password fields, social buttons (Google only, since that's the supported provider), wired to existing `AuthContext` (`signIn`, `signUp`, `signInWithGoogle`). Apple/Microsoft/Twitter/GitHub icons shown but disabled with "Coming soon" tooltip since only Google is enabled.
- Rewrite `src/pages/Auth.tsx`: `MatrixRain` as fixed background layer, glassy `AuthModal` panel centered on top. Preserve current sign-in/sign-up/reset flows.

### 6. Input validation & payload limits

- Add `zod` schemas for every form: Auth (email/password/username), Profile updates, Experiment requests, Community posts/comments, Custom experiments save.
- Reject payloads >50KB client-side before submit; trim strings; enforce min/max lengths; sanitize via existing patterns (no `dangerouslySetInnerHTML` already).
- For edge functions (`aura-chat`, `elevenlabs-tts`), add zod validation of the request body and reject malformed/oversized (>32KB) JSON with 400.

### 7. Hardcoded secrets scan + audit

- Run `rg` for patterns: `sk_`, `pk_live`, `AIza`, `Bearer `, `password\s*=\s*"`, `api[_-]?key`, hex tokens, JWT-shaped strings, etc., across `src/`, `supabase/functions/`, `public/`, `index.html`.
- Confirm only Lovable-managed publishable Supabase anon key (in `.env`) and the public anon key string referenced from system prompt context are present in client bundles — both are by design publishable.
- Verify `.env` is gitignored and only contains `VITE_SUPABASE_*` publishables.
- Produce a written audit listing: secret findings, RLS coverage summary (using existing `security--run_security_scan`), missing validations fixed, residual risks.

### 8. Security audit deliverable

A markdown report in chat covering:
- Auth flow (Google + email, password reset)
- RLS policies (using `security--run_security_scan`)
- Edge function input validation status (post-fix)
- Client-side XSS / `dangerouslySetInnerHTML` audit
- Storage bucket exposure (avatars = public, others)
- Remaining recommendations (e.g., HIBP password check, MFA, CSP headers)

---

### Items I will NOT implement (and why)

**Rate limiting on all endpoints + 3 attempts / 15 min on auth routes.**
Per Lovable Cloud platform policy, the backend does not yet have rate-limiting primitives. Any ad-hoc implementation (e.g., a `request_log` table with row-count checks) would be racy, easily bypassed, and would not protect the actual Supabase Auth endpoints (sign-in, sign-up, password reset) which run outside our edge functions. Supabase Auth already enforces its own per-IP throttles internally.

If you still want an ad-hoc implementation despite the caveats, tell me and I'll add a best-effort `auth_attempts` table + edge function wrapper for the flows that go through our own functions (not for `supabase.auth.signInWithPassword` directly).

---

### Technical details

- Files created: `src/components/ui/magnetic-dock.tsx`, `src/components/layout/AppDock.tsx`, `src/components/ui/matrix-rain.tsx`, `src/components/ui/auth-modal.tsx`, `src/lib/analytics.ts`, `src/lib/validation.ts`, `src/components/dev/ReducedMotionAudit.tsx`.
- Files modified: `Navbar.tsx`, `Layout.tsx`, `Auth.tsx`, `ParallaxVideoSection.tsx`, `aura-chat/index.ts`, `elevenlabs-tts/index.ts`, plus form components consuming new zod schemas.
- No DB migrations required.
- Dependencies: `zod` (likely already installed — will verify).
