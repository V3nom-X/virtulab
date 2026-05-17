## Fix

In `src/pages/Analytics.tsx`, the Badges grid (`grid-cols-3`) renders badge names in a square tile with `text-[10px]` but no wrapping/overflow handling, so longer names like "Chemistry Starter" or "Science Explorer" overflow their tile and overlap neighbors.

### Changes (single file: `src/pages/Analytics.tsx`)

1. Add `overflow-hidden` and `min-w-0` to each badge tile so children can't escape the container.
2. Wrap the badge name in a span with `break-words leading-tight line-clamp-2 w-full` so multi-word names wrap to 2 lines instead of overflowing.
3. Add `gap` consistency and `text-center` on the wrapper; ensure icon uses fixed size (`text-2xl shrink-0`).
4. Increase tile padding slightly (`p-2` → `p-2.5`) and switch `aspect-square` to `min-h-[88px]` so tall wrapped labels don't get clipped vertically on narrow widths.
5. Optionally show all earned badges (remove `.slice(0, 9)` cap) — leave as-is unless requested; just fix overflow.

No other files changed. No backend/logic changes.