## Reduced motion + parallax + onboarding QA

### 1. Reduced motion mode (extend existing `reduce-motion` class)

The `useAccessibility` hook already toggles `.reduce-motion` on `<html>` based on a stored user preference. Extend it to:

- Also auto-enable when `window.matchMedia('(prefers-reduced-motion: reduce)')` matches (system preference), unioned with the user toggle.
- Expose a small helper `useReducedMotion()` (same file) that returns the current boolean for components to gate JS-driven animations (Framer Motion, GSAP, parallax).

In `src/index.css`, expand the `.reduce-motion` rule to:

- Force `animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important;` on `*, *::before, *::after`.
- Disable known heavy effects: `.shimmer-button` keyframes, `ShaderBackground` (`canvas[data-shader]` → `display:none`, fallback gradient), `CustomLoader` 5-dot bounce → static dots, `FlipFadeText` flip → simple fade.
- Hide decorative parallax layers (`[data-parallax]`).

In `PageTransition.tsx`: when reduced motion is on, skip the 1200 ms loader entirely (set `LOADING_DURATION = 0`, no `FlipFadeText`, no `motion.div` opacity fade) — render children immediately on route change. Keep current behavior otherwise.

In `OnboardingTour.tsx`: pass `disableOverlayAnimation` and shorter spotlight transition; if reduced motion is on, set `spotlightPadding: 4` and `disableScrolling: true`.

### 2. Parallax motion

Add a lightweight parallax system (no new heavy deps — use Framer Motion which is already installed):

- New `src/hooks/useParallax.ts`: returns a `MotionValue<number>` driven by `useScroll` + `useTransform`. Accepts `{ speed, axis }`. Returns `{ y }` or `{ x }` style object. **Disabled when `useReducedMotion()` is true** (returns static 0).
- New `src/components/ui/Parallax.tsx`: wrapper `<motion.div data-parallax style={{ y }}>` with `will-change: transform`.

Apply parallax in 3 high-impact places (kept subtle, GPU transform only):

1. **`HeroSection.tsx`** — background plasma `ShaderBackground` translates `y` at speed `0.3` (slower than scroll); foreground headline at speed `-0.1` (slight counter-drift); CTA stays static.
2. **`CategoryTiles.tsx`** — tile grid container shifts `y` at `0.08` for a gentle depth offset behind a static section header.
3. **`FeaturedExperiments.tsx`** — decorative blob/glow div (new, `pointer-events-none absolute -z-10`) parallaxes at `0.15`; cards untouched.

Constraints:
- Only translate, no scale/rotate (avoids layout thrash).
- Wrap parallax containers in `overflow-hidden` so transforms don't introduce horizontal scrollbars on mobile.
- No parallax on `<768px` unless user opts in — mobile defaults to static (avoids janky scroll on low-end devices and respects the existing mobile-first responsiveness rule).

### 3. Onboarding tour QA on mobile

Add per-step responsive options (no code changes to step content):

- Set `floaterProps={{ disableAnimation: prefersReducedMotion }}`.
- Add `scrollOffset: 80` so anchored steps don't sit under the navbar.
- For each step targeting an element (`hero-cta`, `categories`, `nav-menu`), set `placement: "auto"` and `placement: window.innerWidth < 640 ? 'bottom' : 'auto'` fallback — Joyride re-positions if clipped.
- Tooltip styles already cap at `min(92vw, 360px)`; add `arrowColor: 'hsl(var(--card))'` and pad action buttons (`buttonNext`, `buttonBack`) with `min-height: 44px` for tap-target compliance.
- Verify visually at three sandbox viewport widths: **320 (small)**, **375 (iPhone SE/12 mini)**, **414 (large phone)**. Use `browser--navigate_to_sandbox` + `browser--screenshot` to confirm:
  - Welcome step centered, not clipped.
  - Hero-CTA tooltip doesn't overlap the headline.
  - Nav-menu tooltip doesn't extend past viewport right edge.
  - Buttons (Skip / Back / Next) don't wrap awkwardly.
- Since the tour only runs once and is gated by `localStorage`, the QA pass will clear `virtulab-onboarding-completed-v1` before each screenshot.

### Files

**Created**
- `src/hooks/useParallax.ts`
- `src/components/ui/Parallax.tsx`

**Edited**
- `src/hooks/useAccessibility.ts` — system-pref union + export `useReducedMotion`.
- `src/index.css` — expanded `.reduce-motion` rules.
- `src/components/layout/PageTransition.tsx` — skip loader on reduced motion.
- `src/components/onboarding/OnboardingTour.tsx` — mobile placements, tap targets, reduced-motion gating.
- `src/components/home/HeroSection.tsx` — parallax on shader + headline.
- `src/components/home/CategoryTiles.tsx` — parallax on grid.
- `src/components/home/FeaturedExperiments.tsx` — parallax decorative layer.

No backend, no DB, no new dependencies.