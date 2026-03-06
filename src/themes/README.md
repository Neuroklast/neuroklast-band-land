# Themes System

This directory contains all theme packages for the Neuroklast Band Land site template. Each theme is a self-contained directory that can override default UI slots, provide background effects, custom card styles, section dividers, and scoped CSS.

---

## Directory Structure

```
src/themes/
├── index.ts                  # Barrel – exports all registered themes
├── cyberpunk/                # Example full theme
│   ├── index.ts              # Theme definition + preset
│   ├── BackgroundEffects.tsx # Optional custom background
│   ├── Card.tsx              # Optional custom card component
│   ├── Hero.tsx              # Optional custom hero section
│   ├── SectionDivider.tsx    # Optional section divider
│   └── styles.css            # Scoped CSS ([data-theme="cyberpunk"] selectors)
├── minimal/
│   └── ...
└── README.md                 # This file
```

---

## Theme Types

| Type     | Description                                                               |
| -------- | ------------------------------------------------------------------------- |
| `full`   | Provides custom slot components (Navigation, Hero, etc.) + effects/CSS    |
| `preset` | Color/font-only override – no custom components, relies on CSS variables  |

---

## Slot System

Themes can override three named UI slots used in `App.tsx`:

| Slot             | Props interface          | Description                                |
| ---------------- | ------------------------ | ------------------------------------------ |
| `Navigation`     | `NavigationSlotProps`    | Top navigation bar                         |
| `LoadingScreen`  | `LoadingScreenSlotProps` | Full-screen intro / boot animation         |
| `OverlayModal`   | `OverlayModalSlotProps`  | Full-screen modal for news/impressum, etc. |

If a theme does not export a slot, the default slot component from `src/components/` is used.

---

## Creating a Custom Theme

### 1. Create the directory

```
src/themes/my-theme/
```

### 2. Create `index.ts`

```ts
import type { ThemePackage } from '@/lib/types'
import { DesignPreset } from '@/lib/design-presets'

export const myTheme: ThemePackage = {
  id: 'my-theme',
  name: 'My Theme',
  description: 'A brief description.',
  version: '1.0.0',

  // Optional: override CSS preset (colors, fonts, radius)
  preset: DesignPreset.Cyberpunk, // or define a custom one

  // Optional: override UI slots
  slots: {
    // Navigation: MyNavigation,
    // LoadingScreen: MyLoadingScreen,
    // OverlayModal: MyOverlayModal,
  },

  // Optional: custom background component
  // BackgroundEffects: MyBackgroundEffects,
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

And register it in `src/lib/theme-registry.ts` by adding an entry to `THEME_CATALOG`.

---

## Theme Registry

`src/lib/theme-registry.ts` is the source of truth for:

- **License status** (`free`, `premium`, `locked`) per theme
- **License key prefix** for locked themes (e.g., `ZARDONIC-`)
- **`useThemeSlots()`** hook – returns resolved slot components for the active preset

---

## CSS Variable Convention

Themes override CSS custom properties defined in `src/index.css`. Key variables:

| Variable           | Purpose                         |
| ------------------ | ------------------------------- |
| `--color-primary`  | Primary accent colour           |
| `--color-bg`       | Page background                 |
| `--color-fg`       | Foreground / text               |
| `--font-display`   | Display / heading font family   |
| `--font-body`      | Body text font family           |
| `--font-mono`      | Monospace font family           |
| `--radius-md`      | Default border-radius           |

---

## Hero Slot Props

All theme Hero components must accept `HeroSlotProps`:

```ts
interface HeroSlotProps {
  name: string
  genres: string[]
  editMode: boolean
  onEdit: () => void
  logoUrl?: string
  titleImageUrl?: string
}
```
