# Experiment 101 Module — Six CBE-Aligned Experiments

Add the six experiments from the Experiment 101 guide as a new module, following the exact structure already used by Force and Energy, Acids & Bases, and the other modules (module landing page, per-experiment page with tabs, interactive canvas simulation, quiz, localStorage progress).

## The six experiments

1. **Remote Sensing – Eyes in the Sky** (Earth & Space) — pick platform (satellite / aircraft / drone), sensor (optical / infrared / radar), altitude, spatial resolution, spectral band, cloud condition, revisit day. Canvas renders a stylised Kenyan region that sharpens/blurs with resolution, blocks optical capture under cloud while radar still works, and has an NDVI filter that recolours healthy vs stressed vegetation. Advancing the simulated calendar (30/60/90 days) shows seasonal change.
2. **Curved Mirrors – The Physics of Reflection** (Physics) — concave/convex toggle, focal length, object distance and height sliders. Ray-diagram canvas draws principal rays, locates the image, and reports image distance, magnification, and real/virtual + upright/inverted status computed from the mirror formula.
3. **Pure and Impure Substances** (Chemistry) — choose a substance and add a chosen level of impurity, then heat it: a live temperature-vs-time graph shows a sharp flat melting point for pure samples and a depressed, sloping range for impure ones. Includes a chromatography mode where a sample separates into spots with calculated Rf values.
4. **Temporary and Permanent Changes** (Chemistry) — pick a process (melting ice, dissolving salt, boiling water, burning paper, rusting iron, cooking egg, ripening fruit), run it forward, then attempt to reverse it. Reversible processes return to the start state; permanent ones cannot, with a verdict panel explaining why.
5. **Classes of Fire – Fighting Fire Safely** (Safety / Chemistry) — pick a fuel type (wood/paper, petrol, live electrical, reactive metal, cooking oil) and an extinguishing agent (water, foam, CO2, dry powder, wet chemical, fire blanket). Animated fire either dies down or flares dangerously, with a fire-triangle panel showing which element was removed and a class label (A–F).
6. **Plant and Animal Cell** (Biology) — switchable plant/animal cell viewer with zoom, clickable organelles that show name + function, a comparison mode highlighting cell wall, chloroplasts, and vacuole differences, and a labelling exercise for self-testing.

Each experiment page carries the guide's content: introduction and learning outcomes, how the simulation works, parameter table, step-by-step procedure, real-life Kenyan applications, advantages, summary, and the guide's quick-check questions as a scored quiz.

## Landing page addition

A decorated strip on the home page (below the hero) announcing that **2–3 new experiments are added every week** — gold accent badge, pulsing indicator dot, and supporting line, using existing design tokens and respecting reduced motion.

## Technical notes

- `src/data/experiment101Data.ts` — content for all six experiments, typed like `forceEnergyData.ts`.
- `src/components/experiment101/` — six simulation components (`RemoteSensingSimulation`, `CurvedMirrorsSimulation`, `PuritySimulation`, `ChangesInSubstancesSimulation`, `ClassesOfFireSimulation`, `CellExplorerSimulation`), canvas/SVG based, params held in refs and updated via `useEffect`, with `ParamTooltip` on sliders and no persistent graphs in the workspace except the purity heating curve (which is the experiment's point).
- `src/hooks/useExperiment101Progress.ts` — `virtulab-experiment101-progress` localStorage key, total 6.
- `src/pages/Experiment101.tsx` and `src/pages/Experiment101Experiment.tsx`, lazy-loaded routes `/experiment-101` and `/experiment-101/:experimentId` in `App.tsx`, plus a module card in `src/pages/Library.tsx`.
- `SimulationLoader` overlay on simulation mount; mobile-responsive layout (stacked controls, drawer-free single column under `md`).
- Home page strip added as a small component rendered from `src/pages/Index.tsx`.

## Verification pass

After building: typecheck, then drive the preview with Playwright to load `/experiment-101`, open each of the six experiments, exercise each simulation's controls, and check the console for errors — plus a spot check that the existing modules and `/library` still load cleanly. Fix anything the pass surfaces.
