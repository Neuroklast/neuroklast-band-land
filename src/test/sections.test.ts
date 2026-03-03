import { describe, it, expect } from 'vitest'
import {
  buildDefaultSections,
  normalizeSections,
  getEnabledSections,
  getEnabledSectionIds,
  toggleSection,
  reorderSections,
  ALL_SECTION_IDS,
} from '@/lib/sections'
import type { SectionConfig } from '@/lib/types'

describe('buildDefaultSections', () => {
  it('returns a config for every known section', () => {
    const defaults = buildDefaultSections()
    expect(defaults).toHaveLength(ALL_SECTION_IDS.length)
  })

  it('enables all sections by default', () => {
    const defaults = buildDefaultSections()
    expect(defaults.every((s) => s.enabled)).toBe(true)
  })

  it('assigns unique sequential order values', () => {
    const defaults = buildDefaultSections()
    const orders = defaults.map((s) => s.order)
    expect(new Set(orders).size).toBe(orders.length)
  })
})

describe('normalizeSections', () => {
  it('adds missing sections with sensible defaults', () => {
    const partial: SectionConfig[] = [{ id: 'news', enabled: true, order: 0 }]
    const result = normalizeSections(partial)
    expect(result.length).toBeGreaterThan(1)
    const newsSection = result.find((s) => s.id === 'news')
    expect(newsSection?.enabled).toBe(true)
  })

  it('preserves user-supplied enabled flag', () => {
    const partial: SectionConfig[] = [{ id: 'gigs', enabled: false, order: 0 }]
    const result = normalizeSections(partial)
    expect(result.find((s) => s.id === 'gigs')?.enabled).toBe(false)
  })

  it('sorts by order ascending', () => {
    const input: SectionConfig[] = [
      { id: 'gigs', enabled: true, order: 2 },
      { id: 'news', enabled: true, order: 0 },
      { id: 'biography', enabled: true, order: 1 },
    ]
    const result = normalizeSections(input)
    const knownOrders = result
      .filter((s) => ['news', 'biography', 'gigs'].includes(s.id))
      .map((s) => s.id)
    expect(knownOrders.indexOf('news')).toBeLessThan(knownOrders.indexOf('biography'))
    expect(knownOrders.indexOf('biography')).toBeLessThan(knownOrders.indexOf('gigs'))
  })
})

describe('getEnabledSections', () => {
  it('excludes disabled sections', () => {
    const configs: SectionConfig[] = [
      { id: 'news', enabled: true, order: 0 },
      { id: 'gigs', enabled: false, order: 1 },
      { id: 'biography', enabled: true, order: 2 },
    ]
    const enabled = getEnabledSections(configs)
    expect(enabled.find((s) => s.id === 'gigs')).toBeUndefined()
    expect(enabled.find((s) => s.id === 'news')).toBeDefined()
  })

  it('returns sections in order', () => {
    const configs: SectionConfig[] = [
      { id: 'biography', enabled: true, order: 1 },
      { id: 'news', enabled: true, order: 0 },
    ]
    const enabled = getEnabledSections(configs)
    const ids = enabled.map((s) => s.id)
    expect(ids.indexOf('news')).toBeLessThan(ids.indexOf('biography'))
  })
})

describe('getEnabledSectionIds', () => {
  it('returns an array of string IDs', () => {
    const configs = buildDefaultSections()
    const ids = getEnabledSectionIds(configs)
    expect(ids.every((id) => typeof id === 'string')).toBe(true)
  })
})

describe('toggleSection', () => {
  it('flips enabled to false for a currently-enabled section', () => {
    const configs = buildDefaultSections()
    const result = toggleSection(configs, 'news')
    expect(result.find((s) => s.id === 'news')?.enabled).toBe(false)
  })

  it('flips enabled to true for a currently-disabled section', () => {
    const configs: SectionConfig[] = [{ id: 'news', enabled: false, order: 0 }]
    const result = toggleSection(configs, 'news')
    expect(result.find((s) => s.id === 'news')?.enabled).toBe(true)
  })

  it('does not mutate the original array', () => {
    const configs = buildDefaultSections()
    const original = configs.map((s) => ({ ...s }))
    toggleSection(configs, 'news')
    expect(configs).toEqual(original)
  })
})

describe('reorderSections', () => {
  it('moves a section to the target index', () => {
    const configs = buildDefaultSections()
    const firstId = configs[0].id
    const lastIndex = configs.length - 1
    const result = reorderSections(configs, firstId, lastIndex)
    const resultIds = result.map((s) => s.id)
    expect(resultIds[lastIndex]).toBe(firstId)
  })

  it('assigns sequential order values after reordering', () => {
    const configs = buildDefaultSections()
    const result = reorderSections(configs, configs[2].id, 0)
    const orders = result.map((s) => s.order)
    expect(orders).toEqual(orders.map((_, i) => i))
  })

  it('returns original if id not found', () => {
    const configs = buildDefaultSections()
    const result = reorderSections(configs, 'nonexistent', 0)
    expect(result).toEqual(normalizeSections(configs))
  })

  it('does not mutate the input array', () => {
    const configs = buildDefaultSections()
    const snapshot = JSON.stringify(configs)
    reorderSections(configs, configs[0].id, 3)
    expect(JSON.stringify(configs)).toBe(snapshot)
  })
})
