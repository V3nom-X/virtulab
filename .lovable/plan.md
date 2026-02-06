

# VirtuLab Comprehensive Update Plan

This is a large update covering 12 major feature areas. Below is a structured breakdown of everything that will be built.

---

## 1. App Logo Update

Replace the current Beaker icon in the Navbar and favicon with the uploaded VirtuLab logo image.

- Copy the uploaded logo to `src/assets/virtulab-logo.png`
- Update `Navbar.tsx` to use the logo image instead of the Beaker icon
- Copy a resized version to `public/favicon.ico` or use it as a PNG favicon in `index.html`

---

## 2. New Experiments from Document

The uploaded document contains **6 new experiments** to add:

| Experiment | Category |
|---|---|
| Acids, Bases, and Indicators | Chemistry |
| Friction and Its Effects | Physics |
| Load, Effort, and Fulcrum (Lever) | Physics |
| Expansion and Contraction of Materials | Physics |
| States of Matter and Changes of State | Chemistry |
| Diffusion and Osmosis in Living Things | Biology |

**Implementation:**
- Add experiment data and educational content to new data files
- Create simulation components for each experiment with interactive controls (sliders, selectors)
- Register experiments in the database via SQL migration
- Add educational content (tutorials, quizzes) for each

---

## 3. Biology and Earth Science Educational Content

Create educational data files with tutorials and quizzes:
- `src/data/biologyEducation.ts` - Tutorials covering cell biology, diffusion, osmosis, ecosystems
- `src/data/earthScienceEducation.ts` - Tutorials on weather, rock cycle, erosion, plate tectonics
- `src/data/biologyQuizzes.ts` and `src/data/earthScienceQuizzes.ts` - Assessment quizzes
- Integrate these into the workspace "Learn" panel based on experiment category

---

## 4. Chemistry "React" Feature Enhancement

Update `ChemistryWorkspace.tsx` to:
- Show all combination types (compounds, mixtures, elements) not just molecules when reacting
- Display active molecules/compounds in the workspace area with labels
- Add a results panel showing reaction type, products, and classification

---

## 5. AURA AI Assistant

**AURA (Artificial Understanding & Reasoning Assistant)** - A floating AI assistant.

**Phase 1 (Text-based, immediate):** Uses Lovable AI (no API key needed)
- Create an edge function `supabase/functions/aura-chat/index.ts` using the Lovable AI gateway
- Build `src/components/aura/AuraAssistant.tsx` - floating blob button (bottom-right corner)
- On click, opens a chat popup with streaming text responses
- System prompt: science tutor personality, female persona named AURA
- Add to the root `App.tsx` so it appears on all pages

**Phase 2 (Voice, after ElevenLabs key is provided):**
- Once you provide your ElevenLabs API key, voice features will be added
- Text-to-speech for AURA's responses using a female voice
- The text chat will work immediately without the key

---

## 6. Collaboration Page "Coming Soon" Overlay

- Apply the existing `ComingSoonOverlay` component to the Collaboration page
- List upcoming features: real-time co-experimentation, shared workspaces, voice chat

---

## 7. Analytics Page - Full Functionality

Make all sections work with real data from the database:
- **Stats cards**: Pull actual counts from `user_progress`, `quiz_results`, `user_badges`
- **Badges**: Show all available badges with earned/unearned state (already partially working)
- **Recent Activity**: Show last 10 experiments accessed with timestamps
- **Progress by Category**: Calculate actual totals from `experiments` table per category instead of estimates
- **Real-time updates**: Subscribe to `user_progress` changes via realtime
- Fix the category total calculation to use actual experiment counts

---

## 8. Admin Dashboard Improvements

### 8a. Role Management
- The `UserRoleManagement` component already works - verify role changes persist correctly

### 8b. Correct Statistics
- Replace random `Math.random()` activity data (line 174) with real daily counts from `user_progress`
- Query actual daily active users and experiments completed per day for the chart

### 8c. Experiment Section
- Update `ExperimentModeration` to also show built-in experiments from the `experiments` table (not just `custom_experiments`)
- Display all experiments with category, difficulty, and status

### 8d. Email Section
- Keep the UI functional but without actual sending (per your preference to skip email broadcasting)
- The template editor and settings will work as local state management

---

## 9. Responsive Design

Audit and fix all pages for mobile/tablet/desktop:
- **Navbar**: Ensure mobile hamburger menu works correctly
- **Admin Dashboard**: Make tab navigation scrollable on mobile, stack stat cards
- **Analytics**: Stack grid items on small screens
- **Workspace**: Ensure simulation controls don't overflow on mobile
- **Community/Library**: Responsive card grids
- **Builder**: Already has `MobileBuilderSheet` - verify it works
- Add responsive breakpoints (`sm:`, `md:`, `lg:`) where missing

---

## 10. Chemistry Quiz Testing

- Verify quiz functionality in the Chemistry Education Panel
- Ensure scoring, badge awarding, and progress tracking work end-to-end

---

## 11. Builder "Coming Soon" Verification

- Confirm the existing `ComingSoonOverlay` on Builder page displays correctly
- No changes needed if already working

---

## 12. Database Migration

A SQL migration will be needed to:
- Insert the 6 new experiments into the `experiments` table
- Map them to `experiment_types` if needed

---

## Technical Details

### New Files to Create:
- `src/assets/virtulab-logo.png` (copied from upload)
- `src/data/biologyEducation.ts`
- `src/data/earthScienceEducation.ts`
- `src/data/biologyQuizzes.ts`
- `src/data/earthScienceQuizzes.ts`
- `src/components/aura/AuraAssistant.tsx`
- `supabase/functions/aura-chat/index.ts`
- `src/components/simulations/AcidBaseSimulation.tsx`
- `src/components/simulations/FrictionSimulation.tsx`
- `src/components/simulations/LeverSimulation.tsx`
- `src/components/simulations/ExpansionSimulation.tsx`
- `src/components/simulations/StatesOfMatterSimulation.tsx`
- `src/components/simulations/DiffusionOsmosisSimulation.tsx`

### Files to Modify:
- `src/components/layout/Navbar.tsx` - Logo update
- `index.html` - Favicon update
- `src/App.tsx` - Add AURA assistant globally
- `src/pages/Analytics.tsx` - Real data integration
- `src/pages/Admin.tsx` - Real statistics, all experiments display
- `src/pages/Collaboration.tsx` - Coming Soon overlay
- `src/pages/Workspace.tsx` - New simulation routing and controls
- `src/components/chemistry/ChemistryWorkspace.tsx` - Show all combination types
- `src/components/admin/ExperimentModeration.tsx` - Show all experiments
- `src/data/experimentEducation.ts` - Add content for new experiments
- Various components for responsive fixes

### Dependencies:
- No new npm packages needed
- ElevenLabs React SDK will be added later when you provide your API key

### Order of Implementation:
1. Logo and assets
2. Database migration for new experiments
3. New simulation components
4. Educational content (biology, earth science)
5. Chemistry react feature enhancement
6. AURA AI assistant (text mode)
7. Analytics page fixes
8. Admin dashboard fixes
9. Collaboration Coming Soon overlay
10. Responsive design pass
11. Testing and verification

