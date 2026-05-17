## Reduced motion + parallax toggle + Analytics polish + Settings switch fix

### 1. Database: add `parallax_enabled` to `user_preferences`

Migration adds nullable boolean column `parallax_enabled` (default `true`) to `public.user_preferences`. RLS already exists. No new policies.

### 2. Parallax preference plumbing

- `useAccessibility.ts` — extend `Preferences` to include `parallax_enabled`, default `true`, fetch + realtime updates, expose on return value.
- New helper `useParallaxEnabled()` (same file) returns `(parallax_enabled !== false) && !reduceMotion`. Subscribes to `<html>` class changes and a CustomEvent (`virtulab:parallax-pref`) for instant cross-component updates.
- `useParallax.ts` — combine: `disabled = reduced || (!parallaxEnabled) || (isMobile && !enableOnMobile)`.
- `useAccessibility` toggles a `.parallax-off` class on `<html>` so CSS hides `[data-parallax-decor]` even if a component bypasses the hook.
- `src/index.css` — add `.parallax-off [data-parallax]{transform:none!important}` and `.parallax-off [data-parallax-decor]{display:none!important}`.

### 3. Settings page

- Add a new **Motion & Parallax** card (between Appearance and Accessibility) with two switches:
  - **Reduce Motion** (moved here from Accessibility, kept canonical there too via prop) — actually, leave Reduce Motion in Accessibility; add only **Parallax Effects** in the new card with a description "Subtle scroll-driven motion. Disables automatically on Reduce Motion."
  - Disable the Parallax switch when `preferences.reduce_motion` is true and show a small note.
- Fix the switch rendering on mobile: shadcn `<Switch>` ships fine on mobile; the issue is the parent `flex items-center justify-between` clipping it when the label text is long. Wrap the left text in `min-w-0 flex-1 pr-4` and add `shrink-0` to each `<Switch>` across all toggles in Settings. Also add `aria-label` so screen readers don't depend on the adjacent paragraph.
- Settings save handler already calls `upsert` — extend `Preferences` type with `parallax_enabled` and pipe through.

### 4. Analytics grid containment pass

Apply the same wrap/clamp/contain pattern already used for the badges grid to other tiles in `src/pages/Analytics.tsx`:

- Stats grid (`grid sm:grid-cols-2 lg:grid-cols-4`): each tile gets `min-w-0 overflow-hidden`; inner `<p className="text-2xl font-bold">` becomes `truncate` with `title={value}`; descriptive `<p>` gets `break-words leading-snug`. The bottom helper row (`+x this week`) gets `flex-wrap min-w-0`.
- Category Progress rows: name + count row uses `min-w-0`, name `truncate`, count `shrink-0`.
- Recent Activity items: container `min-w-0`; title `truncate`; meta line `truncate`; status badge `shrink-0`.
- All cards inside `.lg:col-span-2` get `min-w-0` so the right Badges column never gets pushed.

### 5. Parallax FPS / jank debug overlay

New component `src/components/dev/ParallaxPerfOverlay.tsx`:

- Fixed-positioned (bottom-left, `pointer-events-none`, tiny font, z-[200]).
- Uses `requestAnimationFrame` loop to compute rolling-1s FPS, max frame time, and total long-frame count (>50ms).
- Listens to `scroll` to mark "scrolling" vs idle so we can flag FPS drops only during scroll.
- Shows current parallax state (enabled / disabled-mobile / reduced-motion / user-off).
- Mounted globally in `App.tsx`, gated by:
  1. URL contains `?perf=1`, OR
  2. `localStorage.getItem('virtulab-perf-overlay') === '1'`.
- A keyboard shortcut `Shift+P` toggles the localStorage flag.
- Zero impact for normal users (component returns `null` unless flag set).

### 6. Cross-viewport onboarding QA

Use `browser--navigate_to_sandbox` + `browser--screenshot` at **320×568**, **375×812**, **414×896**, **768×1024**:

For each width:
1. Clear `localStorage.virtulab-onboarding-completed-v1` and reload.
2. Step through tour (`Next` via `browser--act`) and screenshot each step.
3. Verify: no tooltip clipped horizontally, no overlap with anchor element, buttons (Skip/Back/Next) keep 44px tap target.
4. Also verify with `prefers-reduced-motion` toggled on (set via `matchMedia` emulation through `browser--act` evaluating a script): canvases hidden, parallax decor hidden, page transitions skip loader.

QA notes recorded in the final response (no source changes unless a viewport breaks layout — then fix Joyride `placement` per step).

### 7. Video placeholder (no upload yet)

User said the video is coming. Don't add anything now beyond a note in the plan: when they upload, drop the file into `public/videos/parallax-hero.mp4`, and we'll wire a `<video autoPlay muted loop playsInline preload="metadata">` inside a new `Parallax` wrapper on the home page (likely between Hero and Categories). Will revisit on next turn when file is provided.

### Files

**Created**
- `src/components/dev/ParallaxPerfOverlay.tsx`
- New migration for `parallax_enabled` column.

**Edited**
- `src/hooks/useAccessibility.ts` — add `parallax_enabled`, expose helper, set/remove `.parallax-off`.
- `src/hooks/useParallax.ts` — gate on parallax pref.
- `src/index.css` — `.parallax-off` rules; ensure `[data-parallax-decor]` hides cleanly.
- `src/pages/Settings.tsx` — new Parallax toggle, switch wrap fixes, `min-w-0` + `shrink-0`.
- `src/pages/Analytics.tsx` — apply wrap/clamp/contain to stats, progress, activity.
- `src/App.tsx` — mount `ParallaxPerfOverlay`.

No backend logic beyond the column addition. No new dependencies.