
# UI Polish, Canvas Sizing, Logo Slider, and Gold Accents

This plan addresses all the issues visible in the screenshot and the requested enhancements.

---

## 1. Expand Experiment Canvas to Full Available Space

The screenshot shows the simulation canvas is too small. The workspace currently uses `min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]` but the flex layout should allow it to grow. The fix:

- Change the simulation area to use `flex-1` with `min-h-0` so it fills all remaining vertical space
- Use `h-[calc(100vh-8rem)]` on the main flex container to ensure full viewport usage
- Remove restrictive `min-h` values and let flexbox do the work
- On the workspace page specifically, hide the BackButton since the toolbar already provides context

**File**: `src/pages/Workspace.tsx`
- Line 664: Change the outer container to `h-screen` or `100vh` based layout
- Line 694: Remove fixed `min-h` constraints, let `flex-1` fill space

---

## 2. Remove Profile Icon from Navbar

Remove the `NativeHoverCard` user avatar and related sign-out logic from the navbar right content area. Keep only ThemeToggle, Help, and Admin icons.

**File**: `src/components/layout/Navbar.tsx`
- Lines 78-99: Remove the entire `{user ? (<NativeHoverCard ... />) : null}` block

---

## 3. Fix Logo Slider Direction and Glow

Change the slider to move left-to-right (direction="right") at a moderate speed, and add a subtle glow effect to the logo items.

**File**: `src/components/home/TechLogos.tsx`
- Line 37: Change `direction="left"` to `direction="right"` and adjust `speed={50}` for moderate pace

**File**: `src/components/ui/logo-slider.tsx`
- Line 33: Replace `opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0` with a glow style using `drop-shadow` for subtle luminosity, remove grayscale

---

## 4. Add Gold Accent Colors

Introduce a gold/amber accent throughout the UI for visual richness.

**File**: `src/index.css`
- Add CSS variable `--gold` in both light and dark themes (e.g., `45 93% 47%` / `45 93% 55%`)
- Add `--gold-foreground` for text on gold backgrounds

**File**: `tailwind.config.ts`
- Add `gold` color mapping: `DEFAULT: "hsl(var(--gold))"`, `foreground: "hsl(var(--gold-foreground))"`

Apply gold accents to:
- `src/components/home/HeroSection.tsx` or `FeaturesSection.tsx`: Add gold highlights to section headings or badges
- `src/pages/GeniusBar.tsx`: Use gold badge accents for grade tabs
- `src/components/layout/BackButton.tsx`: Add a subtle gold border or ring

---

## 5. Fix BackButton Overlapping Content

The screenshot shows the back button overlapping the workspace toolbar. Fix by:
- Making the BackButton position-aware: on workspace pages where there's already a toolbar, don't render it
- OR adjust the workspace layout to account for the back button with left padding

**File**: `src/pages/Workspace.tsx`
- The workspace already has its own header bar. Pass a prop to Layout to hide the BackButton, or integrate a back action into the workspace header itself.

**File**: `src/components/layout/Layout.tsx`
- Add a `hideBackButton` prop option

---

## 6. Ensure Responsive Design Across Pages

Review and fix:
- **Workspace**: Tab list with 17 items - ensure `overflow-x-auto` scrolls properly on mobile; parameter sidebar hidden on mobile with drawer access (already implemented)
- **GeniusBar**: Content is container-based and responsive - add `px-4` padding on mobile
- **Library**: Already responsive with grid/list toggle
- **Admin/Analytics**: Verify grid stacking (currently uses `grid-cols-1 md:grid-cols-2`)

---

## 7. Prevent AURA from Blocking Content

The AURA button is draggable but may still overlap critical UI. Ensure:
- Initial position is bottom-right corner with adequate margin
- The chat panel doesn't extend beyond viewport bounds on mobile
- Add a small margin/padding around the draggable area

**File**: `src/components/aura/AuraAssistant.tsx`
- Verify initial position uses `window.innerWidth - 70` and `window.innerHeight - 70`
- On mobile, constrain the chat panel width to `max-w-[calc(100vw-2rem)]`

---

## Technical Summary

### Files to Modify
1. `src/pages/Workspace.tsx` - Expand canvas, integrate back navigation, remove fixed min-heights
2. `src/components/layout/Navbar.tsx` - Remove profile icon/NativeHoverCard
3. `src/components/home/TechLogos.tsx` - Change slider direction to right, moderate speed
4. `src/components/ui/logo-slider.tsx` - Add glow effect to logo items
5. `src/index.css` - Add gold CSS variables
6. `tailwind.config.ts` - Add gold color to theme
7. `src/components/layout/Layout.tsx` - Add hideBackButton prop
8. `src/components/layout/BackButton.tsx` - Add gold accent styling
9. `src/components/aura/AuraAssistant.tsx` - Verify mobile constraints
10. `src/pages/GeniusBar.tsx` - Add gold accent badges, ensure mobile padding

### No New Files Required
All changes are modifications to existing components.
