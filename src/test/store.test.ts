import { describe, it, expect } from 'vitest'
import {
  WIDGET_CATALOG,
  buildStoreItems,
  filterStoreItems,
  mixThemeSettings,
  type StoreItem,
  type MixPart,
} from '@/lib/widget-plugins'
import { DESIGN_PRESETS, cyberpunkPreset, neonPreset, elegantPreset } from '@/lib/design-presets'
import { installWidget, toggleWidget } from '@/lib/widget-plugins'
import type { WidgetPlugin, StoreTab } from '@/lib/types'

// ─── Catalog store fields ────────────────────────────────────────────────────

describe('WIDGET_CATALOG store metadata', () => {
  it('every catalog entry has a license field', () => {
    for (const entry of WIDGET_CATALOG) {
      expect(entry.license, `${entry.id}.license`).toBeDefined()
      expect(['free', 'premium']).toContain(entry.license)
    }
  })

  it('every catalog entry has a rating object', () => {
    for (const entry of WIDGET_CATALOG) {
      expect(entry.rating, `${entry.id}.rating`).toBeDefined()
      expect(typeof entry.rating?.average).toBe('number')
      expect(typeof entry.rating?.count).toBe('number')
      expect(entry.rating!.average).toBeGreaterThanOrEqual(0)
      expect(entry.rating!.average).toBeLessThanOrEqual(5)
      expect(entry.rating!.count).toBeGreaterThanOrEqual(0)
    }
  })

  it('every catalog entry has tags', () => {
    for (const entry of WIDGET_CATALOG) {
      expect(entry.tags, `${entry.id}.tags`).toBeDefined()
      expect(entry.tags!.length).toBeGreaterThan(0)
    }
  })

  it('some entries are free, some are premium', () => {
    const free = WIDGET_CATALOG.filter((e) => e.license === 'free')
    const premium = WIDGET_CATALOG.filter((e) => e.license === 'premium')
    expect(free.length).toBeGreaterThan(0)
    expect(premium.length).toBeGreaterThan(0)
  })
})

// ─── buildStoreItems ─────────────────────────────────────────────────────────

describe('buildStoreItems', () => {
  it('includes all catalog widgets', () => {
    const items = buildStoreItems([], DESIGN_PRESETS)
    const widgetItems = items.filter((i) => i.type === 'widget')
    expect(widgetItems).toHaveLength(WIDGET_CATALOG.length)
  })

  it('includes all design presets as themes', () => {
    const items = buildStoreItems([], DESIGN_PRESETS)
    const themeItems = items.filter((i) => i.type === 'theme')
    expect(themeItems).toHaveLength(Object.keys(DESIGN_PRESETS).length)
  })

  it('marks installed widgets correctly', () => {
    const plugins = installWidget([], 'bandsintown')
    const items = buildStoreItems(plugins, DESIGN_PRESETS)
    const bt = items.find((i) => i.id === 'bandsintown')
    expect(bt?.installed).toBe(true)
    expect(bt?.enabled).toBe(true)
  })

  it('marks disabled widgets correctly', () => {
    let plugins = installWidget([], 'bandsintown')
    plugins = toggleWidget(plugins, 'bandsintown')
    const items = buildStoreItems(plugins, DESIGN_PRESETS)
    const bt = items.find((i) => i.id === 'bandsintown')
    expect(bt?.installed).toBe(true)
    expect(bt?.enabled).toBe(false)
  })

  it('marks active theme preset', () => {
    const items = buildStoreItems([], DESIGN_PRESETS, 'cyberpunk')
    const cyber = items.find((i) => i.id === 'cyberpunk' && i.type === 'theme')
    const neon = items.find((i) => i.id === 'neon' && i.type === 'theme')
    expect(cyber?.enabled).toBe(true)
    expect(neon?.enabled).toBe(false)
  })

  it('all items have required store fields', () => {
    const items = buildStoreItems([], DESIGN_PRESETS)
    for (const item of items) {
      expect(item.id, 'id').toBeTruthy()
      expect(item.name, 'name').toBeTruthy()
      expect(item.description, 'description').toBeTruthy()
      expect(['widget', 'theme']).toContain(item.type)
      expect(['free', 'premium']).toContain(item.license)
      expect(item.rating).toBeDefined()
      expect(item.tags).toBeDefined()
    }
  })
})

// ─── filterStoreItems ────────────────────────────────────────────────────────

describe('filterStoreItems', () => {
  const items = buildStoreItems([], DESIGN_PRESETS)

  it('returns all items with tab=all and no filters', () => {
    const result = filterStoreItems(items, 'all', '')
    expect(result).toHaveLength(items.length)
  })

  it('filters to widgets only', () => {
    const result = filterStoreItems(items, 'widgets', '')
    expect(result.every((i) => i.type === 'widget')).toBe(true)
    expect(result.length).toBe(WIDGET_CATALOG.length)
  })

  it('filters to themes only', () => {
    const result = filterStoreItems(items, 'themes', '')
    expect(result.every((i) => i.type === 'theme')).toBe(true)
    expect(result.length).toBe(Object.keys(DESIGN_PRESETS).length)
  })

  it('filters by search in name', () => {
    const result = filterStoreItems(items, 'all', 'spotify')
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((i) => i.id === 'spotify-player')).toBe(true)
  })

  it('filters by search in description', () => {
    const result = filterStoreItems(items, 'all', 'Bandsintown API')
    expect(result.some((i) => i.id === 'bandsintown')).toBe(true)
  })

  it('filters by search in tags', () => {
    const result = filterStoreItems(items, 'all', 'ecommerce')
    expect(result.some((i) => i.id === 'merch-store')).toBe(true)
  })

  it('filters by license tier', () => {
    const free = filterStoreItems(items, 'all', '', 'free')
    const premium = filterStoreItems(items, 'all', '', 'premium')
    expect(free.every((i) => i.license === 'free')).toBe(true)
    expect(premium.every((i) => i.license === 'premium')).toBe(true)
    expect(free.length + premium.length).toBe(items.length)
  })

  it('combines tab and search filters', () => {
    const result = filterStoreItems(items, 'widgets', 'spotify')
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((i) => i.type === 'widget')).toBe(true)
    expect(result.some((i) => i.id === 'spotify-player')).toBe(true)
  })

  it('returns empty array for no match', () => {
    const result = filterStoreItems(items, 'all', 'zzzzzzz-no-match')
    expect(result).toHaveLength(0)
  })

  it('search is case-insensitive', () => {
    const result = filterStoreItems(items, 'all', 'SPOTIFY')
    expect(result.some((i) => i.id === 'spotify-player')).toBe(true)
  })
})

// ─── mixThemeSettings ────────────────────────────────────────────────────────

describe('mixThemeSettings', () => {
  it('applies colors from one preset and fonts from another', () => {
    const parts: MixPart[] = [
      { presetId: 'cyberpunk', aspects: ['colors'] },
      { presetId: 'elegant', aspects: ['fonts'] },
    ]
    const result = mixThemeSettings(parts, DESIGN_PRESETS)

    // Colors from cyberpunk
    expect(result.primary).toBe(cyberpunkPreset.colors.primary)
    expect(result.accent).toBe(cyberpunkPreset.colors.accent)
    expect(result.background).toBe(cyberpunkPreset.colors.background)

    // Fonts from elegant
    expect(result.fontHeading).toBe(elegantPreset.fonts.heading)
    expect(result.fontBody).toBe(elegantPreset.fonts.body)
    expect(result.fontMono).toBe(elegantPreset.fonts.mono)
  })

  it('applies effects from a third preset', () => {
    const parts: MixPart[] = [
      { presetId: 'cyberpunk', aspects: ['colors'] },
      { presetId: 'elegant', aspects: ['fonts'] },
      { presetId: 'zardonic-industrial', aspects: ['effects'] },
    ]
    const result = mixThemeSettings(parts, DESIGN_PRESETS)
    expect(result.overlayEffects).toBeDefined()
    expect(result.overlayEffects?.scanlines?.enabled).toBe(true)
  })

  it('sets activePreset to "custom-mix"', () => {
    const parts: MixPart[] = [{ presetId: 'neon', aspects: ['colors'] }]
    const result = mixThemeSettings(parts, DESIGN_PRESETS)
    expect(result.activePreset).toBe('custom-mix')
  })

  it('later parts override earlier ones for the same aspect', () => {
    const parts: MixPart[] = [
      { presetId: 'cyberpunk', aspects: ['colors'] },
      { presetId: 'neon', aspects: ['colors'] },
    ]
    const result = mixThemeSettings(parts, DESIGN_PRESETS)
    expect(result.primary).toBe(neonPreset.colors.primary)
  })

  it('skips unknown preset IDs', () => {
    const parts: MixPart[] = [
      { presetId: 'nonexistent', aspects: ['colors'] },
      { presetId: 'cyberpunk', aspects: ['fonts'] },
    ]
    const result = mixThemeSettings(parts, DESIGN_PRESETS)
    // Colors should be from defaults (not overwritten)
    expect(result.primary).toBe('oklch(0.50 0.22 25)')
    // Fonts from cyberpunk
    expect(result.fontHeading).toBe(cyberpunkPreset.fonts.heading)
  })

  it('returns defaults when no parts are provided', () => {
    const result = mixThemeSettings([], DESIGN_PRESETS)
    expect(result.primary).toBe('oklch(0.50 0.22 25)')
    expect(result.activePreset).toBe('custom-mix')
  })

  it('respects the base parameter', () => {
    const base = { primary: 'red', fontHeading: 'Comic Sans' }
    const result = mixThemeSettings([], DESIGN_PRESETS, base)
    expect(result.primary).toBe('red')
    expect(result.fontHeading).toBe('Comic Sans')
  })
})
