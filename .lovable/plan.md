

# Progress Tracking, Opaque Overlay, and ChatGPT Integration

## Important Notes

**Regarding Supabase vs Lovable Cloud**: Your project already runs on Lovable Cloud, which uses the same underlying Supabase technology. Once Cloud is enabled, it cannot be disconnected. You already have full database capabilities -- no changes needed here.

**Regarding ChatGPT**: I'll update the AURA edge function to call OpenAI directly using your API key. I'll need you to provide your OpenAI API key as a secret.

---

## 1. Add localStorage Progress Tracking

**New file**: `src/hooks/useSeparationProgress.ts`
- Custom hook that reads/writes progress to localStorage key `virtulab-separation-progress`
- Tracks which experiments have been completed (quiz submitted with passing score)
- Returns `{ completedExperiments: string[], markComplete: (id) => void, completionPercentage: number }`

**Modify**: `src/pages/SeparationOfMixtures.tsx`
- Import the hook and display an overall progress bar below the section heading
- Show completion percentage and count (e.g., "3/7 completed")
- Each ExperimentCard gets a checkmark if completed

**Modify**: `src/components/separations/ExperimentCard.tsx`
- Accept optional `completed` prop
- Show a green checkmark badge on completed experiments

**Modify**: `src/pages/SeparationExperiment.tsx`
- Import the hook
- When quiz is submitted with a passing score, call `markComplete(experimentId)`

## 2. Make Genius Bar Overlay Opaque

**Modify**: `src/components/overlays/ComingSoonOverlay.tsx`
- Change `bg-background/80 backdrop-blur-sm` to `bg-background backdrop-blur-none` (fully opaque)

## 3. Switch AURA from Lovable AI to ChatGPT

**Step 1**: Request your OpenAI API key as a secret (stored securely in the backend)

**Step 2**: Modify `supabase/functions/aura-chat/index.ts`
- Replace the Lovable AI gateway URL with `https://api.openai.com/v1/chat/completions`
- Use `OPENAI_API_KEY` secret instead of `LOVABLE_API_KEY`
- Use model `gpt-4o` (or `gpt-3.5-turbo` for cost savings)

## 4. Test the Module

After implementing changes, I'll navigate to `/separation-of-mixtures` and test:
- Module overview page renders correctly
- Click into experiments and verify tabs, simulation canvas, and quiz work
- Verify progress tracking persists

---

## Files to Create
1. `src/hooks/useSeparationProgress.ts`

## Files to Modify
1. `src/pages/SeparationOfMixtures.tsx` -- Add progress bar
2. `src/components/separations/ExperimentCard.tsx` -- Add completed indicator
3. `src/pages/SeparationExperiment.tsx` -- Mark experiment complete on quiz pass
4. `src/components/overlays/ComingSoonOverlay.tsx` -- Make fully opaque
5. `supabase/functions/aura-chat/index.ts` -- Switch to OpenAI API

