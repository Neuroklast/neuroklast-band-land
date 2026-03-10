# Themes System

This directory contains all theme packages for the Neuroklast Band Land site template. Each theme is a self-contained directory that can override default UI slots, provide background effects, custom card styles, section dividers, content-section overrides, and scoped CSS.

---

## Directory Structure

```
src/themes/
├── index.ts                  # Barrel – exports all registered themes
├── default-slots.tsx         # Default fallback components for all 24 slots
├── primitives/               # Shared UI primitives (ThemeCard, ThemeSectionDivider)
├── neuroklast-classic/       # Exclusive Neuroklast theme
│   ├── index.ts
│   ├── Hero.tsx
│   ├── Navigation.tsx
│   ├── BackgroundEffects.tsx
│   ├── LoadingScreen.tsx
│   ├── Footer.tsx
│   └── styles.css
├── nebula-noir-theme/        # Free Art Deco / cosmic theme
│   ├── index.ts
│   ├── Hero.tsx, Card.tsx, ...
│   └── styles.css
├── glitch-noir/              # Free minimal dark techno theme
│   ├── index.ts
│   └── styles.css
├── zardonic/                 # Exclusive industrial cyberpunk theme
│   ├── index.ts
│   └── styles.css
└── README.md                 # This file
```

---

## Theme Types

| Type     | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| `full`   | Provides custom slot components (Navigation, Hero, etc.) + effects/CSS    |
| `preset` | Color/font-only override – no custom components, relies on CSS variables  |

## Access Levels

| Access      | Description                                              |
| ----------- | -------------------------------------------------------- |
| `free`      | Available to everyone                                    |
| `exclusive` | Locked to a specific site via `exclusiveFor`             |
| `premium`   | Requires a Pro license                                   |

---

## Slot System (24 Slots)

Themes can override any of the 24 named UI slots. If a theme does not provide a slot, the default fallback from `default-slots.tsx` is used automatically.

### Core Slots (1–15)

| Slot               | Props Interface            | Description                                |
| ------------------ | -------------------------- | ------------------------------------------ |
| `Hero`             | `HeroSlotProps`            | Main hero section                          |
| `Navigation`       | `NavigationSlotProps`      | Top navigation bar                         |
| `LoadingScreen`    | `LoadingScreenSlotProps`   | Full-screen intro / boot animation         |
| `SectionDivider`   | `SectionDividerSlotProps`  | Visual divider between sections            |
| `Card`             | `CardSlotProps`            | Card component for content                 |
| `BackgroundEffects`| `BackgroundEffectsSlotProps`| Background visual effects                 |
| `Footer`           | `FooterSlotProps`          | Footer component                           |
| `OverlayModal`     | `OverlayModalSlotProps`    | Full-screen modal overlay                  |
| `SectionHeading`   | `SectionHeadingSlotProps`  | Section title component                    |
| `OverlayTransition`| `OverlayTransitionSlotProps`| Overlay transition effects                |
| `ItemCard`         | `ItemCardSlotProps`        | Individual item card                       |
| `CookieBanner`     | `CookieBannerSlotProps`    | Cookie consent banner                      |
| `ScrollReveal`     | `ScrollRevealSlotProps`    | Scroll-triggered animations                |
| `HoverEffect`      | `HoverEffectSlotProps`     | Hover interaction wrapper                  |
| `PageLayout`       | `PageLayoutSlotProps`      | Page layout wrapper                        |

### Content-Section Slots (16–24)

| Slot               | Props Interface              | Description                              |
| ------------------ | ---------------------------- | ---------------------------------------- |
| `GigsSection`      | `GigsSectionSlotProps`       | Upcoming gigs listing                    |
| `ReleasesSection`  | `ReleasesSectionSlotProps`   | Music releases / discography             |
| `BiographySection` | `BiographySectionSlotProps`  | Band biography & members                 |
| `NewsSection`      | `NewsSectionSlotProps`       | News feed                                |
| `MediaSection`     | `MediaSectionSlotProps`      | Media files (audio, video)               |
| `GallerySection`   | `GallerySectionSlotProps`    | Image gallery                            |
| `SocialSection`    | `SocialSectionSlotProps`     | Social media links                       |
| `ContactSection`   | `ContactSectionSlotProps`    | Contact form                             |
| `PartnersSection`  | `PartnersSectionSlotProps`   | Partners & friends                       |

---

## Creating a Custom Theme

### 1. Create the directory

```
src/themes/my-theme/
```

### 2. Create `index.ts`

```ts
import type { ThemePackage } from '@/lib/types'

export const myTheme: ThemePackage = {
  id: 'my-theme',
  name: 'My Theme',
  description: 'A brief description.',
  author: 'Your Name',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
  },
  typography: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },

  // Override any slots — omitted slots use defaults automatically
  slots: {
    // Hero: MyHero,
    // GigsSection: MyGigsSection,
  },
}
```

### 3. Add scoped CSS

In `styles.css`, scope all rules with the theme's `data-theme` attribute:

```css
[data-theme="my-theme"] .hero-title {
  font-size: 4rem;
  letter-spacing: 0.3em;
}
```

The attribute is applied to `document.documentElement` by `applyThemeToDOM()` in `src/lib/theme-application.ts`.

### 4. Register the theme

Add your theme to `src/themes/index.ts`:

```ts
export { myTheme } from './my-theme'
```

Add it to the `builtInThemes` array, and add an entry to `THEME_CATALOG` in `src/lib/theme-registry.ts`.

---

## Theme Registry

`src/lib/theme-registry.ts` is the source of truth for:

- **Theme registration** — `registerTheme()` stores a `ThemePackage`
- **Slot resolution** — `resolveSlots()` fills in defaults for missing slots (all 24)
- **`useThemeSlots()`** hook — returns resolved slot components for the active preset
- **`THEME_CATALOG`** — metadata array for the theme selector UI
- **License status** (`free`, `premium`, `locked`) per theme

---

## Content-Section Slot Props

Content-section slots receive display data and an optional `editMode` flag. The slot props interfaces are defined in `src/lib/types.ts`:

```ts
// Example: GigsSectionSlotProps
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

The default slot components in `src/themes/default-slots.tsx` delegate to the existing section components in `src/components/`.

---

## CSS Variable Convention

Themes override CSS custom properties defined in `src/index.css`. Key variables:

| Variable           | Purpose                         |
| ------------------ | ------------------------------- |
| `--primary`        | Primary accent colour           |
| `--background`     | Page background                 |
| `--foreground`     | Foreground / text               |
| `--font-heading`   | Display / heading font family   |
| `--font-sans`      | Body text font family           |
| `--font-mono`      | Monospace font family           |
| `--radius`         | Default border-radius           |
