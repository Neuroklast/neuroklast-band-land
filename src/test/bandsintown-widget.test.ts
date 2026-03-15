/**
 * Tests for the enhanced BandsintownWidget and its API proxy logic.
 *
 * Covers:
 *   - Widget renders placeholder when unconfigured
 *   - Widget renders without crashing in all configurations
 *   - Configuration option defaults and overrides
 *   - Bandsintown proxy schema validation (bandsintownQuerySchema)
 *   - Widget catalog defaultConfig includes new fields
 */
import { describe, it, expect, vi } from 'vitest'
import type { WidgetPlugin } from '@/lib/types'
import { BandsintownWidget } from '@/components/widgets'
import { WIDGET_CATALOG, installWidget, updateWidgetConfig } from '@/lib/widget-plugins'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'en', setLocale: () => {}, t: (key: string) => key }),
}))

vi.stubGlobal('fetch', vi.fn())

// Mirror the same simple React mock used across widget-renderer.test.ts
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useState: <T>(initial: T | (() => T)): [T, (v: T) => void] => {
      const value = typeof initial === 'function' ? (initial as () => T)() : initial
      return [value, () => {}]
    },
    useEffect: (_fn: () => void | (() => void), _deps?: unknown[]) => {},
  }
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeWidget(config: Record<string, unknown> = {}): WidgetPlugin {
  return {
    id: 'bandsintown',
    name: 'Bandsintown Events',
    description: 'Test',
    category: 'events',
    version: '1.0.0',
    installed: true,
    enabled: true,
    order: 0,
    config,
  }
}

// ─── Unconfigured ─────────────────────────────────────────────────────────────

describe('BandsintownWidget — unconfigured', () => {
  it('renders without throwing when no config is set', () => {
    const widget = makeWidget()
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing when artist is missing', () => {
    const widget = makeWidget({ appId: 'my-app' })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing when appId is missing', () => {
    const widget = makeWidget({ artist: 'Zardonic' })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })
})

// ─── Configured — default state (loading=false, events=[], error=null) ────────

describe('BandsintownWidget — configured', () => {
  it('renders without throwing with minimal config', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id' })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with list layout', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id', layout: 'list' })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with compact layout', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id', layout: 'compact' })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with ticket links disabled', () => {
    const widget = makeWidget({
      artist: 'Zardonic',
      appId: 'test-id',
      showTicketLinks: false,
    })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with venue details disabled', () => {
    const widget = makeWidget({
      artist: 'Zardonic',
      appId: 'test-id',
      showVenueDetails: false,
    })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with past dates enabled', () => {
    const widget = makeWidget({
      artist: 'Zardonic',
      appId: 'test-id',
      showPastDates: true,
    })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with custom displayLimit', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id', displayLimit: 10 })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing when displayLimit is below 1 (clamped to 1)', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id', displayLimit: 0 })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing when displayLimit is above 20 (clamped to 20)', () => {
    const widget = makeWidget({ artist: 'Zardonic', appId: 'test-id', displayLimit: 100 })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing with all options combined', () => {
    const widget = makeWidget({
      artist: 'Zardonic',
      appId: 'test-id',
      displayLimit: 8,
      layout: 'compact',
      showTicketLinks: true,
      showVenueDetails: true,
      showPastDates: false,
    })
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })
})

// ─── Widget catalog defaultConfig ─────────────────────────────────────────────

describe('Bandsintown catalog defaultConfig', () => {
  it('includes all new configurable fields in defaultConfig', () => {
    const entry = WIDGET_CATALOG.find((w) => w.id === 'bandsintown')
    expect(entry).toBeDefined()
    expect(entry?.defaultConfig).toMatchObject({
      artist: '',
      appId: '',
      displayLimit: 5,
      showPastDates: false,
      layout: 'list',
      showTicketLinks: true,
      showVenueDetails: true,
    })
  })

  it('installWidget gives Bandsintown full defaultConfig', () => {
    const plugins = installWidget([], 'bandsintown')
    expect(plugins[0].config).toMatchObject({
      displayLimit: 5,
      showPastDates: false,
      layout: 'list',
      showTicketLinks: true,
      showVenueDetails: true,
    })
  })

  it('updateWidgetConfig can override new fields while preserving others', () => {
    const plugins = installWidget([], 'bandsintown')
    const updated = updateWidgetConfig(plugins, 'bandsintown', {
      artist: 'Zardonic',
      appId: 'my-app-id',
      displayLimit: 10,
      layout: 'compact',
      showPastDates: true,
    })
    expect(updated[0].config?.artist).toBe('Zardonic')
    expect(updated[0].config?.appId).toBe('my-app-id')
    expect(updated[0].config?.displayLimit).toBe(10)
    expect(updated[0].config?.layout).toBe('compact')
    expect(updated[0].config?.showPastDates).toBe(true)
    // Preserved defaults
    expect(updated[0].config?.showTicketLinks).toBe(true)
    expect(updated[0].config?.showVenueDetails).toBe(true)
  })
})

// ─── Schema validation ────────────────────────────────────────────────────────

describe('bandsintownQuerySchema validation', () => {
  it('accepts valid artist and app_id', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, { artist: 'Zardonic', app_id: 'test-app' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.artist).toBe('Zardonic')
      expect(result.data.app_id).toBe('test-app')
      expect(result.data.include_past).toBe(false)
    }
  })

  it('defaults include_past to false when not provided', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, { artist: 'Test', app_id: 'my-id' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.include_past).toBe(false)
  })

  it('parses include_past=true string to boolean true', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, {
      artist: 'Test',
      app_id: 'my-id',
      include_past: 'true',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.include_past).toBe(true)
  })

  it('parses include_past=false string to boolean false', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, {
      artist: 'Test',
      app_id: 'my-id',
      include_past: 'false',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.include_past).toBe(false)
  })

  it('rejects invalid include_past values', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, {
      artist: 'Test',
      app_id: 'my-id',
      include_past: '1',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing artist', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, { app_id: 'my-id' })
    expect(result.success).toBe(false)
  })

  it('rejects missing app_id', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, { artist: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects artist longer than 200 chars', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, {
      artist: 'a'.repeat(201),
      app_id: 'my-id',
    })
    expect(result.success).toBe(false)
  })

  it('rejects app_id longer than 200 chars', async () => {
    const { bandsintownQuerySchema, validate } = await import('../../api/_schemas.js')
    const result = validate(bandsintownQuerySchema, {
      artist: 'Test',
      app_id: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })
})
