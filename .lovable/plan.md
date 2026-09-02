# Finish offline, reports, GPU budget, a11y, .vlb, and builder realism

Six workstreams, shippable in order. The groundwork already exists (`renderBudget.ts`, `useDeviceTier.ts`, `experiment101Report.ts`, `offlineOutbox.ts`, `registerServiceWorker.ts`, `manifest.webmanifest`), so most of this is wiring and finishing.

## 1. PWA offline for Experiment 101

- Add `vite-plugin-pwa` (`generateSW`, `registerType: autoUpdate`, `injectRegister: null`, `devOptions.enabled: false`) so the only registrar stays the existing guarded wrapper — never in dev, iframes or Lovable preview hosts.
- Precache the app shell, fonts, logo and poster image. Runtime caching: `NetworkFirst` for navigations (excluding `/~oauth`), `CacheFirst` for hashed build assets and experiment images. The cinematic video stays network-only.
- Register the wrapper from `main.tsx`, link the manifest and icons from `index.html`.
- Quiz submissions and progress made offline queue through `offlineOutbox` and flush on `online`; an "Offline — saved locally" / "Syncing" indicator appears on the Experiment 101 pages. Cloud vs local progress reconciles by newest timestamp.

Offline behaviour only applies to the published app, not the editor preview.

## 2. Download report buttons

- On the Experiment 101 index: a "Download report" split action for PDF and CSV covering all six experiments.
- On each experiment page: the same action scoped to that experiment.
- PDF is a branded certificate-style sheet (learner name from profile, date, table of experiments with status, score, percentage, pass/fail, overall completion); CSV carries the same rows.
- Reports work offline from local records, merged with cloud quiz results when signed in.

## 3. Device tier + low-FPS fallback in WebGL scenes

Consume `useDeviceTier` / `renderBudget` in `Builder3DPreview`, `Builder3DCanvas`, `TransformGizmo`, `MoleculeVisualization`, `EMSpectrumVisualization` and the shader background:

- Cap pixel ratio, drop antialiasing/shadows and reduce geometry segments and light count on lower tiers.
- Pause rendering when the canvas scrolls out of view or the tab is hidden (`useSceneVisible`).
- Watchdog steps the tier down after sustained low FPS; at the floor it freezes to a static frame with a "Performance mode" notice and a manual re-enable button.
- The FPS overlay gains a tier readout so the behaviour is observable.

## 4. Accessibility audit and fixes

Run an axe pass (Playwright + `@axe-core/playwright`) over home, library, auth, an Experiment 101 page, a simulation workspace and the builder, then fix:

- Quiz: options as a real radiogroup with arrow-key selection, question progress exposed to assistive tech, results announced via a live region, focus moving to the next question.
- Simulations: accessible names on every icon-only control, `aria-valuetext` in real units on sliders, a text summary alternative for each canvas, an accessible keyboard-shortcut legend, and outcomes never conveyed by colour alone.
- Navigation: logical focus order, visible focus rings, 44x44 px tap targets, working skip link, one `<main>` per route.

Fixes use Radix/shadcn primitives rather than hand-rolled keyboard handling. Re-run axe until the audited routes are clean.

## 5. `.vlb` save and open

- Finish `src/lib/vlbFormat.ts`: versioned JSON document (metadata, canvas mode, components, connections, variables, formulas, scripts, checksum) with a zod schema, serialise, parse, validate and migrate helpers.
- Builder toolbar gains "Save to file" (downloads `<name>.vlb`) and "Open file" (picker plus drag-and-drop onto the canvas).
- Import validates the schema, migrates older versions, and refuses malformed or newer-version files with a clear message. Imported scripts are inert until they pass the existing `scriptSandbox` validation, and always run inside the Web Worker sandbox.
- Imports land in the undo history so an accidental open is reversible.

## 6. Builder realism pass

Make a built experiment behave like a real one rather than a diagram:

- Real 2D physics: components map to Matter.js bodies with mass, friction and restitution honoured, gravity from the physics presets, and collisions that produce measurable data.
- Connections carry values (force, current, heat, flow) between components instead of being decorative; the properties panel exposes the units.
- Live instrumentation: sensors/meters stream into the data output panel and the Chart.js panel in real time, with CSV/JSON export of the run.
- Run controls: play, pause, step, reset with deterministic reset back to initial parameters (initial params kept in refs so the world is not re-created on every change).
- 3D mode keeps parity: transform gizmos, grid snapping and the same value-carrying connections, under the tier budget from section 3.

## Technical notes

- PWA: `vite-plugin-pwa` (`generateSW`) + existing `src/lib/registerServiceWorker.ts`; outbox in IndexedDB via `idb-keyval`.
- Reports: `jspdf` + `jspdf-autotable`; new UI in `src/pages/Experiment101.tsx` and `src/pages/Experiment101Detail.tsx`.
- Tests: Playwright specs under `tests/e2e/` at 320/375/414/768 px, plus the axe pass; Vitest unit tests for the `.vlb` parser and report row builder.
- `.vlb` MIME type `application/vnd.virtulab.experiment+json`; a manifest `file_handlers` entry lets an installed desktop PWA open `.vlb` files directly.
