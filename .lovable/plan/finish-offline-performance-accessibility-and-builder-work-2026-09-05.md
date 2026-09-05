# Finish offline, performance, accessibility and builder work

Six workstreams, each shippable on its own.

## 1. Installable app + offline caching in the published app

The web app manifest file already exists but the page never points at it, so browsers can't install the app. Add the manifest link, theme colour and Apple home-screen tags to the page head so the published app is installable and the offline cache activates. Offline behaviour stays disabled inside the editor preview (by design) and works only on the published site.

## 2. Scale 3D and animated scenes to the device

Every WebGL scene and animated canvas gets connected to the existing device-capability tier (low / medium / high):
- Pixel ratio capped, antialiasing and shadows switched off on weak devices, lower-detail geometry, fewer lights.
- Animation loops throttled to the tier's target frame rate and paused when the scene scrolls off screen or the tab is hidden.
- Applies to the builder 2D preview and 3D preview/canvas, the molecule viewer, the transform tools, the shader background, and the Experiment 101 canvas simulations.

## 3. Static-frame fallback when frames drop

If frame rate stays very low even at the lowest setting, the scene freezes on a still frame with a small "performance mode" notice and a button to turn full motion back on. Controls and readouts stay responsive. The existing performance overlay shows the current tier so this is observable.

## 4. Accessibility audit + responsive keyboard tests

New automated tests run the app at 320, 375, 414 and 768 px wide and check:
- Dock: visible, no sideways page scroll, every item reachable and named, tab order enters and leaves cleanly, no overlap with the assistant bubble or the back button.
- Matrix rain on the sign-in page: renders behind the glass panel, readable through it, absent when reduced motion is on.
- Home nav strip: renders, scrolls with the page, search opens and closes, dropdown works by keyboard, nothing clipped at 320 px.
- Keyboard-only pass through sign-in, an experiment, and its quiz.

An automated accessibility scan runs on the main routes; findings (labels, contrast, landmarks, focus order, tap-target size) get fixed and the scan re-run until clean.

## 5. Real drag and drop on the builder canvas

Today a palette item can be tapped and it lands at an arbitrary spot. Instead:
- Drag a palette item and drop it exactly where the pointer is, on desktop (mouse drag) and on touch (press-and-hold then drag), with a preview following the pointer and a drop highlight on the canvas.
- Snap-to-grid, alignment guides, and a rejected-drop state when the target is invalid.
- Existing items can be dragged to reposition, multi-selected, nudged with arrow keys, and there is a keyboard route to place an item for people who can't drag.
- 3D canvas: drop places the object on the ground plane under the pointer.

## 6. More realistic builder: 3D objects, motion, and .vlb files

- 3D components stop being plain blocks: each gets a modelled shape appropriate to what it is (beaker, flask, burner, stand, clamp, mass, spring, ramp, pulley, cart, lens, magnet, battery, bulb, wire), with proper materials — glass with transparency, brushed metal, matte plastic — plus soft shadows and a reflective environment.
- 2D and 3D motion made physically believable: gravity, damping, collisions and springs behave to scale, liquids slosh and pour, flames flicker, pendulums and springs settle naturally, all frame-rate independent.
- Save and open: opening a `.vlb` experiment file restores components, connections, variables, formulas and scripts onto the canvas (imported scripts still pass the safety check before they can run), and saving writes the file back. Drag a `.vlb` onto the canvas to open it.

## 7. Leftovers from the previous round

- Cloud-backed progress and quiz results queued while offline resync on reconnect, newest change winning.
- Final full check: type check, build, the new tests, and the accessibility scan all green.

## Technical notes

- Head tags: `manifest`, `theme-color`, `apple-touch-icon` in `index.html`; registration stays behind the existing preview-safe guard in `src/lib/registerServiceWorker.ts`.
- Tiering: consume `useDeviceTier` / `useSceneVisible` and `renderBudget.segments`/`effectivePixelRatio` in `Builder3DCanvas`, `Builder3DPreview`, `BuilderPreview`, `TransformGizmo`, `MoleculeVisualization`, `ShaderBackground`, and the Experiment 101 canvas simulations.
- Tests: Playwright specs in `tests/e2e/` (`dock.spec.ts`, `matrix-rain.spec.ts`, `home-nav.spec.ts`, `a11y.spec.ts`) using `@axe-core/playwright`, both already installed; a `playwright.config.ts` with the four viewport projects against the dev server.
- Drag and drop: pointer-events based controller in `DragDropCanvas` replacing click-to-add, reusing `useDragDrop` for touch long-press; `ComponentPalette` keeps HTML5 drag for desktop; raycast to a ground plane for 3D placement.
- 3D realism: hand-built geometry groups per component type in `src/data/builder3DComponents.ts` + a new `src/lib/builder3DMeshes.ts`, `MeshPhysicalMaterial` for glass, local `Environment`/lightformer-style IBL (no CDN presets).
- `.vlb`: wire `src/lib/vlbFormat.ts` open/export into `Builder.tsx` state restore, plus drop-zone handling.
