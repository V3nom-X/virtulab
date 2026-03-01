
# Plan: Reproductive System Enhancements, Shimmer Button Verification, and Force & Energy Testing

## Overview
This plan covers four tasks: (1) adding a fertilization animation to the female reproductive simulation, (2) adding drag-and-drop labeling exercises to both male and female simulations, (3) verifying the shimmer button on the homepage, and (4) testing the Force and Energy module end-to-end.

---

## Task 1: Fertilization Animation Component

Create a new component `src/components/reproductive/FertilizationAnimation.tsx` that renders a canvas-based animation showing:

- **Scene**: A cross-section of the fallopian tube with the egg (large pink circle) stationary near the tube's center
- **Sperm swarm**: 8-12 animated sperm cells swimming toward the egg with wiggling tails, varying speeds
- **Fertilization event**: When a "Start Fertilization" button is clicked, the leading sperm penetrates the egg membrane, triggering:
  - A flash/glow effect on the egg
  - The remaining sperm bouncing off (zona reaction)
  - The egg transforms color to indicate a zygote
- **Molecular overlay toggle**: Shows a split-view with:
  - Sperm acrosome releasing enzymes (small particles)
  - Zona pellucida layer around the egg
  - Pronuclei merging animation inside the fertilized egg
- **Controls**: Start/Reset button, speed slider, molecular view toggle
- **Info panel**: Displays current stage description (e.g., "Capacitation", "Acrosome reaction", "Cortical reaction", "Pronuclei fusion")

**Integration**: Add a "Fertilization" toggle/switch in the existing `ReproductiveSystemSimulation.tsx` component that appears only when `system === "female"`. When enabled, it renders the `FertilizationAnimation` component below the main canvas.

---

## Task 2: Drag-and-Drop Labeling Exercise

Create a new component `src/components/reproductive/LabelingExercise.tsx`:

- **Layout**: Shows the reproductive system diagram (reuses organ positions from the simulation) with blank label slots next to each organ
- **Label bank**: A row of draggable label chips at the bottom (shuffled organ names)
- **Drag mechanics**: Uses HTML5 drag-and-drop API (onDragStart/onDragOver/onDrop) for desktop, with touch event handlers for mobile
- **Feedback**:
  - Correct placement: Label snaps into place with green highlight
  - Incorrect placement: Label bounces back to the bank with red flash
  - Score counter: "5/7 correct" display
- **Completion**: When all labels are correctly placed, show a congratulations message and mark the exercise complete
- **Props**: Accepts `system: "male" | "female"` to load appropriate organ data

**Integration**: Add a new tab "Labeling" in `ReproductiveExperiment.tsx` TabsList, rendering `<LabelingExercise system={systemType} />`.

---

## Task 3: Shimmer Button Verification

The shimmer button is already implemented correctly:
- `src/components/ui/shimmer-button.tsx` exists with proper CSS variable-based shimmer animation
- `tailwind.config.ts` has both `shimmer-slide` and `spin-around` keyframes and animations configured
- `HeroSection.tsx` uses `ShimmerButton` for both "Start Exploring" and "Try Demo Experiment" buttons

**Action**: Use browser tools to navigate to `/` and visually verify both buttons display the shimmer effect.

---

## Task 4: Force & Energy Module Testing

**Action**: Use browser tools to:
1. Navigate to `/force-and-energy`
2. Click into each of the 3 experiments
3. Test simulation interactions (sliders, toggles)
4. Complete quizzes for each experiment
5. Return to hub and verify progress shows 3/3

---

## Technical Details

### New Files
| File | Purpose |
|------|---------|
| `src/components/reproductive/FertilizationAnimation.tsx` | Canvas-based fertilization simulation with molecular view |
| `src/components/reproductive/LabelingExercise.tsx` | Drag-and-drop organ labeling exercise |

### Modified Files
| File | Change |
|------|--------|
| `src/components/reproductive/ReproductiveSystemSimulation.tsx` | Add fertilization toggle (female only) |
| `src/pages/ReproductiveExperiment.tsx` | Add "Labeling" tab with LabelingExercise component |

### Fertilization Animation Stages
```text
Stage 1: Sperm Approach
  - Multiple sperm swim toward egg in fallopian tube
  
Stage 2: Acrosome Reaction  
  - Leading sperm releases enzymes to penetrate zona pellucida

Stage 3: Cortical Reaction
  - Egg membrane hardens, blocking other sperm

Stage 4: Pronuclei Fusion
  - Male and female genetic material merge to form zygote
```

### Labeling Exercise Data Flow
```text
Organ positions (from existing data) --> Render blank slots on diagram
Shuffled organ names --> Draggable label chips
User drags label --> Drop zone checks organ.id match
Correct? --> Snap + green glow + increment score
All correct? --> Show completion badge
```
