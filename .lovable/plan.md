
# Separation of Mixtures Module - Implementation Plan

This plan implements a comprehensive "Separation of Mixtures" module with 7 interactive experiments, following the existing simulation architecture patterns and the design specifications provided.

---

## Phase 1: Module Infrastructure

### 1.1 New Route and Page
Create a new page `src/pages/SeparationOfMixtures.tsx` and add route `/separation-of-mixtures` in `App.tsx`.

The page serves as the **Module Overview Screen** with:
- Royal green gradient background (`#006400`)
- Animated hero section with beaker illustration (CSS/SVG animated)
- Title: "Separation of Mixtures" with subtitle
- Three navigation buttons: "Start Experiment", "Theory & Concepts", "Applications in Real Life"
- Scrollable experiment selection cards below

### 1.2 Experiment Selection Menu
Within the same page, a card-based experiment list:
- **Evaporation** - Separate salt from water using heat
- **Crystallization** - Form pure crystals from saturated solutions
- **Simple Distillation** - Separate liquids by boiling point differences
- **Fractional Distillation** - Separate liquids with close boiling points
- **Sublimation** - Separate solids that change directly to gas
- **Solvent Extraction** - Separate using immiscible liquids
- **Chromatography** - Separate dyes by movement rate

Each card shows icon, name, short description, and "Enter Experiment" button.

### 1.3 Individual Experiment Page
Create `src/pages/SeparationExperiment.tsx` with route `/separation-of-mixtures/:experimentId`.

Layout uses **tabbed navigation** with 6 sections:
1. **Overview** - How it works (scrollable text from the document)
2. **Concepts** - Accordion-style key scientific concepts
3. **Applications** - Real-life application cards
4. **Simulation** - Interactive canvas with controls
5. **Analysis** - Observation tables and graphing
6. **Summary** - Key points and quiz

---

## Phase 2: Educational Content Data

### 2.1 Create `src/data/separationExperiments.ts`
A large data file containing all 7 experiments with structured content extracted from the uploaded document:

For each experiment:
- `id`, `title`, `icon`, `description`
- `overview`: Full explanation text (~1100 words condensed to key paragraphs)
- `howItWorks`: Step-by-step process array
- `keyConcepts`: Array of `{title, description}` objects (Solubility, Boiling Point, etc.)
- `applications`: Array of `{title, description}` real-life uses
- `summary`: Bullet points of key takeaways
- `quizQuestions`: 3-5 multiple choice questions per experiment
- `simulationConfig`: Parameters for each simulation (temperature ranges, substances, etc.)

Content is sourced directly from the 50-page document covering all 7 experiments.

---

## Phase 3: Interactive Simulations (Canvas-based)

### 3.1 Create `src/components/separations/SeparationSimulation.tsx`
A unified canvas-based simulation component that renders different experiments based on type. Uses the same `forwardRef` + `useImperativeHandle` pattern as existing simulations.

Each simulation includes:
- **Control Panel**: Heat/Cool slider, Start/Pause/Reset, substance selector
- **Canvas Visualization**: Animated particles, liquid levels, vapour, crystal formation
- **Temperature/Volume Display**: Real-time readings

### 3.2 Individual Simulation Renderers
Seven rendering functions within the component, one per experiment:

1. **Evaporation**: Beaker with salt solution, heat source below. Water particles escape as vapour, liquid level drops, salt crystals appear at bottom. Temperature slider controls evaporation rate.

2. **Crystallization**: Beaker with copper sulfate solution. Heat dissolves more solid, then cooling slider causes crystal lattice formation. Particles visually arrange into geometric patterns.

3. **Simple Distillation**: Full apparatus - flask, condenser, receiving flask. Vapour travels through condenser, condensation droplets form, distillate collects. Thermometer shows temperature.

4. **Fractional Distillation**: Flask with fractionating column. Color-coded particles (ethanol=blue, water=red). Temperature gradient in column. Fractions collected separately.

5. **Sublimation**: Evaporating dish with ammonium chloride + sand mixture. White particles rise as vapour, deposit on inverted funnel surface as crystals. Sand remains.

6. **Solvent Extraction**: Separating funnel with two immiscible liquid layers. Shake/mix animation, settling, stopcock drain control. Density-based layer separation.

7. **Chromatography**: Paper strip in beaker with solvent. Capillary action moves solvent up, ink spot separates into colored bands at different heights. Rf value calculation.

All simulations use 2D Canvas rendering with particle animations, consistent with the existing simulation architecture.

---

## Phase 4: Analysis and Gamification

### 4.1 Observation Tables
Pre-filled tables within each experiment's Analysis tab:
- Evaporation: Temperature vs. liquid volume remaining
- Crystallization: Cooling rate vs. crystal size
- Distillation: Temperature vs. volume collected
- Chromatography: Rf value calculation table

### 4.2 Quiz Component
Reuse the existing `QuizSystem` component pattern for "Check Your Understanding" quizzes at the end of each experiment summary.

### 4.3 Progress Tracking
Simple local state progress bar showing completion percentage across the 7 experiments. Badge awards: "Evaporation Expert", "Crystallization Master", "Chromatography Champion", etc.

---

## Phase 5: Navigation and Polish

### 5.1 Link from Library
Add the Separation of Mixtures module as a featured card in the Library page, linking to `/separation-of-mixtures`.

### 5.2 Visual Style
- Royal green (`#006400`) as primary accent throughout the module
- Black buttons with white text for CTAs
- Smooth particle animations using requestAnimationFrame
- Tooltips on apparatus parts explaining their function

---

## Files to Create
1. `src/pages/SeparationOfMixtures.tsx` - Module overview + experiment selection
2. `src/pages/SeparationExperiment.tsx` - Individual experiment page with tabs
3. `src/data/separationExperiments.ts` - All educational content for 7 experiments
4. `src/components/separations/SeparationSimulation.tsx` - Unified simulation canvas
5. `src/components/separations/SeparationAnalysis.tsx` - Observation tables and graphs
6. `src/components/separations/ExperimentCard.tsx` - Reusable experiment selection card

## Files to Modify
1. `src/App.tsx` - Add two new routes
2. `src/pages/Library.tsx` - Add link to the module

## No New Dependencies Required
Uses existing Canvas API, React, and UI components. Matter.js is already installed for optional physics enhancements.

---

## Implementation Priority
Given the scale, the implementation will proceed in order:
1. Data file with all 7 experiments' content (largest piece)
2. Module overview page with experiment cards
3. Individual experiment page with tabs (Overview, Concepts, Applications)
4. Simulation canvas for all 7 experiments
5. Analysis tables and summary/quiz sections
6. Route registration and Library integration
