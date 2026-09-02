# Finish the offline, reports, performance, a11y and builder work

The helper modules from the last pass exist but are not wired into the app yet:
`src/lib/offlineOutbox.ts`, `src/utils/experiment101Report.ts`, `src/lib/vlbFormat.ts`,
`src/lib/registerServiceWorker.ts`, `src/lib/renderBudget.ts` and `src/hooks/useDeviceTier.ts`.
`vite-plugin-pwa` is installed but not configured in `vite.config.ts`, and `main.tsx` never
calls the registration wrapper. This plan connects all of it and continues the builder.

## 1. Offline support for Experiment 101

- Configure `vite-plugin-pwa` (`generateSW`, `registerType: autoUpdate`, `injectRegister: null`,
`devOptions.enabled: false`) with `NetworkFirst` for page navigations, `CacheFirst` for hashed
assets and images, and `/~oauth` excluded from the navigation fallback.
- Call the existing guarded `registerServiceWorker()` from `main.tsx` so it never registers in
dev or the Lovable preview.
- Route Experiment 101 progress and quiz submissions through the offline outbox: queue writes
when offline, replay them on `online`, and show a small "saved offline / syncing" indicator on
the experiment page.
- Offline behaviour only takes effect in the published app, not in the editor preview.

## 2. Download report buttons

- Add a "Download report" control (PDF and CSV) to the Experiment 101 index page and to each
experiment page, using the existing report generator.
- PDF: header, learner name, date, summary (completed count, average score) and a per-experiment
table. CSV: one row per experiment with status, score, total, percentage, outcome.

## 3. WebGL performance budget

- Wire `useDeviceTier` into the Three.js / canvas simulations: clamp pixel ratio, disable
antialias and shadows on low tiers, scale geometry segment counts, and throttle the render loop
to the tier's target FPS.
- Pause rendering when a scene is offscreen or the tab is hidden (`useSceneVisible`).
- When the watchdog reports sustained low FPS, step the tier down; if the lowest tier still
can't hold frames, freeze to a static frame with a visible "Performance mode" notice and a
"Restore quality" button.

## 4. Accessibility audit and fixes

- Run an axe audit against the home, library, Experiment 101 index/detail and builder pages at
360px and desktop widths.
- Fix findings in quiz controls (radiogroup semantics, labelled options, keyboard-only answer
selection and submit, `aria-live` result announcements) and simulation navigation (labelled
play/pause/reset controls, labelled sliders, visible focus rings, logical focus order).
- Re-run axe after the fixes and report anything left.

## 5. `.vlb` save and open in the builder

- Add "Save as .vlb" and "Open .vlb" actions to the builder toolbar (and the mobile sheet).
- Save serialises current components, connections, variables, formulas and script with a
checksum. Open validates against the schema, verifies the checksum, rejects oversized or
malformed files with a clear message, and re-imports scripts only after passing the existing
script validator — imported scripts stay unexecuted until the user presses Run.

## 6. Builder realism and dock trim

- Remove the overlay placed earlier and continue the builder: richer component palette behaviour, working property edits reflected live  
in the 2D/3D preview, run/pause/reset with readable data output, and clearer empty/error states.
- Trim the magnetic dock on small screens to the main destinations only (Home, Library,
Experiment 101, Builder), showing the full set from `md` upwards, so it fits without horizontal
overflow at 320-414px.

## Verification

- Typecheck, then Playwright passes at 320px, 375px, 414px and tablet covering the dock, quiz
keyboard flow, report downloads, and a `.vlb` save/open round trip.