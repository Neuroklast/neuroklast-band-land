# Widget Plugins

> Related issue: #163

## Overview

Widget plugins are optional, theme-aware components that can be **installed**, **activated**, **configured**, and **removed** through the admin panel.  They render as full page sections and support theming, overlays, fonts, and effects so they feel like first-class parts of the active design preset.

## Architecture

```
src/lib/
├── widget-plugins.ts   # Registry, catalog, CRUD helpers
├── types.ts            # WidgetPlugin & WidgetCategory types
└── site-config.ts      # SiteConfig.widgetPlugins persistence

src/test/
└── widget-plugins.test.ts  # Unit tests (33 cases)
```

### Key types

| Type | Location | Purpose |
|------|----------|---------|
| `WidgetPlugin` | `types.ts` | Runtime state of an installed widget (id, enabled, order, config, themeOverrides) |
| `WidgetCatalogEntry` | `widget-plugins.ts` | Read-only store listing (metadata + default config) |
| `WidgetCategory` | `types.ts` | Category enum: `events`, `music`, `video`, `social`, `analytics`, `merch`, `other` |

### Catalog

The **`WIDGET_CATALOG`** array acts as the "App Store".  It lists every available widget with its metadata and default configuration.  Users browse the catalog, install widgets, and configure them per-site.

Built-in widgets:

| ID | Name | Category | Default Config |
|----|------|----------|----------------|
| `bandsintown` | Bandsintown Events | events | `{ artist, appId }` |
| `spotify-player` | Spotify Player | music | `{ uri, type }` |
| `youtube-embed` | YouTube Embed | video | `{ videoId, playlistId }` |
| `merch-store` | Merch Store | merch | `{ shopUrl, items }` |
| `analytics-dashboard` | Analytics Dashboard | analytics | `{}` |

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

## Theming

Each `WidgetPlugin` supports an optional `themeOverrides` field (`Partial<ThemeSettings>`).  When a widget renders, the overrides are merged with the active theme so the widget can adapt its colours, fonts, and effects without breaking the global design.

This works identically to the existing design-preset system – see `src/lib/design-presets.ts` for the full `ThemeSettings` interface.

## Zardonic Integration Reference

The **Zardonic Industrial** design preset (`zardonic-industrial` in `design-presets.ts`) demonstrates the style that widget plugins should match:

- **CRT + glitch overlay effects** (scanlines, noise, vignette, chromatic aberration)
- **Aggressive red/orange colour palette**
- **Heavy font pairing** (JetBrains Mono + Space Grotesk)
- **3D-model loading screen** + glitch-parallax hero

The **Bandsintown widget** replicates the event-listing section on zardonic.net: an embedded event feed styled to match the active theme.  The **Spotify Player widget** mirrors the embedded playlist section, allowing visitors to listen without leaving the page.

Both widgets inherit overlay effects and colour tokens from the active design preset, ensuring they blend seamlessly with the rest of the page.

## Adding a New Widget

1. Add a `WidgetCatalogEntry` to the `WIDGET_CATALOG` array in `src/lib/widget-plugins.ts`.
2. (Optional) Define a matching React component that reads its config from the `WidgetPlugin.config` object.
3. The widget will automatically appear in the admin store and can be installed, configured, and enabled by the site admin.
