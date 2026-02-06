

# VirtuLab: Workspace Wiring, AURA Voice, and Final Verification

This plan covers wiring up the 6 new simulations in the workspace, adding voice to AURA, deploying edge functions, and auditing responsive design.

---

## 1. Workspace.tsx - Wire New Simulations

The simulation components and state variables already exist. What's missing:

### 1a. Add Refs for New Simulations
Add refs after buoyancyRef (line 151):
- `acidBaseRef`, `frictionRef`, `leverRef`, `expansionRef`, `statesOfMatterRef`, `diffusionOsmosisRef`

### 1b. Add New Experiments to Tab List
Extend the `simulations` array (line 153-165) with 6 new entries:
- `acidbase` - Acids and Bases (FlaskConical, Chemistry)
- `friction` - Friction (Activity, Physics)
- `lever` - Lever (Activity, Physics)
- `expansion` - Expansion (Activity, Physics)
- `statesofmatter` - States of Matter (FlaskConical, Chemistry)
- `diffusionosmosis` - Diffusion/Osmosis (Droplets, Biology)

### 1c. Add Data Series for New Simulations
Extend `getDataSeries()` with cases for each new simulation type (pH, forces, torque, length change, temperature, concentration).

### 1d. Add Reset Handlers
Extend `handleReset()` to call `.reset()` on the new refs.

### 1e. Update `hasPlayControls`
Add `acidbase` to the exclusion list (it's interactive without play/pause, similar to chemistry).

### 1f. Add Parameter Controls
Add 6 new blocks inside `renderParameterControls()` for each simulation's sliders and selectors (acid/base indicator, friction surface, lever fulcrum, expansion material, states substance, diffusion mode).

### 1g. Render Simulation Components
Add 6 new conditional renders in the canvas area (after line 552) passing the state variables and refs.

---

## 2. AURA Assistant - Voice TTS Playback

Update `src/components/aura/AuraAssistant.tsx`:

- Add a speaker/volume icon button next to each assistant message
- On click, call the `elevenlabs-tts` edge function with the message text
- Stream the audio response and play it via `new Audio(URL.createObjectURL(blob))`
- Add a "speaking" state with visual indicator (pulsing icon)
- Add a global voice toggle in the chat header
- Handle errors gracefully (if no API key configured, show a tooltip saying voice is unavailable)

### Deploy Edge Function
Deploy `elevenlabs-tts` to make it available for the voice feature.

---

## 3. Responsive Design Audit

Review and fix across all key pages:

- **Workspace tabs**: The tab list already uses `overflow-x-auto` with `w-max`, which handles horizontal scroll. With 17 tabs now, ensure the scroll works smoothly on mobile.
- **Admin page**: Verify stat cards stack on mobile, tab navigation is scrollable.
- **Analytics page**: Ensure grid items stack on small screens.
- **Navbar**: Already has mobile hamburger - verify it works.
- **AURA chat**: Already uses `max-w-[calc(100vw-2.5rem)]` - good for mobile.

---

## 4. Verification Tasks (No Code Changes Expected)

- **Builder Coming Soon**: Already confirmed working with `ComingSoonOverlay` at lines 317-321.
- **Admin Role Management**: `UserRoleManagement` component already handles role CRUD via Supabase - verify it persists.
- **Quiz Functionality**: The quiz system in `ExperimentEducation` uses local state for scoring. No database persistence issues expected since quizzes are education-panel-only.

---

## Technical Summary

### Files to Create
None - all components already exist.

### Files to Modify
- `src/pages/Workspace.tsx` - Add refs, tabs, controls, rendering for 6 new simulations
- `src/components/aura/AuraAssistant.tsx` - Add TTS voice playback with speaker buttons

### Edge Functions to Deploy
- `elevenlabs-tts` - Already created, needs deployment

### Estimated Changes
- Workspace.tsx: ~200 lines added (parameter controls, rendering, data series)
- AuraAssistant.tsx: ~60 lines added (voice playback logic, UI buttons)

