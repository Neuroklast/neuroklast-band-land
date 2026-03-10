# Theme Development Guide

> Complete reference for creating themes compatible with the Neuroklast Band Land template.
> Last updated: 2026-03-10

---

## Quick Start

```bash
# 1. Create theme directory
mkdir src/themes/my-theme

# 2. Create index.ts with ThemePackage export
# 3. Add to src/themes/index.ts (builtInThemes array)
# 4. Add to THEME_CATALOG in src/lib/theme-registry.ts
```

---

## ThemePackage Interface

Every theme must export a `ThemePackage` object:

```typescript
import type { ThemePackage } from '@/lib/types'

export const myTheme: ThemePackage = {
  // ─── Required Identification ─────────────────────────────────
  id: 'my-theme',                        // Unique kebab-case ID
  name: 'My Theme',                      // Display name
  description: 'Brief description.',     // UI description text
  author: 'Your Name',
  version: '1.0.0',                      // Semantic version

  // ─── Access Control ──────────────────────────────────────────
  access: 'free',                        // 'free' | 'premium' | 'exclusive'
  // exclusiveFor: 'site-id',            // Only when access='exclusive'
  // lockedMessage: 'Exclusive to X',    // Shown when locked

  // ─── Layout Configuration ────────────────────────────────────
  layout: {
    heroVariant: 'default',              // 'glitch-parallax' | 'chromatic-hover' | 'minimal' | 'default'
    loadingScreen: 'minimal',            // '3d-model' | 'code-rain' | 'cyberpunk' | 'minimal'
    navigationStyle: 'clean',            // 'cyberpunk-hud' | 'clean' | 'minimal' | 'default'
  },

  // ─── Typography ──────────────────────────────────────────────
  typography: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },

  // ─── Visual Settings ─────────────────────────────────────────
  borderRadius: 0,                       // rem (0 = sharp, 0.5 = rounded)
  animationsEnabled: true,

  // ─── Effects ─────────────────────────────────────────────────
  effects: {
    // overlayEffects: { scanlines, crt, noise, vignette, chromatic }
    // animationSettings: { glitch, scanlines, crt }
  },

  // ─── Color Presets ───────────────────────────────────────────
  colorPresets: [],                      // Built-in color variations
  defaultPresetId: 'default',

  // ─── Default Colors (applied when theme is first selected) ──
  defaultColors: {
    primary: 'oklch(0.50 0.22 25)',
    accent: 'oklch(0.55 0.18 30)',
    background: 'oklch(0.10 0.00 0)',
    card: 'oklch(0.14 0.01 0)',
    foreground: 'oklch(0.95 0.00 0)',
    mutedForeground: 'oklch(0.60 0.00 0)',
    border: 'oklch(0.25 0.02 0)',
    secondary: 'oklch(0.18 0.01 0)',
  },

  // ─── Default Fonts ───────────────────────────────────────────
  defaultFonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },

  // ─── Animation Metadata (for admin customizer UI) ───────────
  animations: [
    { id: 'scanlines', label: 'Scanlines', defaultEnabled: true },
    { id: 'crt', label: 'CRT Effect', defaultEnabled: false, hasIntensity: true, defaultIntensity: 0.5 },
  ],

  // ─── Customizability ─────────────────────────────────────────
  customizability: {
    customColors: true,                  // Users can change colors
    customFonts: true,                   // Users can change fonts
    adjustEffects: true,                 // Users can toggle effects
  },

  // ─── Slot Components (all optional) ──────────────────────────
  slots: {
    // Hero: MyHero,
    // Navigation: MyNavigation,
    // Footer: MyFooter,
    // GigsSection: MyGigsSection,
    // ... override any of the 24 slots
  },
}
```

---

## All 24 Theme Slots

Themes can override any combination of these 24 slots. Unoverridden slots automatically use defaults from `src/themes/default-slots.tsx`.

### Core UI Slots (1–7)

| # | Slot | Props Interface | Description |
|---|------|----------------|-------------|
| 1 | `Hero` | `HeroSlotProps` | Main hero section (name, genres, logo, title image) |
| 2 | `Navigation` | `NavigationSlotProps` | Top navigation bar |
| 3 | `LoadingScreen` | `LoadingScreenSlotProps` | Full-screen intro animation (must call `onComplete()`) |
| 4 | `SectionDivider` | `SectionDividerSlotProps` | Visual divider between sections |
| 5 | `Card` | `CardSlotProps` | Generic card wrapper |
| 6 | `BackgroundEffects` | `BackgroundEffectsSlotProps` | Background visual effects / HUD |
| 7 | `Footer` | `FooterSlotProps` | Footer with social links, legal, copyright |

### Layout & Interaction Slots (8–15)

| # | Slot | Props Interface | Description |
|---|------|----------------|-------------|
| 8 | `OverlayModal` | `OverlayModalSlotProps` | Full-screen detail modal |
| 9 | `SectionHeading` | `SectionHeadingSlotProps` | Section title rendering |
| 10 | `OverlayTransition` | `OverlayTransitionSlotProps` | Overlay open/close animation |
| 11 | `ItemCard` | `ItemCardSlotProps` | Individual list item card |
| 12 | `CookieBanner` | `CookieBannerSlotProps` | Cookie consent banner |
| 13 | `ScrollReveal` | `ScrollRevealSlotProps` | Scroll-triggered animation wrapper |
| 14 | `HoverEffect` | `HoverEffectSlotProps` | Hover interaction wrapper |
| 15 | `PageLayout` | `PageLayoutSlotProps` | Page layout container |

### Content Section Slots (16–24)

| # | Slot | Props Interface | Description |
|---|------|----------------|-------------|
| 16 | `GigsSection` | `GigsSectionSlotProps` | Upcoming gigs listing |
| 17 | `ReleasesSection` | `ReleasesSectionSlotProps` | Music releases / discography |
| 18 | `BiographySection` | `BiographySectionSlotProps` | Band biography & members |
| 19 | `NewsSection` | `NewsSectionSlotProps` | News feed |
| 20 | `MediaSection` | `MediaSectionSlotProps` | Media files (audio, video) |
| 21 | `GallerySection` | `GallerySectionSlotProps` | Image gallery |
| 22 | `SocialSection` | `SocialSectionSlotProps` | Social media links |
| 23 | `ContactSection` | `ContactSectionSlotProps` | Contact form |
| 24 | `PartnersSection` | `PartnersSectionSlotProps` | Partners & friends |

---

## Slot Props Reference

### Content Section Slot Props

All content section slots receive the existing component's props. Each has:
- **Data props** — the actual content data (gigs array, releases array, etc.)
- **`editMode?: boolean`** — whether the admin is editing (show edit controls)
- **`onUpdate?`** — callback to save changes
- **`sectionLabels?`** — custom section title overrides
- **`onLabelChange?`** — callback for section title edits

Example:
```typescript
interface GigsSectionSlotProps {
  gigs: Gig[]
  onGigClick?: (gig: Gig) => void
  sectionLabels?: SectionLabels
  dataLoaded?: boolean
  editMode?: boolean
  fontSizes?: FontSizeSettings
  onUpdate?: (gigs: Gig[]) => void
  onFontSizeChange?: (key: keyof FontSizeSettings, value: string) => void
  onLabelChange?: (key: keyof SectionLabels, value: string) => void
}
```

---

## Theme Lifecycle

```
1. REGISTER (app startup)
   └─ theme-registry.ts: builtInThemes.forEach(registerTheme)
   └─ Stored in _registry Map<string, ThemePackage>

2. SELECT (user picks theme)
   └─ ThemeContext → setThemeSettings({ activePreset: 'my-theme' })
   └─ Triggers: applyThemeToDOM() + localStorage + KV persist

3. APPLY TO DOM
   └─ document.documentElement.setAttribute('data-theme', 'my-theme')
   └─ Set CSS custom properties: --primary, --background, --font-heading, etc.
   └─ Theme's styles.css rules with [data-theme="my-theme"] now match

4. RESOLVE SLOTS
   └─ Components call useThemeSlots('my-theme')
   └─ resolveSlots() returns all 24 slots with fallbacks
   └─ theme.slots.Hero ?? DefaultHero (for each of 24 slots)
```

---

## Access Levels

| Level | `ThemePackage.access` | `THEME_CATALOG.licenseStatus` | Who can use |
|-------|----------------------|------------------------------|-------------|
| Free | `'free'` | `'free'` | Everyone |
| Exclusive | `'exclusive'` | `'locked'` | Only the site matching `exclusiveFor` |
| Premium | `'premium'` | `'locked'` | Users with Pro license tier |

### Exclusive Themes

```typescript
{
  access: 'exclusive',
  exclusiveFor: 'zardonic',
  lockedMessage: 'Exclusive to ZARDONIC',
}
```

In `THEME_CATALOG`:
```typescript
{
  licenseStatus: 'locked',
  licenseKeyPrefix: 'ZARDONIC-',  // Keys must start with this prefix
}
```

---

## Step-by-Step: Creating a New Theme

### 1. Create Directory

```
src/themes/my-theme/
├── index.ts              # Required: ThemePackage export
├── Hero.tsx              # Optional: custom Hero slot
├── Navigation.tsx        # Optional: custom Navigation slot
├── BackgroundEffects.tsx # Optional: custom background
├── styles.css            # Optional: scoped CSS
└── ...                   # Any other slot overrides
```

### 2. Create `index.ts`

```typescript
import type { ThemePackage } from '@/lib/types'
import Hero from './Hero'
import './styles.css'

export const myTheme: ThemePackage = {
  id: 'my-theme',
  name: 'My Theme',
  description: 'A custom theme.',
  author: 'Your Name',
  version: '1.0.0',
  access: 'free',

  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Cinzel', serif",
    body: "'Montserrat', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },

  defaultColors: {
    primary: 'oklch(0.65 0.20 280)',
    accent: 'oklch(0.55 0.15 320)',
    background: 'oklch(0.08 0.01 280)',
    card: 'oklch(0.12 0.02 280)',
    foreground: 'oklch(0.95 0.00 0)',
    mutedForeground: 'oklch(0.60 0.02 280)',
    border: 'oklch(0.22 0.03 280)',
    secondary: 'oklch(0.15 0.02 280)',
  },

  slots: {
    Hero,  // Custom hero — all other slots use defaults
  },
}

export default myTheme
```

### 3. Create Slot Components (Optional)

```tsx
// src/themes/my-theme/Hero.tsx
import type { HeroSlotProps } from '@/lib/types'

export default function MyHero({ name, genres, logoUrl, editMode, onEdit }: HeroSlotProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {logoUrl && <img src={logoUrl} alt={name} className="w-32 h-32" />}
      <h1 className="text-6xl font-bold text-foreground">{name}</h1>
      <p className="text-xl text-muted-foreground">{genres.join(' · ')}</p>
      {editMode && (
        <button onClick={onEdit} className="absolute top-4 right-4 text-primary">
          Edit
        </button>
      )}
    </section>
  )
}
```

### 4. Add Scoped CSS (Optional)

```css
/* src/themes/my-theme/styles.css */
[data-theme="my-theme"] .hero-title {
  font-size: 5rem;
  letter-spacing: 0.2em;
  color: var(--primary);
}
```

### 5. Register the Theme

In `src/themes/index.ts`:
```typescript
export { myTheme } from './my-theme'

// Add to builtInThemes:
import { myTheme } from './my-theme'
export const builtInThemes: ThemePackage[] = [
  // ...existing themes,
  myTheme,
]
```

In `src/lib/theme-registry.ts` → `THEME_CATALOG`:
```typescript
{
  id: 'my-theme',
  name: 'My Theme',
  description: 'A custom theme.',
  licenseStatus: 'free',
  theme: { activePreset: 'my-theme' },
  author: 'Your Name',
  tags: ['dark', 'elegant'],
  themeType: 'full',
},
```

---

## Built-in Themes Reference

| Theme | ID | Access | Custom Slots | Font Style |
|-------|-----|--------|-------------|------------|
| Neuroklast Classic | `neuroklast-classic` | exclusive (neuroklast) | Hero, Nav, Loading, Footer, BG | Mono-heavy |
| Nebula Noir | `nebula-noir-theme` | free | Hero, Nav, Card, BG, Divider, Loading | Elegant serif |
| Glitch Noir | `glitch-noir` | free | Hero, Nav, Card, BG, Divider, Loading | Clean sans |
| Zardonic | `zardonic-theme` | exclusive (zardonic) | Hero, Nav, Card, BG, Divider, Loading | Futuristic |

---

## Rules for Theme Development

### DO:
- ✅ Use CSS variables (`var(--primary)`, `var(--background)`, etc.)
- ✅ Use Tailwind design tokens (`bg-background`, `text-foreground`, `border-border`)
- ✅ Scope CSS with `[data-theme="your-id"]` selectors
- ✅ Accept and respect `editMode` prop (show edit controls when true)
- ✅ Call `onComplete()` in LoadingScreen when animation finishes
- ✅ Clean up all `useEffect` subscriptions (timers, RAF, event listeners)
- ✅ Use `filter: drop-shadow()` instead of `box-shadow` for transparent images
- ✅ Use `mixBlendMode: 'multiply'` for overlays on transparent images

### DON'T:
- ❌ Hardcode colors (`bg-red-500`, `text-blue-300`, `#ff0000`)
- ❌ Import stores, make API calls, or manage business logic in slot components
- ❌ Create theme-specific component variants (`CyberpunkCard.tsx`, `MinimalCard.tsx`)
- ❌ Use inline styles for complex layouts
- ❌ Skip cleanup in `useEffect` hooks
- ❌ Depend on specific font names being loaded (always provide fallbacks)

---

## Slot Resolution & Fallbacks

When `resolveSlots(theme)` runs, for each of the 24 slots:

```typescript
Hero: theme.slots.Hero ?? DefaultHero
Navigation: theme.slots.Navigation ?? DefaultNavigation
// ... (all 24 slots)
GigsSection: theme.slots.GigsSection ?? DefaultGigsSection
```

Default slot components live in `src/themes/default-slots.tsx` and delegate to the existing section components in `src/components/`.

A theme with `slots: {}` (empty) will still render perfectly using all defaults.
