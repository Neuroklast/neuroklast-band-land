# Widget Plugins

> Related issue: #163, #199

## Overview

Widget plugins are optional, theme-aware components that can be **installed**, **activated**, **configured**, and **removed** through the admin panel.  They render as full page sections and support theming, overlays, fonts, and effects so they feel like first-class parts of the active design preset.

The **Theme & Widget Store** (admin panel → STORE button) provides a unified UI for browsing, previewing, installing, enabling/disabling, and uninstalling both **widgets** and **theme presets**.  It also includes a **Mix-and-Match** panel that lets admins compose custom themes by combining colors, fonts, and effects from different presets.

## Architecture

```
src/lib/
├── widget-plugins.ts   # Registry, catalog, CRUD helpers, store utilities
├── types.ts            # WidgetPlugin, WidgetCategory, Store* types
├── design-presets.ts   # Bundled theme presets
└── site-config.ts      # SiteConfig.widgetPlugins persistence

src/components/
└── StoreDialog.tsx     # Admin store UI (browse, filter, install, mix-and-match)

src/test/
├── widget-plugins.test.ts  # Widget-plugin unit tests (33 cases)
└── store.test.ts           # Store utilities unit tests (27 cases)
```

### Key types

| Type | Location | Purpose |
|------|----------|---------|
| `WidgetPlugin` | `types.ts` | Runtime state of an installed widget (id, enabled, order, config, themeOverrides) |
| `WidgetCatalogEntry` | `widget-plugins.ts` | Read-only store listing (metadata + default config + license, rating, tags) |
| `WidgetCategory` | `types.ts` | Category enum: `events`, `music`, `video`, `social`, `analytics`, `merch`, `other` |
| `StoreItemLicense` | `types.ts` | License tier: `'free'` or `'premium'` |
| `StoreItemRating` | `types.ts` | Community rating: `{ average, count }` |
| `StoreItem` | `widget-plugins.ts` | Unified store item (widget or theme) for the store UI |
| `StoreTab` | `types.ts` | Tab filter: `'all'`, `'widgets'`, `'themes'` |
| `MixPart` | `widget-plugins.ts` | A single entry in a mix-and-match composition |

### Catalog

The **`WIDGET_CATALOG`** array acts as the "App Store".  It lists every available widget with its metadata and default configuration.  Users browse the catalog, install widgets, and configure them per-site.

Built-in widgets:

| ID | Name | Category | License | Default Config |
|----|------|----------|---------|----------------|
| `bandsintown` | Bandsintown Events | events | free | `{ artist, appId }` |
| `spotify-player` | Spotify Player | music | free | `{ uri, type }` |
| `youtube-embed` | YouTube Embed | video | free | `{ videoId, playlistId }` |
| `merch-store` | Merch Store | merch | premium | `{ shopUrl, items }` |
| `analytics-dashboard` | Analytics Dashboard | analytics | premium | `{}` |

## API Reference

All functions return new arrays and never mutate their inputs.

### Catalog

```ts
getCatalogEntry(id: string): WidgetCatalogEntry | undefined
```

### Install / Uninstall

```ts
installWidget(plugins: WidgetPlugin[], id: string): WidgetPlugin[]
uninstallWidget(plugins: WidgetPlugin[], id: string): WidgetPlugin[]
```

### Enable / Disable

```ts
toggleWidget(plugins: WidgetPlugin[], id: string): WidgetPlugin[]
```

### Configuration

```ts
updateWidgetConfig(plugins: WidgetPlugin[], id: string, patch: Record<string, unknown>): WidgetPlugin[]
```

### Querying

```ts
getActiveWidgets(plugins: WidgetPlugin[]): WidgetPlugin[]
getAvailableWidgets(plugins: WidgetPlugin[]): WidgetCatalogEntry[]
getWidgetsByCategory(plugins: WidgetPlugin[], category: WidgetCategory): WidgetPlugin[]
```

### Normalisation

```ts
normalizeWidgetPlugins(plugins: WidgetPlugin[]): WidgetPlugin[]
```

Updates metadata from the catalog while preserving user `config`, `enabled`, and `order`.

### Store Utilities

```ts
buildStoreItems(plugins: WidgetPlugin[], presets: Record<string, DesignPreset>, activePresetId?: string): StoreItem[]
```

Builds a unified list of store items from widget catalog entries and design presets.

```ts
filterStoreItems(items: StoreItem[], tab: StoreTab, search: string, license?: StoreItemLicense): StoreItem[]
```

Filters store items by tab (all/widgets/themes), text search (name, description, tags), and license tier.

### Mix-and-Match

```ts
mixThemeSettings(parts: MixPart[], presets: Record<string, DesignPreset>, base?: Partial<ThemeSettings>): ThemeSettings
```

Compose a custom theme by picking colors, fonts, and/or effects from different presets.  Each `MixPart` specifies a `presetId` and which `aspects` (`'colors'`, `'fonts'`, `'effects'`) to take from it.

## Usage Examples

### Installing and configuring the Bandsintown widget

```ts
import { installWidget, updateWidgetConfig, getActiveWidgets } from '@/lib/widget-plugins'

// Start with no plugins
let plugins: WidgetPlugin[] = []

// Install from catalog
plugins = installWidget(plugins, 'bandsintown')

// Configure the artist (e.g. for a Zardonic-style events section)
plugins = updateWidgetConfig(plugins, 'bandsintown', {
  artist: 'Zardonic',
  appId: 'my-app-id',
})

// Get all widgets that should render
const active = getActiveWidgets(plugins)
```

### Persisting in SiteConfig

```ts
import { createSiteConfig } from '@/lib/site-config'

const config = createSiteConfig({
  siteName: 'My Band',
  setupComplete: true,
  widgetPlugins: plugins,
})
```

### Mix-and-Match: composing a custom theme

```ts
import { mixThemeSettings } from '@/lib/widget-plugins'
import { DESIGN_PRESETS } from '@/lib/design-presets'

// Take colors from Neon, fonts from Elegant, effects from Zardonic Industrial
const customTheme = mixThemeSettings(
  [
    { presetId: 'neon', aspects: ['colors'] },
    { presetId: 'elegant', aspects: ['fonts'] },
    { presetId: 'zardonic-industrial', aspects: ['effects'] },
  ],
  DESIGN_PRESETS,
)
// customTheme.activePreset === 'custom-mix'
```

## Theming

Each `WidgetPlugin` supports an optional `themeOverrides` field (`Partial<ThemeSettings>`).  When a widget renders, the overrides are merged with the active theme so the widget can adapt its colours, fonts, and effects without breaking the global design.

This works identically to the existing design-preset system – see `src/lib/design-presets.ts` for the full `ThemeSettings` interface.

## Store Frontend

The **StoreDialog** component (`src/components/StoreDialog.tsx`) provides the admin-facing store UI.  It is opened via the STORE button in the admin edit controls panel.

Features:
- **Browse & Search**: Filter items by type (widgets/themes), text search, and license tier (free/premium)
- **Install / Uninstall**: One-click install and removal of widgets
- **Enable / Disable**: Toggle widgets on/off without uninstalling
- **Apply Theme**: Apply any built-in design preset with live preview
- **Mix & Match**: Combine colors, fonts, and effects from different presets into a custom theme
- **License Badges**: Free and Premium indicators on each store item
- **Ratings**: Community ratings displayed with star indicators

## Zardonic Integration Reference

The **Zardonic Industrial** design preset (`zardonic-industrial` in `design-presets.ts`) demonstrates the style that widget plugins should match:

- **CRT + glitch overlay effects** (scanlines, noise, vignette, chromatic aberration)
- **Aggressive red/orange colour palette**
- **Heavy font pairing** (JetBrains Mono + Space Grotesk)
- **3D-model loading screen** + glitch-parallax hero

The **Bandsintown widget** replicates the event-listing section on zardonic.net: an embedded event feed styled to match the active theme.  The **Spotify Player widget** mirrors the embedded playlist section, allowing visitors to listen without leaving the page.

Both widgets inherit overlay effects and colour tokens from the active design preset, ensuring they blend seamlessly with the rest of the page.

## Adding a New Widget

1. Add a `WidgetCatalogEntry` to the `WIDGET_CATALOG` array in `src/lib/widget-plugins.ts`.  Include `license`, `rating`, and `tags` for the store UI.
2. (Optional) Define a matching React component that reads its config from the `WidgetPlugin.config` object.
3. The widget will automatically appear in the admin store and can be installed, configured, and enabled by the site admin.
