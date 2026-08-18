# Experiment 101: finish the module

Four of six simulations exist (`RemoteSensingSimulation`, `CurvedMirrorsSimulation`, `PuritySimulation`, `ChangesInSubstancesSimulation`). Content for all six experiments and the progress hook already exist. Nothing is routed or linked yet, so the module is currently unreachable in the app.

## 1. Build the two missing simulations

**Classes of Fire** (`src/components/experiment101/ClassesOfFireSimulation.tsx`)
- Interactive fire-triangle SVG (fuel, heat, oxygen) that visibly breaks when an extinguishing method removes a side.
- Pick a fire scenario (Class A solids, B flammable liquids, C gases, D metals, E electrical, F cooking oils), pick an extinguisher (water, foam, CO2, dry powder, wet chemical, fire blanket), then attempt to extinguish.
- Verdict panel: extinguished / ineffective / dangerous (e.g. water on electrical or oil fires), with the reason and the correct agent.
- Animated flame that shrinks and dies out on a correct match, flares on a dangerous one.

**Plant and Animal Cell** (`src/components/experiment101/CellExplorerSimulation.tsx`)
- Side-by-side SVG plant and animal cell with clickable organelles; selecting one shows name, function, and whether it is present in one or both cells.
- Zoom/magnification control, a labels on/off toggle, and a compare mode highlighting plant-only structures (cell wall, chloroplast, large vacuole).
- Short label-matching challenge at the end that reports a score.

Both follow the existing pattern: self-contained component, shadcn controls, semantic tokens only, reduced-motion respected.

## 2. Module index page

`src/pages/Experiment101.tsx` at route `/experiment-101`:
- Header with module title, short intro, and progress bar driven by `useExperiment101Progress` (x of 6 complete).
- Card grid: one card per experiment with thumbnail, icon, title, subtitle, one-line description, subject/level badges, completion tick, and a link to its detail page.
- Thumbnails: generate six images into `src/assets/experiment101/` and map them in a small registry so no generic placeholders are used.

## 3. Detail page + routing

`src/pages/Experiment101Detail.tsx` at `/experiment-101/:experimentId`, modelled on `ForceEnergyExperiment.tsx`:
- Back link to the module index, header with icon/title/badges.
- Tabs: Simulation (mapped by id), Learn (overview, how it works, parameters, procedure, key concepts, applications, advantages, summary in accordions), Quiz.
- Quiz uses the `quizQuestions` data; on pass, calls `markComplete(id)` so the index progress and the shared badge/progress pattern update.
- `SimulationLoader` overlay on mount, consistent with other modules.

Wire into `src/App.tsx` as lazy routes, and add an "Experiment 101" module card to `src/pages/Library.tsx` alongside the existing module cards.

## 4. End-to-end walkthrough

After wiring, run a typecheck and a Playwright pass over all six experiments: load each detail page, exercise the simulation controls, complete a quiz, and confirm progress persists across reload and that the index shows the correct completion count. Report anything broken rather than silently patching around it.

## Notes

- Progress stays in `localStorage` via the existing `virtulab-experiment101-progress` key (`total: 6` already set).
- No backend or schema changes.
