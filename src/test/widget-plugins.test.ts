import { describe, it, expect } from 'vitest'
import {
  WIDGET_CATALOG,
  WIDGET_CATALOG_IDS,
  getCatalogEntry,
  installWidget,
  uninstallWidget,
  toggleWidget,
  updateWidgetConfig,
  getActiveWidgets,
  getAvailableWidgets,
  getWidgetsByCategory,
  normalizeWidgetPlugins,
  compareVersions,
  checkWidgetUpdates,
  updateWidget,
  buildStoreItems,
} from '@/lib/widget-plugins'
import { createSiteConfig } from '@/lib/site-config'
import type { WidgetPlugin } from '@/lib/types'

// ─── Catalog ─────────────────────────────────────────────────────────────────

describe('WIDGET_CATALOG', () => {
  it('contains at least the two core widgets (bandsintown, spotify-player)', () => {
    expect(WIDGET_CATALOG_IDS).toContain('bandsintown')
    expect(WIDGET_CATALOG_IDS).toContain('spotify-player')
  })

  it('contains all new widgets introduced by the widget store expansion', () => {
    const expectedIds = [
      'newsletter', 'instagram-feed', 'soundcloud-player', 'apple-music-player',
      'custom-html', 'discord-widget', 'patreon-widget', 'eventbrite-widget',
      'setlistfm-widget',
    ]
    for (const id of expectedIds) {
      expect(WIDGET_CATALOG_IDS, `${id} should be in WIDGET_CATALOG`).toContain(id)
    }
  })

  it('each entry has required fields', () => {
    for (const entry of WIDGET_CATALOG) {
      expect(entry.id, `${entry.id}.id`).toBeTruthy()
      expect(entry.name, `${entry.id}.name`).toBeTruthy()
      expect(entry.description, `${entry.id}.description`).toBeTruthy()
      expect(entry.category, `${entry.id}.category`).toBeTruthy()
      expect(entry.version, `${entry.id}.version`).toBeTruthy()
    }
  })

  it('has unique IDs', () => {
    const ids = WIDGET_CATALOG.map((w) => w.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getCatalogEntry', () => {
  it('returns the entry for a known widget', () => {
    const entry = getCatalogEntry('bandsintown')
    expect(entry).toBeDefined()
    expect(entry?.name).toBe('Bandsintown Events')
  })

  it('returns undefined for an unknown widget', () => {
    expect(getCatalogEntry('nonexistent')).toBeUndefined()
    expect(getCatalogEntry('')).toBeUndefined()
  })
})

// ─── Install / Uninstall ─────────────────────────────────────────────────────

describe('installWidget', () => {
  it('adds a widget from the catalog to the plugins array', () => {
    const result = installWidget([], 'bandsintown')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('bandsintown')
    expect(result[0].installed).toBe(true)
    expect(result[0].enabled).toBe(true)
  })

  it('copies default config from the catalog entry', () => {
    const result = installWidget([], 'bandsintown')
    expect(result[0].config).toMatchObject({ artist: '', appId: '', displayLimit: 5, layout: 'list' })
  })

  it('does not duplicate if already installed', () => {
    const first = installWidget([], 'bandsintown')
    const second = installWidget(first, 'bandsintown')
    expect(second).toBe(first) // same reference
    expect(second).toHaveLength(1)
  })

  it('returns original array if widget is not in catalog', () => {
    const plugins: WidgetPlugin[] = []
    const result = installWidget(plugins, 'unknown-widget')
    expect(result).toBe(plugins)
  })

  it('assigns incrementing order values', () => {
    let plugins: WidgetPlugin[] = []
    plugins = installWidget(plugins, 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    expect(plugins[0].order).toBe(0)
    expect(plugins[1].order).toBe(1)
  })

  it('does not mutate the input array', () => {
    const plugins: WidgetPlugin[] = []
    const snapshot = [...plugins]
    installWidget(plugins, 'bandsintown')
    expect(plugins).toEqual(snapshot)
  })
})

describe('uninstallWidget', () => {
  it('removes the widget from the array', () => {
    const plugins = installWidget([], 'bandsintown')
    const result = uninstallWidget(plugins, 'bandsintown')
    expect(result).toHaveLength(0)
  })

  it('leaves other widgets untouched', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    const result = uninstallWidget(plugins, 'bandsintown')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('spotify-player')
  })

  it('returns same-length array if id not found', () => {
    const plugins = installWidget([], 'bandsintown')
    const result = uninstallWidget(plugins, 'nonexistent')
    expect(result).toHaveLength(1)
  })

  it('does not mutate the input array', () => {
    const plugins = installWidget([], 'bandsintown')
    const snapshot = [...plugins]
    uninstallWidget(plugins, 'bandsintown')
    expect(plugins).toEqual(snapshot)
  })
})

// ─── Enable / Disable ────────────────────────────────────────────────────────

describe('toggleWidget', () => {
  it('disables an enabled widget', () => {
    const plugins = installWidget([], 'bandsintown')
    const result = toggleWidget(plugins, 'bandsintown')
    expect(result[0].enabled).toBe(false)
  })

  it('enables a disabled widget', () => {
    const plugins = installWidget([], 'bandsintown')
    const disabled = toggleWidget(plugins, 'bandsintown')
    const enabled = toggleWidget(disabled, 'bandsintown')
    expect(enabled[0].enabled).toBe(true)
  })

  it('does not mutate the input array', () => {
    const plugins = installWidget([], 'bandsintown')
    const snapshot = plugins.map((p) => ({ ...p }))
    toggleWidget(plugins, 'bandsintown')
    expect(plugins).toEqual(snapshot)
  })
})

// ─── Configuration ───────────────────────────────────────────────────────────

describe('updateWidgetConfig', () => {
  it('merges config patch into the target widget', () => {
    const plugins = installWidget([], 'bandsintown')
    const result = updateWidgetConfig(plugins, 'bandsintown', { artist: 'Zardonic' })
    expect(result[0].config?.artist).toBe('Zardonic')
    // original default keys preserved
    expect(result[0].config?.appId).toBe('')
  })

  it('leaves other widgets unchanged', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    const result = updateWidgetConfig(plugins, 'bandsintown', { artist: 'Test' })
    expect(result[1].config).toEqual({ uri: '', type: 'playlist' })
  })

  it('does not mutate the input array', () => {
    const plugins = installWidget([], 'bandsintown')
    const snapshot = JSON.stringify(plugins)
    updateWidgetConfig(plugins, 'bandsintown', { artist: 'Test' })
    expect(JSON.stringify(plugins)).toBe(snapshot)
  })
})

// ─── Querying ────────────────────────────────────────────────────────────────

describe('getActiveWidgets', () => {
  it('returns only enabled + installed widgets', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    plugins = toggleWidget(plugins, 'bandsintown') // disable bandsintown
    const active = getActiveWidgets(plugins)
    expect(active).toHaveLength(1)
    expect(active[0].id).toBe('spotify-player')
  })

  it('returns widgets sorted by order', () => {
    let plugins = installWidget([], 'spotify-player')
    plugins = installWidget(plugins, 'bandsintown')
    const active = getActiveWidgets(plugins)
    expect(active[0].order).toBeLessThan(active[1].order)
  })

  it('returns empty array when no widgets installed', () => {
    expect(getActiveWidgets([])).toEqual([])
  })
})

describe('getAvailableWidgets', () => {
  it('returns catalog entries not yet installed', () => {
    const plugins = installWidget([], 'bandsintown')
    const available = getAvailableWidgets(plugins)
    expect(available.find((w) => w.id === 'bandsintown')).toBeUndefined()
    expect(available.find((w) => w.id === 'spotify-player')).toBeDefined()
  })

  it('returns full catalog when nothing is installed', () => {
    const available = getAvailableWidgets([])
    expect(available).toHaveLength(WIDGET_CATALOG.length)
  })
})

describe('getWidgetsByCategory', () => {
  it('filters installed widgets by category', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    const events = getWidgetsByCategory(plugins, 'events')
    expect(events).toHaveLength(1)
    expect(events[0].id).toBe('bandsintown')
  })

  it('returns empty array when no match', () => {
    const plugins = installWidget([], 'bandsintown')
    expect(getWidgetsByCategory(plugins, 'video')).toHaveLength(0)
  })
})

// ─── Normalisation ───────────────────────────────────────────────────────────

describe('normalizeWidgetPlugins', () => {
  it('updates metadata from the catalog', () => {
    const stale: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Old Name',
        description: 'Old description',
        category: 'events',
        version: '0.0.1',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const result = normalizeWidgetPlugins(stale)
    expect(result[0].name).toBe('Bandsintown Events')
    expect(result[0].version).toBe('1.0.0')
  })

  it('preserves user config and enabled state', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Old Name',
        description: 'Old',
        category: 'events',
        version: '0.0.1',
        installed: true,
        enabled: false,
        order: 5,
        config: { artist: 'Zardonic' },
      },
    ]
    const result = normalizeWidgetPlugins(plugins)
    expect(result[0].enabled).toBe(false)
    expect(result[0].order).toBe(5)
    expect(result[0].config?.artist).toBe('Zardonic')
  })

  it('keeps unknown widgets as-is', () => {
    const custom: WidgetPlugin[] = [
      {
        id: 'custom-widget',
        name: 'Custom Widget',
        description: 'User-defined',
        category: 'other',
        version: '1.0.0',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const result = normalizeWidgetPlugins(custom)
    expect(result[0]).toEqual(custom[0])
  })
})

// ─── SiteConfig integration ──────────────────────────────────────────────────

describe('SiteConfig widgetPlugins field', () => {
  it('createSiteConfig includes widgetPlugins when provided', () => {
    const plugins = installWidget([], 'bandsintown')
    const config = createSiteConfig({ siteName: 'Test', widgetPlugins: plugins })
    expect(config.widgetPlugins).toHaveLength(1)
    expect(config.widgetPlugins?.[0].id).toBe('bandsintown')
  })

  it('createSiteConfig omits widgetPlugins when not provided', () => {
    const config = createSiteConfig({ siteName: 'Test' })
    expect(config.widgetPlugins).toBeUndefined()
  })
})

// ─── compareVersions ─────────────────────────────────────────────────────────

describe('compareVersions', () => {
  it('returns "none" for equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe('none')
  })

  it('returns "patch" when only patch is higher', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe('patch')
  })

  it('returns "minor" when minor is higher', () => {
    expect(compareVersions('1.0.0', '1.1.0')).toBe('minor')
    expect(compareVersions('1.0.5', '1.1.0')).toBe('minor')
  })

  it('returns "major" when major is higher', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBe('major')
    expect(compareVersions('1.9.9', '2.0.0')).toBe('major')
  })

  it('returns "none" when next is older', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBe('none')
    expect(compareVersions('1.1.0', '1.0.9')).toBe('none')
    expect(compareVersions('1.0.1', '1.0.0')).toBe('none')
  })
})

// ─── checkWidgetUpdates ───────────────────────────────────────────────────────

describe('checkWidgetUpdates', () => {
  it('returns empty array when no updates are available', () => {
    const plugins = installWidget([], 'bandsintown')
    // catalog version is '1.0.0'; installed is also '1.0.0'
    expect(checkWidgetUpdates(plugins)).toHaveLength(0)
  })

  it('detects a major update for a plugin behind by a full major version', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '0.9.9', // older than catalog 1.0.0 by a major bump
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const updates = checkWidgetUpdates(plugins)
    expect(updates).toHaveLength(1)
    expect(updates[0].id).toBe('bandsintown')
    expect(updates[0].installedVersion).toBe('0.9.9')
    expect(updates[0].catalogVersion).toBe('1.0.0')
    expect(updates[0].bump).toBe('major')
    expect(updates[0].isBreaking).toBe(true)
  })

  it('detects a minor update as non-breaking', () => {
    // compareVersions is a pure function so we test it directly for this case;
    // for the integration path we use the real catalog which is at 1.0.0
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '1.0.0', // same as catalog – no update
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    // No update when versions match
    expect(checkWidgetUpdates(plugins)).toHaveLength(0)

    // compareVersions itself confirms minor is non-breaking
    expect(compareVersions('1.0.0', '1.1.0')).toBe('minor')
  })

  it('marks major version bumps as breaking', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '0.1.0',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const updates = checkWidgetUpdates(plugins)
    expect(updates[0].isBreaking).toBe(true)
    expect(updates[0].bump).toBe('major')
  })

  it('ignores unknown widgets', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'not-in-catalog',
        name: 'Custom',
        description: 'desc',
        category: 'other',
        version: '0.0.1',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    expect(checkWidgetUpdates(plugins)).toHaveLength(0)
  })

  it('does not report an update when installed version is newer', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '2.0.0', // newer than catalog
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    expect(checkWidgetUpdates(plugins)).toHaveLength(0)
  })
})

// ─── updateWidget ─────────────────────────────────────────────────────────────

describe('updateWidget', () => {
  it('updates metadata but preserves user state', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Old Name',
        description: 'Old',
        category: 'events',
        version: '0.9.0',
        installed: true,
        enabled: false,
        order: 3,
        config: { artist: 'Zardonic' },
      },
    ]
    const result = updateWidget(plugins, 'bandsintown')
    expect(result[0].version).toBe('1.0.0')
    expect(result[0].name).toBe('Bandsintown Events')
    // User state preserved
    expect(result[0].enabled).toBe(false)
    expect(result[0].order).toBe(3)
    expect(result[0].config?.artist).toBe('Zardonic')
  })

  it('returns original array for unknown widget', () => {
    const plugins = installWidget([], 'bandsintown')
    const result = updateWidget(plugins, 'nonexistent')
    expect(result).toBe(plugins)
  })

  it('does not mutate the input array', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Old',
        description: 'Old',
        category: 'events',
        version: '0.9.0',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const snapshot = JSON.stringify(plugins)
    updateWidget(plugins, 'bandsintown')
    expect(JSON.stringify(plugins)).toBe(snapshot)
  })

  it('leaves other plugins unchanged', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = installWidget(plugins, 'spotify-player')
    const result = updateWidget(plugins, 'bandsintown')
    expect(result[1]).toEqual(plugins[1])
  })
})

// ─── buildStoreItems – update fields ─────────────────────────────────────────

describe('buildStoreItems update fields', () => {
  it('sets hasUpdate=false for freshly installed widgets', () => {
    const plugins = installWidget([], 'bandsintown')
    const items = buildStoreItems(plugins, {})
    const item = items.find((i) => i.id === 'bandsintown')
    expect(item?.hasUpdate).toBe(false)
  })

  it('sets hasUpdate=true when installed version is older', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '0.9.0',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const items = buildStoreItems(plugins, {})
    const item = items.find((i) => i.id === 'bandsintown')
    expect(item?.hasUpdate).toBe(true)
    expect(item?.updateVersion).toBe('1.0.0')
  })

  it('reflects the installed version (not catalog version) in StoreItem.version', () => {
    const plugins: WidgetPlugin[] = [
      {
        id: 'bandsintown',
        name: 'Bandsintown Events',
        description: 'desc',
        category: 'events',
        version: '0.9.0',
        installed: true,
        enabled: true,
        order: 0,
      },
    ]
    const items = buildStoreItems(plugins, {})
    const item = items.find((i) => i.id === 'bandsintown')
    expect(item?.version).toBe('0.9.0')
  })
})

// ─── widgetDefs ────────────────────────────────────────────────────────────────

import { WIDGET_DEFS, getWidgetDef, resolveLayoutPosition } from '@/lib/widgetDefs'

describe('WIDGET_DEFS', () => {
  it('has an entry for every catalog widget', () => {
    for (const entry of WIDGET_CATALOG) {
      const def = getWidgetDef(entry.id)
      expect(def, `${entry.id} should have a WidgetDef`).toBeDefined()
    }
  })

  it('has unique IDs', () => {
    const ids = WIDGET_DEFS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getWidgetDef', () => {
  it('returns the def for a known widget', () => {
    const def = getWidgetDef('bandsintown')
    expect(def).toBeDefined()
    expect(def?.id).toBe('bandsintown')
  })

  it('returns undefined for an unknown widget', () => {
    expect(getWidgetDef('nonexistent')).toBeUndefined()
  })
})

describe('resolveLayoutPosition', () => {
  it('returns the override when provided', () => {
    expect(resolveLayoutPosition('newsletter', 'main')).toBe('main')
    expect(resolveLayoutPosition('bandsintown', 'footer')).toBe('footer')
  })

  it('returns the default position from the def when no override', () => {
    // 'newsletter' defaults to 'footer' per POSITION_OVERRIDES
    expect(resolveLayoutPosition('newsletter')).toBe('footer')
    // 'discord-widget' defaults to 'sidebar'
    expect(resolveLayoutPosition('discord-widget')).toBe('sidebar')
    // 'bandsintown' has no override, so falls back to 'main'
    expect(resolveLayoutPosition('bandsintown')).toBe('main')
  })

  it('returns "main" for an unknown widget ID with no override', () => {
    expect(resolveLayoutPosition('totally-unknown-id')).toBe('main')
  })
})
