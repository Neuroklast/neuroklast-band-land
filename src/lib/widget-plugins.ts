/**
 * Widget-plugin registry and utility functions.
 *
 * Widgets are optional, theme-aware components that can be installed,
 * activated, configured, and removed through an admin "store" interface.
 * They render as full sections and support theming, overlays, fonts, and
 * effects so they feel like first-class parts of the active design preset.
 *
 * Related issue: #163
 *
 * @example Zardonic-style integration
 * The Bandsintown widget replicates the event-listing section seen on
 * zardonic.net: an embedded event feed powered by the Bandsintown API,
 * styled to match the active theme.  The Spotify Player widget mirrors
 * the embedded playlist section, allowing visitors to listen without
 * leaving the page.
 */

import type { WidgetPlugin, WidgetCategory } from './types'

// ─── Widget catalog (the "store") ────────────────────────────────────────────

/**
 * Read-only catalog entry.  The catalog lists every widget that can be
 * installed – it is the source of truth for metadata such as name,
 * description, category and default config.
 */
export interface WidgetCatalogEntry {
  id: string
  name: string
  description: string
  category: WidgetCategory
  version: string
  author?: string
  /** Default widget-specific configuration */
  defaultConfig?: Record<string, unknown>
}

/** Built-in catalog of available widget plugins. */
export const WIDGET_CATALOG: readonly WidgetCatalogEntry[] = [
  {
    id: 'bandsintown',
    name: 'Bandsintown Events',
    description:
      'Display upcoming live dates via the Bandsintown API. Configure the artist name to pull events automatically.',
    category: 'events',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { artist: '', appId: '' },
  },
  {
    id: 'spotify-player',
    name: 'Spotify Player',
    description:
      'Embed a Spotify player for a playlist, album, or artist page. Visitors can listen without leaving the site.',
    category: 'music',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { uri: '', type: 'playlist' },
  },
  {
    id: 'youtube-embed',
    name: 'YouTube Embed',
    description:
      'Embed a YouTube video or playlist as a section on the page.',
    category: 'video',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { videoId: '', playlistId: '' },
  },
  {
    id: 'merch-store',
    name: 'Merch Store',
    description:
      'Showcase merchandise items with links to an external shop or embedded checkout.',
    category: 'merch',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { shopUrl: '', items: [] },
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description:
      'Display visitor and engagement analytics in a visual dashboard widget.',
    category: 'analytics',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: {},
  },
] as const

/** All widget IDs available in the catalog. */
export const WIDGET_CATALOG_IDS: readonly string[] = WIDGET_CATALOG.map((w) => w.id)

// ─── Catalog lookup ──────────────────────────────────────────────────────────

/**
 * Return the catalog entry for a given widget ID, or `undefined` if the
 * widget is not part of the catalog.
 */
export function getCatalogEntry(id: string): WidgetCatalogEntry | undefined {
  return WIDGET_CATALOG.find((w) => w.id === id)
}

// ─── Install / Uninstall ─────────────────────────────────────────────────────

/**
 * Install a widget from the catalog into the user's `widgetPlugins` array.
 * Returns a new array – does not mutate the input.
 *
 * If the widget is already installed the original array is returned unchanged.
 */
export function installWidget(
  plugins: WidgetPlugin[],
  id: string,
): WidgetPlugin[] {
  if (plugins.some((p) => p.id === id)) return plugins

  const entry = getCatalogEntry(id)
  if (!entry) return plugins

  const maxOrder = plugins.reduce((max, p) => Math.max(max, p.order), -1)

  const newPlugin: WidgetPlugin = {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    version: entry.version,
    author: entry.author,
    installed: true,
    enabled: true,
    order: maxOrder + 1,
    config: entry.defaultConfig ? { ...entry.defaultConfig } : undefined,
  }

  return [...plugins, newPlugin]
}

/**
 * Uninstall a widget, removing it from the user's `widgetPlugins` array.
 * Returns a new array – does not mutate the input.
 */
export function uninstallWidget(
  plugins: WidgetPlugin[],
  id: string,
): WidgetPlugin[] {
  return plugins.filter((p) => p.id !== id)
}

// ─── Enable / Disable ────────────────────────────────────────────────────────

/**
 * Toggle the `enabled` state of an installed widget.
 * Returns a new array – does not mutate the input.
 */
export function toggleWidget(
  plugins: WidgetPlugin[],
  id: string,
): WidgetPlugin[] {
  return plugins.map((p) =>
    p.id === id ? { ...p, enabled: !p.enabled } : p,
  )
}

// ─── Configuration ───────────────────────────────────────────────────────────

/**
 * Merge additional config into an installed widget's `config` object.
 * Returns a new array – does not mutate the input.
 */
export function updateWidgetConfig(
  plugins: WidgetPlugin[],
  id: string,
  patch: Record<string, unknown>,
): WidgetPlugin[] {
  return plugins.map((p) =>
    p.id === id ? { ...p, config: { ...p.config, ...patch } } : p,
  )
}

// ─── Querying ────────────────────────────────────────────────────────────────

/**
 * Return only the enabled (and installed) widgets, sorted by their `order`.
 */
export function getActiveWidgets(plugins: WidgetPlugin[]): WidgetPlugin[] {
  return plugins
    .filter((p) => p.installed && p.enabled)
    .sort((a, b) => a.order - b.order)
}

/**
 * Filter the catalog to widgets that have *not* been installed yet.
 */
export function getAvailableWidgets(plugins: WidgetPlugin[]): WidgetCatalogEntry[] {
  const installed = new Set(plugins.map((p) => p.id))
  return WIDGET_CATALOG.filter((w) => !installed.has(w.id))
}

/**
 * Filter installed widgets by category.
 */
export function getWidgetsByCategory(
  plugins: WidgetPlugin[],
  category: WidgetCategory,
): WidgetPlugin[] {
  return plugins.filter((p) => p.category === category)
}

// ─── Normalisation ───────────────────────────────────────────────────────────

/**
 * Ensure every installed widget has the latest metadata from the catalog
 * (name, description, version).  Unknown widgets are kept as-is so that
 * user data is never silently dropped.
 */
export function normalizeWidgetPlugins(plugins: WidgetPlugin[]): WidgetPlugin[] {
  return plugins.map((p) => {
    const entry = getCatalogEntry(p.id)
    if (!entry) return p
    return {
      ...p,
      name: entry.name,
      description: entry.description,
      version: entry.version,
      author: entry.author,
    }
  })
}
