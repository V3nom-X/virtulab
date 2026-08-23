# VirtuLab: dock revival, a11y, mobile GPU budget, reports, offline, .vlb

Six workstreams. Each is independent, so they can ship in order without blocking one another.

## 1. Bring back the magnetic dock + responsive Playwright suite

The dock was deleted earlier, so it gets rebuilt from scratch as a mini nav strip directly under the main navbar: horizontally scrollable, keyboard reachable, never overlapped by the AURA chat bubble, and hidden entirely under reduced motion (falls back to a plain icon row).

New Playwright specs run at 320, 375, 414 and 768 px and assert:
- Dock: visible, no horizontal page overflow, every item is a real link with an accessible name, magnetic hover scaling only on pointer devices, tab order enters and exits cleanly, no overlap with the AURA launcher or the back button.
- Matrix Rain (auth page): canvas mounts, sits behind the glass panel, is readable through it, drop length scales up at tablet width, and does not render when reduced motion is on.
- Home nav strip: renders, scrolls with the page (non-sticky), search expands and collapses, dropdown navigation works by keyboard, no clipped items at 320 px.

Tests live in `tests/e2e/` and run headless against the dev server.

## 2. Accessibility audit and WCAG 2.1 fixes

Audit and fix quizzes, simulations and responsive navigation:
- Quizzes: options become a real radiogroup with arrow-key selection, results announced through a live region, per-question progress exposed to screen readers, focus moves to the next question rather than resetting to the top.
- Simulations: every icon-only control (play, pause, reset, export, fullscreen) gets a label; sliders get `aria-valuetext` in real units; canvases get a text summary alternative; keyboard shortcuts documented in an accessible legend; results conveyed by text, not colour alone.
- Navigation: single `<main>` per route, logical focus order, visible focus rings, 44x44 px minimum tap targets, skip-to-content link.

Fixes use Radix/shadcn primitives rather than hand-rolled keyboard handling. Verified with a keyboard-only Playwright pass plus an axe scan on the main routes.

## 3. Low-end mobile optimisation for WebGL

A shared device-capability tier (low / medium / high) derived from device memory, CPU cores, pixel ratio and a short startup FPS probe, applied to all Three.js scenes and the shader backgrounds:
- Pixel ratio capped (1.0 on low tier, 1.5 on medium), antialiasing and shadows off on low tier, lower-poly geometry and fewer lights.
- Render-on-demand instead of a continuous loop where the scene is static.
- Live watchdog: if FPS stays under ~24 for two seconds, step down one tier; if it stays under ~15 at the lowest tier, freeze to a static poster frame with a "performance mode" notice and a manual re-enable button.
- Rendering pauses when the canvas scrolls out of view or the tab is hidden.

The existing FPS overlay gains a tier readout so the behaviour is observable.

## 4. Experiment 101 progress report (PDF + CSV)

A "Download report" action on the Experiment 101 index page (and per experiment) produces:
- **PDF**: branded certificate-style report — learner name from their profile, generated date, a table of all six experiments with status, quiz score, percentage and pass/fail, plus overall completion.
- **CSV**: same rows for spreadsheets.

Data comes from the existing per-experiment localStorage records, merged with cloud quiz results when signed in.

## 5. PWA offline support for Experiment 101

Installable app plus offline caching, implemented through the platform PWA approach so preview builds are never affected:
- Precache the app shell, Experiment 101 routes, fonts and simulation assets.
- Runtime caching for images and the hero poster; the cinematic video stays network-only.
- Quiz submissions and progress made offline queue locally and resync on reconnect, with an offline/queued indicator in the UI.
- Cloud-backed progress reconciles by newest timestamp on reconnect.

## 6. Custom `.vlb` experiment format

Yes — this is very doable, since a builder experiment is already structured data.

- `.vlb` is a JSON document with a version field, metadata (title, description, author, created/modified), the canvas mode (2D/3D), components, connections, variables, formulas and scripts, plus a checksum.
- **Export**: downloads `my-experiment.vlb` from the builder.
- **Import**: file picker and drag-and-drop onto the canvas, with schema validation, version migration for older files, and a clear error when a file is malformed or from a newer app version. Imported scripts pass through the existing script sandbox validation before they can run.
- **File association**: the app registers `.vlb` as a handled file type so that, once installed as a PWA on a supporting desktop browser, double-clicking a `.vlb` opens it straight in the builder. Browsers and mobile platforms that do not support file handling still work through import.

## Technical notes

- Tests: Playwright specs in `tests/e2e/`, plus `@axe-core/playwright` for the accessibility pass; Vitest config added for unit-level checks of the `.vlb` parser and report generators.
- Dock: rebuilt as `src/components/layout/AppDock.tsx` with framer-motion magnetic scaling, mounted in `Layout.tsx` beneath `Navbar`, `overflow-x-auto`, z-index below the AURA launcher.
- Capability tiering: new `src/hooks/useDeviceTier.ts` and `src/lib/renderBudget.ts`, consumed by `Builder3DPreview`, `Builder3DCanvas`, `MoleculeVisualization`, `TransformGizmo` and `ShaderBackground`.
- Reports: `jspdf` + `jspdf-autotable` for PDF, existing CSV helper style in `src/utils/exportData.ts`; new `src/utils/experiment101Report.ts`.
- PWA: `vite-plugin-pwa` with the preview-safe registration guard, manifest with icons and a `file_handlers` entry for `.vlb`, and an outbox in IndexedDB for queued quiz/progress writes.
- `.vlb`: `src/lib/vlbFormat.ts` (serialise, parse, validate, migrate) with a zod schema; MIME type `application/vnd.virtulab.experiment+json`.
