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

import type { WidgetPlugin, WidgetCategory, StoreItemLicense, StoreItemRating, StoreItemType, StoreTab, ThemeSettings } from './types'
import type { DesignPreset } from './types'
import { neuroklastClassicPreset, presetToThemeSettings } from './design-presets'

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
  /** License tier (free or premium) */
  license?: StoreItemLicense
  /** Community rating */
  rating?: StoreItemRating
  /** Searchable tags */
  tags?: readonly string[]
  /** Preview image URL (or data URI placeholder) */
  previewUrl?: string
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
    defaultConfig: {
      artist: '',
      appId: '',
      displayLimit: 5,
      showPastDates: false,
      layout: 'list',
      showTicketLinks: true,
      showVenueDetails: true,
    },
    license: 'free',
    rating: { average: 4.5, count: 28 },
    tags: ['events', 'concerts', 'live', 'bandsintown'],
  },
  {
    id: 'spotify-player',
    name: 'Spotify Player',
    description:
      'Embed a Spotify player for a playlist, album, or artist page. Visitors can listen without leaving the site.',
    category: 'music',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { uri: '', type: 'playlist', theme: 'dark', height: 352 },
    license: 'free',
    rating: { average: 4.8, count: 45 },
    tags: ['music', 'spotify', 'player', 'embed'],
  },
  {
    id: 'youtube-embed',
    name: 'YouTube Embed',
    description:
      'Embed a YouTube video or playlist as a section on the page.',
    category: 'video',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { videoId: '', playlistId: '', autoplay: false, startTime: 0 },
    license: 'free',
    rating: { average: 4.2, count: 19 },
    tags: ['video', 'youtube', 'embed', 'playlist'],
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
    license: 'premium',
    rating: { average: 4.0, count: 12 },
    tags: ['merch', 'shop', 'ecommerce', 'products'],
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
    license: 'premium',
    rating: { average: 4.3, count: 8 },
    tags: ['analytics', 'stats', 'dashboard', 'visitors'],
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description:
      'Embed a newsletter subscription form. Visitors can sign up directly on your site.',
    category: 'newsletter',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { title: '', description: '', placeholder: '', buttonText: '' },
    license: 'free',
    rating: { average: 4.6, count: 22 },
    tags: ['newsletter', 'email', 'signup', 'mailing-list'],
  },
  {
    id: 'instagram-feed',
    name: 'Instagram Feed',
    description:
      'Show a grid of photos from an Instagram account or a curated set of images with lightbox support.',
    category: 'social',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { imageCount: 6 },
    license: 'free',
    rating: { average: 4.4, count: 17 },
    tags: ['instagram', 'social', 'photos', 'gallery', 'feed'],
  },
  {
    id: 'soundcloud-player',
    name: 'SoundCloud Player',
    description:
      'Embed a SoundCloud track, playlist, or artist profile. Great for sharing demos or full releases.',
    category: 'music',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { url: '', color: '#ff5500', autoPlay: false, showVisualPlayer: false },
    license: 'free',
    rating: { average: 4.1, count: 14 },
    tags: ['soundcloud', 'music', 'player', 'embed', 'audio'],
  },
  {
    id: 'apple-music-player',
    name: 'Apple Music Player',
    description:
      'Embed an Apple Music player for a song, album, or playlist directly on your site.',
    category: 'music',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { embedUrl: '', height: 175 },
    license: 'free',
    rating: { average: 4.0, count: 9 },
    tags: ['apple-music', 'music', 'player', 'embed', 'itunes'],
  },
  {
    id: 'custom-html',
    name: 'Custom HTML Embed',
    description:
      'Embed arbitrary HTML, external scripts, or iFrames. Use for Kickstarter campaigns, ticket providers, and more.',
    category: 'other',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { html: '', title: 'Custom Embed', height: 400 },
    license: 'free',
    rating: { average: 3.8, count: 6 },
    tags: ['html', 'embed', 'iframe', 'custom', 'script'],
  },
  {
    id: 'discord-widget',
    name: 'Discord Server Widget',
    description:
      'Show your Discord server widget so fans can see who is online and join your community.',
    category: 'social',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { serverId: '', theme: 'dark', height: 500 },
    license: 'free',
    rating: { average: 4.5, count: 31 },
    tags: ['discord', 'social', 'community', 'chat'],
  },
  {
    id: 'patreon-widget',
    name: 'Patreon Widget',
    description:
      'Showcase your Patreon page and supporter tiers, encouraging fans to back your work.',
    category: 'other',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { creatorName: '', pageUrl: '' },
    license: 'free',
    rating: { average: 4.2, count: 11 },
    tags: ['patreon', 'crowdfunding', 'support', 'membership'],
  },
  {
    id: 'eventbrite-widget',
    name: 'Eventbrite Events',
    description:
      'Display and sell tickets to upcoming events via Eventbrite, embedded directly on your site.',
    category: 'events',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { organizerId: '', eventId: '', height: 500 },
    license: 'free',
    rating: { average: 4.0, count: 7 },
    tags: ['eventbrite', 'events', 'tickets', 'live'],
  },
  {
    id: 'setlistfm-widget',
    name: 'Setlist.fm Recent Setlists',
    description:
      'Pull recent setlists from Setlist.fm and display them on your site so fans know what to expect at shows.',
    category: 'events',
    version: '1.0.0',
    author: 'Neuroklast',
    defaultConfig: { artistMbid: '', artistName: '' },
    license: 'free',
    rating: { average: 4.3, count: 13 },
    tags: ['setlist', 'setlistfm', 'events', 'concerts', 'live'],
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

// ─── Version helpers ─────────────────────────────────────────────────────────

/**
 * Parse a semver string into its numeric parts.
 * Returns `[0, 0, 0]` for malformed input so comparisons stay safe.
 */
function parseSemver(version: string): [number, number, number] {
  const parts = version.split('.').map(Number)
  const [major = 0, minor = 0, patch = 0] = parts
  return [major, minor, patch]
}

/**
 * Compare two semver strings.
 *
 * Returns:
 *  - `'none'`   — `next` is the same as or older than `current`
 *  - `'patch'`  — only the patch segment is higher
 *  - `'minor'`  — minor (or minor+patch) is higher
 *  - `'major'`  — major is higher (potentially breaking)
 */
export type VersionBump = 'none' | 'patch' | 'minor' | 'major'

export function compareVersions(current: string, next: string): VersionBump {
  const [curMaj, curMin, curPat] = parseSemver(current)
  const [nxtMaj, nxtMin, nxtPat] = parseSemver(next)

  if (nxtMaj > curMaj) return 'major'
  if (nxtMaj < curMaj) return 'none'
  if (nxtMin > curMin) return 'minor'
  if (nxtMin < curMin) return 'none'
  if (nxtPat > curPat) return 'patch'
  return 'none'
}

// ─── Update check ─────────────────────────────────────────────────────────────

export interface WidgetUpdateInfo {
  /** Widget ID */
  id: string
  /** Currently installed version */
  installedVersion: string
  /** Latest version available in the catalog */
  catalogVersion: string
  /** Semver bump type */
  bump: VersionBump
  /** True when the major version changed (potential breaking change) */
  isBreaking: boolean
}

/**
 * Compare every installed widget's version against the catalog and return
 * update-info objects for any widget that has a newer version available.
 */
export function checkWidgetUpdates(plugins: WidgetPlugin[]): WidgetUpdateInfo[] {
  const updates: WidgetUpdateInfo[] = []

  for (const plugin of plugins) {
    const entry = getCatalogEntry(plugin.id)
    if (!entry) continue

    const bump = compareVersions(plugin.version, entry.version)
    if (bump === 'none') continue

    updates.push({
      id: plugin.id,
      installedVersion: plugin.version,
      catalogVersion: entry.version,
      bump,
      isBreaking: bump === 'major',
    })
  }

  return updates
}

// ─── Apply update ─────────────────────────────────────────────────────────────

/**
 * Apply the catalog's latest metadata to an installed widget, preserving the
 * user's config, enabled state, and order.
 *
 * For major-version (potentially breaking) updates the caller should warn the
 * user first; this function performs the update regardless.
 *
 * Returns a new array – does not mutate the input.
 */
export function updateWidget(
  plugins: WidgetPlugin[],
  id: string,
): WidgetPlugin[] {
  const entry = getCatalogEntry(id)
  if (!entry) return plugins

  return plugins.map((p) => {
    if (p.id !== id) return p
    return {
      // Preserve user state
      installed: p.installed,
      enabled: p.enabled,
      order: p.order,
      category: p.category,
      config: p.config,
      themeOverrides: p.themeOverrides,
      // Refresh metadata from catalog
      id: entry.id,
      name: entry.name,
      description: entry.description,
      version: entry.version,
      author: entry.author,
    }
  })
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
      // Preserve user state
      id: p.id,
      installed: p.installed,
      enabled: p.enabled,
      order: p.order,
      category: p.category,
      config: p.config,
      themeOverrides: p.themeOverrides,
      // Update metadata from catalog
      name: entry.name,
      description: entry.description,
      version: entry.version,
      author: entry.author,
    }
  })
}

// ─── Store helpers ───────────────────────────────────────────────────────────

/**
 * A unified store item that can represent either a widget or a theme.
 * Used by the StoreDialog to present a single, filterable list.
 */
export interface StoreItem {
  id: string
  name: string
  description: string
  type: StoreItemType
  version: string
  author?: string
  license: StoreItemLicense
  rating: StoreItemRating
  tags: readonly string[]
  /** True when the item is already installed/applied */
  installed: boolean
  /** True when the item is currently active/enabled */
  enabled: boolean
  /** Widget category (only for type === 'widget') */
  category?: WidgetCategory
  previewUrl?: string
  /** True when a newer catalog version is available for this installed widget */
  hasUpdate?: boolean
  /** The newer version string available in the catalog */
  updateVersion?: string
  /** Whether the available update is a potentially breaking major-version bump */
  updateIsBreaking?: boolean
}

/**
 * Build a unified list of store items from the widget catalog and design
 * presets.  The `plugins` array tells us which widgets are installed /
 * enabled; `activePresetId` tells us which theme preset is active.
 */
export function buildStoreItems(
  plugins: WidgetPlugin[],
  presets: Record<string, DesignPreset>,
  activePresetId?: string,
): StoreItem[] {
  const installedMap = new Map(plugins.map((p) => [p.id, p]))
  const updateInfoMap = new Map(checkWidgetUpdates(plugins).map((u) => [u.id, u]))

  const widgetItems: StoreItem[] = WIDGET_CATALOG.map((entry) => {
    const installed = installedMap.get(entry.id)
    const updateInfo = installed ? updateInfoMap.get(entry.id) : undefined
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      type: 'widget' as const,
      version: installed?.version ?? entry.version,
      author: entry.author,
      license: entry.license ?? 'free',
      rating: entry.rating ?? { average: 0, count: 0 },
      tags: entry.tags ?? [],
      installed: !!installed,
      enabled: installed?.enabled ?? false,
      category: entry.category,
      previewUrl: entry.previewUrl,
      hasUpdate: !!updateInfo,
      updateVersion: updateInfo?.catalogVersion,
      updateIsBreaking: updateInfo?.isBreaking,
    }
  })

  const themeItems: StoreItem[] = Object.values(presets).map((preset) => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    type: 'theme' as const,
    version: '1.0.0',
    author: 'Neuroklast',
    license: 'free' as const,
    rating: { average: 4.5, count: 20 },
    tags: ['theme', 'preset', preset.id],
    installed: true, // themes are always "installed"
    enabled: activePresetId === preset.id,
    previewUrl: undefined,
  }))

  return [...widgetItems, ...themeItems]
}

/**
 * Filter store items by tab, search query, and optional license tier.
 */
export function filterStoreItems(
  items: StoreItem[],
  tab: StoreTab,
  search: string,
  license?: StoreItemLicense,
): StoreItem[] {
  let filtered = items

  // Tab filter
  if (tab === 'widgets') filtered = filtered.filter((i) => i.type === 'widget')
  if (tab === 'themes') filtered = filtered.filter((i) => i.type === 'theme')

  // License filter
  if (license) filtered = filtered.filter((i) => i.license === license)

  // Text search (name, description, tags)
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    filtered = filtered.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }

  return filtered
}

// ─── Mix-and-Match ───────────────────────────────────────────────────────────

/**
 * Compose a custom `ThemeSettings` by merging selected parts from multiple
 * design presets.  Each entry in `parts` identifies a preset and which
 * aspect(s) to take from it.
 *
 * Aspects:
 * - `colors` — apply the preset's color palette
 * - `fonts`  — apply the preset's font pairings
 * - `effects` — apply overlay effects & animation settings
 *
 * Later entries override earlier ones when aspects overlap.
 */
export type MixAspect = 'colors' | 'fonts' | 'effects'

export interface MixPart {
  presetId: string
  aspects: MixAspect[]
}

export function mixThemeSettings(
  parts: MixPart[],
  presets: Record<string, DesignPreset>,
  base?: Partial<ThemeSettings>,
): ThemeSettings {
  // Start from the cyberpunk default palette to avoid hardcoded values
  let result: ThemeSettings = {
    ...presetToThemeSettings(neuroklastClassicPreset),
    ...base,
  }

  for (const part of parts) {
    const preset = presets[part.presetId]
    if (!preset) continue

    for (const aspect of part.aspects) {
      if (aspect === 'colors') {
        result = {
          ...result,
          primary: preset.colors.primary,
          accent: preset.colors.accent,
          background: preset.colors.background,
          card: preset.colors.card,
          foreground: preset.colors.foreground,
          mutedForeground: preset.colors.mutedForeground,
          border: preset.colors.border,
          secondary: preset.colors.secondary,
          borderRadius: preset.borderRadius,
        }
      }
      if (aspect === 'fonts') {
        result = {
          ...result,
          fontHeading: preset.fonts.heading,
          fontBody: preset.fonts.body,
          fontMono: preset.fonts.mono,
        }
      }
      if (aspect === 'effects') {
        result = {
          ...result,
          ...(preset.overlayEffects ? { overlayEffects: preset.overlayEffects } : {}),
          ...(preset.animationSettings ? { animationSettings: preset.animationSettings } : {}),
          // heroStyle and loadingScreenType are NOT applied from presets — those are
          // structural layout properties belonging to the Theme Engine.
        }
      }
    }
  }

  result.activePreset = 'custom-mix'
  return result
}
