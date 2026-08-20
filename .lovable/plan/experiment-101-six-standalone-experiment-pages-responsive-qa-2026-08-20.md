# Experiment 101: six standalone experiment pages + responsive QA

## Note on the magnetic dock
The magnetic dock was permanently removed earlier at your request, so there is nothing to check on the small breakpoints. If you want it back as a mini nav strip, say so and I'll add it as a separate step. The Matrix Rain shader (auth page) and the home nav strip will be checked at 320px, 375px, 414px and tablet.

## What gets built

### 1. Six standalone experiment pages
Each Experiment 101 entry becomes its own route with its own page, simulation, and quiz:

```text
/experiment-101/remote-sensing
/experiment-101/curved-mirrors
/experiment-101/pure-and-impure-substances
/experiment-101/temporary-and-permanent-changes
/experiment-101/classes-of-fire
/experiment-101/plant-and-animal-cell
```

Every page has: overview, learning outcomes, how it works, procedure, key concepts, applications, summary, the interactive simulation, and a quiz drawn from that experiment's own `quizQuestions`.

### 2. Per-experiment progress (not shared)
Progress is stored per experiment, so completing one no longer affects the others. Each experiment tracks its own quiz result and completion state independently, and the index page shows six separate progress states.

### 3. Module index page
`/experiment-101` lists all six with title, short description, icon/thumbnail, subject/level badges, and an individual "completed" marker. One Experiment 101 card is added to the Library page linking to this index.

### 4. Landing page strip
Decorated strip on the home page noting 2–3 new experiments are added every week.

### 5. Verification pass
- Typecheck.
- Playwright walkthrough of all six experiments: open page, interact with the simulation, answer and submit the quiz, confirm completion is recorded for that experiment only.
- Responsive check of the home nav strip and the Matrix Rain auth background at 320px, 375px, 414px and 768px, screenshots captured for overlap/clipping.

## Technical details
- New page `src/pages/Experiment101.tsx` (index) and `src/pages/Experiment101Detail.tsx` (generic detail page keyed off `:experimentId`), following the tab layout of `src/pages/ForceEnergyExperiment.tsx`.
- Simulation resolution via a switch mapping id to the existing six components in `src/components/experiment101/`.
- `src/hooks/useExperiment101Progress.ts` is reworked to per-experiment keys: `virtulab-experiment101-<id>-progress` storing `{ completed, quizScore }`, plus a helper that reads all six for the index page. Existing shared-array data is read once and migrated so nothing already completed is lost.
- Routes added in `src/App.tsx` as lazy imports; module card added to `src/pages/Library.tsx`; weekly strip added to `src/pages/Index.tsx`.
- No backend changes; progress stays in localStorage as with the other modules.
