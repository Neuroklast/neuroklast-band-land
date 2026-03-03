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
} from '@/lib/widget-plugins'
import type { WidgetPlugin } from '@/lib/types'

// ─── Catalog ─────────────────────────────────────────────────────────────────

describe('WIDGET_CATALOG', () => {
  it('contains at least the two core widgets (bandsintown, spotify-player)', () => {
    expect(WIDGET_CATALOG_IDS).toContain('bandsintown')
    expect(WIDGET_CATALOG_IDS).toContain('spotify-player')
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
    expect(result[0].config).toEqual({ artist: '', appId: '' })
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
  it('createSiteConfig includes widgetPlugins when provided', async () => {
    const { createSiteConfig } = await import('@/lib/site-config')
    const plugins = installWidget([], 'bandsintown')
    const config = createSiteConfig({ siteName: 'Test', widgetPlugins: plugins })
    expect(config.widgetPlugins).toHaveLength(1)
    expect(config.widgetPlugins?.[0].id).toBe('bandsintown')
  })

  it('createSiteConfig omits widgetPlugins when not provided', async () => {
    const { createSiteConfig } = await import('@/lib/site-config')
    const config = createSiteConfig({ siteName: 'Test' })
    expect(config.widgetPlugins).toBeUndefined()
  })
})
