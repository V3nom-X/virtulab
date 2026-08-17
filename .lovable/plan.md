# Experiment 101: Six Standalone Experiments

Finish the Experiment 101 work: build the four remaining simulations, expose each experiment as its own standalone card in the Library (no module hub card), add a decorated "2–3 new experiments every week" strip to the landing page, and verify everything end to end.

## 1. Four remaining simulations

New components in `src/components/experiment101/`, matching the interactive style of the two already built (`RemoteSensingSimulation`, `CurvedMirrorsSimulation`) and the existing module simulations:

- **PuritySimulation** (`pure-and-impure-substances`) — heating-curve mode: burner on/off, impurity slider (0–30%), live temperature vs time curve showing a sharp plateau when pure and a depressed, sloping range when impure; chromatography mode: spot a sample, solvent front rises, components separate, Rf values computed per component.
- **ChangesInSubstancesSimulation** (`temporary-and-permanent-changes`) — pick a process (melting ice, boiling water, burning paper/magnesium, rusting, dissolving salt, cooking an egg), run it forward, then attempt to reverse it. Reversible changes return to the start state; irreversible ones show new products, colour/gas cues and a "cannot be reversed" verdict, with a physical-vs-chemical classification readout.
- **ClassesOfFireSimulation** (`classes-of-fire`) — fire triangle canvas: choose fire class (A solid, B liquid, C gas, D metal, E electrical, F cooking oil), choose extinguisher (water, foam, CO2, dry powder, wet chemical, fire blanket), run the attempt. Correct pairings extinguish the animated flame; wrong ones escalate (water on electrical/oil flares up) with an explanation of which triangle side was removed.
- **CellExplorerSimulation** (`plant-and-animal-cell`) — side-by-side plant and animal cell canvas, clickable organelles with labels and functions, toggles for magnification and for showing only plant-unique parts (cell wall, chloroplast, large vacuole), plus a label-matching check.

All follow project rules: params held in refs and updated via `useEffect`, `requestAnimationFrame` loops cancelled on unmount, null checks on canvas dimensions, `ParamTooltip`-style scientific tooltips instead of persistent graphs (the purity heating curve is the one intentional plotted output), reduced-motion respected, and mobile-friendly layouts using the workspace flex pattern.

## 2. Each experiment standalone (no module card)

- New detail page `src/pages/Experiment101Detail.tsx` rendering one experiment from `experiment101Data.ts` with the existing module-page tab structure (Overview, Concepts, Applications, Simulation, Summary/Quiz), progress marking via `useExperiment101Progress`, a 2.5s `SimulationLoader` on mount, and "Back to Library" navigation.
- Route added in `src/App.tsx`: `/experiment/:experimentId` (lazy-loaded). No hub route, no module landing page.
- `src/pages/Library.tsx`: render the six experiments as six individual cards inside the regular experiments grid (so grid/list view, search and category filters apply to them), each linking to `/experiment/:id`, showing its own icon/thumbnail, category badge, difficulty, duration, and a completed check when its progress flag is set. No "Experiment 101" module banner is added.

## 3. Landing-page weekly-additions strip

A decorated strip on the home page (between the hero and the category tiles) stating that 2–3 new experiments are added every week: gold/midnight-blue gradient band with a subtle animated shimmer, calendar/sparkle icon, small "Updated weekly" pill, and a link to the Library. Uses semantic tokens only, honours reduced motion, and wraps cleanly at 320px.

## 4. Verification

- Full TypeScript typecheck.
- Playwright pass at 375px and 1280px: load the Library, open each of the six new experiments, switch through every tab, run each simulation (play/pause/reset), submit a quiz, and confirm progress persists; then smoke-test the existing modules (Separation of Mixtures, Acids & Bases, Excretory, Force and Energy, Reproductive) plus a Workspace experiment, capturing console errors and screenshots.
- Fix any defects found before reporting.

## Technical notes

- Files added: four simulation components, `src/pages/Experiment101Detail.tsx`, one home-page strip component.
- Files edited: `src/App.tsx` (route), `src/pages/Library.tsx` (six cards), `src/pages/Index.tsx` (strip).
- No database or backend changes; progress stays in `localStorage` under `virtulab-experiment101-progress`.
