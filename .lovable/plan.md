
# Gold, Midnight Blue, and Purple Accents + Genius Bar Content + Experiment Thumbnails

This plan covers three main areas: enhanced color accents across all pages, adding Strand 1 curriculum content to the Genius Bar, and generating remaining experiment thumbnails.

---

## 1. Add Midnight Blue and Purple CSS Variables

Add new CSS custom properties for midnight blue and purple in both light and dark themes, alongside the existing gold variables.

**File**: `src/index.css`
- Add `--midnight: 220 60% 20%` / dark: `220 60% 35%` and `--midnight-foreground`
- Add `--purple: 270 60% 55%` / dark: `270 60% 65%` and `--purple-foreground`

**File**: `tailwind.config.ts`
- Map `midnight` and `purple` colors like gold: `DEFAULT` and `foreground` variants

---

## 2. Apply Gold, Midnight Blue, and Purple Accents Across Pages

### Home Page
- **HeroSection.tsx**: Add a subtle midnight blue radial gradient alongside the existing primary ones; stats section numbers get a gold color
- **FeaturesSection.tsx**: Section heading "Everything You Need" gets a gold underline accent; feature icon backgrounds alternate with purple and midnight tints for variety
- **CategoryTiles.tsx**: Section heading gets gold accent; the Biology tile already uses purple, keep consistent
- **FeaturedExperiments.tsx**: "Featured Experiments" heading gets a gold accent; carousel navigation buttons get a midnight blue border on hover
- **Footer.tsx**: Brand icon background changes to midnight blue; section headings get a subtle gold color

### Library Page
- **Library.tsx**: Page heading "Experiment Library" gets gold accent on the word "Library"; category badges use purple/midnight tints; the Periodic Table tab trigger uses a purple active state

### Profile Page
- **Profile.tsx**: Tab triggers use gold active state; badge display section gets a purple-tinted background; stat cards get midnight blue borders

### Settings Page
- **Settings.tsx**: Section headers get gold accents; toggle switches keep primary color but danger zone uses a purple-tinted warning

### Admin Page
- **Admin.tsx**: Tab triggers use midnight blue active state; stat cards alternate gold/purple/midnight borders

### Help Page
- **Help.tsx**: Page header icon uses gold; FAQ section gets a midnight blue accent line on the left border

### Genius Bar
- Already has gold tabs; add a midnight blue card header border and purple accent on the Strand badges

---

## 3. Add Strand 1: Scientific Investigation to Genius Bar

The uploaded document provides Grade 7 Strand 1 content organized into 3 sub-strands (topics). This will be added as a new subject entry under Grade 7 in the `gradeData` object.

**File**: `src/pages/GeniusBar.tsx`

Add a new subject under Grade 7 with icon `Globe` (representing Scientific Investigation):

**Subject: "Strand 1: Scientific Investigation"**

Topics (condensed from the document into key bullet points):

1. **Sub-Strand 1.1: Introduction to Integrated Science**
   - Meaning of Integrated Science: combines Biology, Chemistry, Physics, Earth Science, and Technology
   - Why science is integrated: real-life problems involve multiple disciplines (e.g., farming needs biology, chemistry, physics)
   - Goals: develop scientific thinking, inquiry skills, problem solving, scientific literacy, STEM preparation
   - Components: Biology (living things), Chemistry (matter/substances), Physics (energy/forces), Earth & Environmental Science, Scientific Process Skills, Technology & Innovation
   - Importance in daily life: health, agriculture, industry, transport, food production, textiles, environmental conservation
   - Career pathways: medicine, engineering, agriculture, technology, teaching
   - Values and competencies: communication, collaboration, critical thinking, digital literacy, curiosity, responsibility

2. **Sub-Strand 1.2: Importance of Science in Daily Life**
   - Science in health: vaccination, hygiene, diagnosis (thermometers, X-rays), treatment (antibiotics), nutrition
   - Science in agriculture: improved seeds, fertilisers, pest control, irrigation, livestock breeding
   - Science in industry: manufacturing medicines, plastics, cement, food processing, job creation
   - Science in transport: vehicles, road construction, fuel technology (SGR, highways)
   - Science in food production: preservation (refrigeration, drying, canning), processing, nutrition knowledge
   - Science in textiles: fabric production, dyeing, clothing manufacture
   - Science in environmental conservation: pollution control, waste management, climate monitoring

3. **Sub-Strand 1.3: Pathways Related to Integrated Science at Senior School**
   - CBC pathways: STEM, Social Sciences, Arts and Sports Science
   - STEM pathway: Science, Technology, Engineering, Mathematics
   - Pure Sciences: Biology, Chemistry, Physics and related careers
   - Applied Sciences: Agriculture, Environmental Science, Health Sciences, Computer Science
   - Engineering: Civil, Mechanical, Electrical, Computer Engineering
   - Technical and vocational careers: electrician, mechanic, lab technician, welder
   - Skills developed: scientific skills, problem-solving, critical thinking, innovation
   - Factors for choosing a pathway: interest, ability, talent, career goals, societal needs

---

## 4. Generate Remaining Experiment Thumbnails

The current thumbnail mapping is missing images for: pendulum, spring, buoyancy, friction, lever, inclinedplane, expansion, emspectrum.

Since we cannot generate actual images, we will use a gradient-based SVG placeholder approach -- creating simple, colorful SVG thumbnails for each missing experiment type that are visually distinct and informative.

**New file**: `src/assets/experiments/generated/` -- Create SVG placeholder thumbnails programmatically

Alternative approach (simpler): Update `experimentThumbnails.ts` to map missing simulation types to the closest existing thumbnail or to a themed Unsplash image URL. Since the existing thumbnails are imported as static assets, and we cannot generate actual JPG files, we will:

- Map `pendulum` to the existing wave thumbnail (related physics)
- Map `spring` to the existing wave thumbnail
- Map `buoyancy`, `friction`, `lever`, `inclinedplane` to the projectile thumbnail (mechanics)
- Map `expansion`, `emspectrum` to the lightoptics thumbnail (related physics)

**File**: `src/data/experimentThumbnails.ts` -- Add fallback mappings for all missing simulation types

---

## Technical Summary

### Files to Modify
1. `src/index.css` -- Add midnight blue and purple CSS variables
2. `tailwind.config.ts` -- Map midnight and purple to Tailwind theme
3. `src/pages/GeniusBar.tsx` -- Add Strand 1 content with 3 sub-strands, apply accent colors
4. `src/data/experimentThumbnails.ts` -- Add fallback mappings for missing thumbnails
5. `src/components/home/HeroSection.tsx` -- Add midnight blue gradient, gold stat numbers
6. `src/components/home/FeaturesSection.tsx` -- Gold/purple/midnight icon accents
7. `src/components/home/FeaturedExperiments.tsx` -- Gold heading accent
8. `src/components/home/CategoryTiles.tsx` -- Gold section heading accent
9. `src/components/home/Footer.tsx` -- Midnight blue brand icon, gold section headers
10. `src/pages/Library.tsx` -- Gold/purple tab and heading accents
11. `src/pages/Profile.tsx` -- Gold tab accents, purple badge section
12. `src/pages/Settings.tsx` -- Gold section header accents
13. `src/pages/Admin.tsx` -- Midnight blue tabs, alternating accent borders
14. `src/pages/Help.tsx` -- Gold icon, midnight blue FAQ borders

### No New Dependencies Required
All changes use existing Tailwind utilities and CSS custom properties.
