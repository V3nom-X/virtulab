## What I'll build

### 1. First-load guided onboarding tour (shown once)
- Add `react-joyride` (lightweight, mobile-friendly, accessible).
- New `src/components/onboarding/OnboardingTour.tsx` mounted globally in `App.tsx` after `AuthProvider`.
- Steps (in order, with `data-tour` anchors on real elements):
  1. Welcome (centered modal on `/`)
  2. Hero CTA → "Start exploring"
  3. CategoryTiles → "Browse science modules"
  4. Navbar menu → "Library, Builder, Community, Videos"
  5. Auto-navigate to `/library` → highlight search + experiment cards
  6. Highlight `ExperimentRequestBox` → "Request new experiments"
  7. Navigate to `/builder` → "Build your own"
  8. Done → CTA back to `/`
- Persistence: `localStorage` key `virtulab-onboarding-completed-v1` set on finish/skip. Tour ONLY runs if key is absent and user has loaded for ≥1.5 s (so it doesn't fight the page transition).
- Mobile UX: tooltip `maxWidth: 92vw`, `disableScrollParentFix: true`, sticky-safe placement with `floaterProps`, fallback to `placement: 'center'` when target clipped. Close (X) and Skip always reachable; buttons stack vertically <380 px.

### 2. Embedded video tutorial layout (mobile)
- In `src/pages/Videos.tsx`: wrap each embedded iframe in `aspect-video w-full max-w-full overflow-hidden rounded-lg`; cap tab list with `overflow-x-auto`; ensure header gap `gap-3 md:gap-6`; controls (search + filter chips) inside `flex-wrap` with `min-w-0`. No fixed widths under `sm:`.

### 3. Eliminate flash before page transition
- Update `src/components/layout/PageTransition.tsx`:
  - Show the loader **synchronously on the same render** that detects a location change by computing `isLoading` from `location.key !== prevKeyRef.current` during render (not in `useEffect`).
  - Render children inside a wrapper that only mounts when `!isLoading`, so the new route never paints before the overlay.
  - Reduce `LOADING_DURATION` from 4000 ms → 1200 ms (still satisfies "show loader before page change" rule, removes feel of latency).
- Wrap `<Routes>` in `<Suspense fallback={null}>` and lazy-load heavy pages (Builder, Workspace, simulation routes) so the loader hides actual code-split fetches.

### 4. Admin: experiment requests review section
- New `src/components/admin/ExperimentRequestsManagement.tsx`:
  - Lists rows from `experiment_requests` (pending first), filter chips (All / Pending / Approved / Rejected), real-time refresh.
  - Each row: title, category, description (collapsible), submitter (joined `profiles`), date, status badge.
  - Actions: **Approve** / **Reject** buttons → update `status` (uses existing RLS admin update policy). Toast on success.
- Add new tab `requests` in `src/pages/Admin.tsx` Tabs list with an `Inbox` icon and unread (pending) count badge.

### 5. Performance & rendering optimization
- `React.lazy` + `Suspense` for: Builder, Workspace, all `*Experiment` pages, all simulation modules. (Cuts initial bundle ~40–60 %.)
- Memoize hot lists: `Library` grid, `Community` cards, `Admin` rows (`memo` + stable `key`).
- Add `will-change: transform` and `contain: layout paint` to simulation canvases.
- Debounce search inputs (Library, Community, Videos, Admin) with 200 ms `useDeferredValue`.
- Replace n+1 query in `Community.tsx` (per-experiment likes/comments/profile fetch in a loop) with single aggregated queries grouped client-side.
- Add `<link rel="preconnect">` for Supabase + Fonts in `index.html`.

### 6. Security tightening (no breaking changes)
- Run `supabase--linter`, fix any flagged warnings (e.g., function search_path, missing indexes).
- Add server-side validation trigger for `experiment_requests` (title 3–150, desc 10–2000, status in enum set).
- Tighten `vite.config.ts` build: drop `console`/`debugger` in prod.
- Add CSP `<meta>` in `index.html` (script-src self + supabase + lovable, frame-src youtube for video page).

### 7. Responsive polish (no overlaps/overflows)
- Global utility additions in `index.css`: `.safe-x { max-width: 100vw; overflow-x: hidden; }` on `body` already present — also add `min-w-0` defaults to flex children via helper class.
- Audit + fix: `BackButton` placement on pages with their own headers; `Navbar` icon row collisions <360 px (hide non-essential, keep menu + theme); `Workspace` toolbar wraps; `Admin` Tabs list `overflow-x-auto`; `Community` header button stacks under heading on mobile; long titles truncate with `truncate` not wrap.
- Verify with viewport set to 360 × 641, 390 × 844, 768 × 1024.

### 8. Community page changes
- In `src/pages/Community.tsx`:
  - Replace **"Upload Experiment"** button (line 246) with **"Build an Experiment"** + `Coming Soon` badge, disabled.
  - Remove "Active Challenges" sidebar card (lines 441+) and the entire `challenges` state/fetch. Replace with a single placeholder card: "Challenges — Coming Soon" using existing `ComingSoonOverlay` component pattern.

## Technical details

**Files created**
- `src/components/onboarding/OnboardingTour.tsx`
- `src/components/admin/ExperimentRequestsManagement.tsx`
- `src/hooks/useOnceFlag.ts` (localStorage helper)

**Files edited**
- `src/App.tsx` (lazy routes, mount tour, Suspense)
- `src/components/layout/PageTransition.tsx` (synchronous loader, shorter duration)
- `src/pages/Admin.tsx` (new Requests tab)
- `src/pages/Community.tsx` (Build CTA + remove challenges)
- `src/pages/Videos.tsx` (mobile layout fixes)
- `src/pages/Library.tsx`, `Workspace.tsx`, `Builder.tsx` (add `data-tour` anchors, memo)
- `src/components/layout/Navbar.tsx`, `BackButton.tsx` (small-screen collision fixes)
- `src/index.css` (safe utilities, overflow guards)
- `index.html` (preconnect, CSP meta)
- `vite.config.ts` (esbuild drop console)

**Dependencies**
- `react-joyride` (~30 kB gz)

**Migration**
- Validation trigger on `experiment_requests` (length + status enum). No schema change.

**Out of scope**
- No new tables, no auth flow changes, no Capacitor changes.
