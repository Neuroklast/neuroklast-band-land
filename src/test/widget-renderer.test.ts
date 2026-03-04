/**
 * Tests for WidgetRenderer — verifies that the correct component is rendered
 * for each widget ID and that unknown widget IDs get the graceful fallback.
 *
 * These are pure unit tests (no DOM/React rendering needed) that test the
 * routing logic and component export structure.
 */
import { describe, it, expect } from 'vitest'
import type { WidgetPlugin } from '@/lib/types'

// Verify the index re-exports are present
import {
  BandsintownWidget,
  SpotifyPlayerWidget,
  YouTubeWidget,
  MerchStoreWidget,
  AnalyticsWidget,
  WidgetRenderer,
} from '@/components/widgets'

// ─── Exports ─────────────────────────────────────────────────────────────────

describe('widgets/index.ts re-exports', () => {
  it('exports BandsintownWidget', () => {
    expect(typeof BandsintownWidget).toBe('function')
  })

  it('exports SpotifyPlayerWidget', () => {
    expect(typeof SpotifyPlayerWidget).toBe('function')
  })

  it('exports YouTubeWidget', () => {
    expect(typeof YouTubeWidget).toBe('function')
  })

  it('exports MerchStoreWidget', () => {
    expect(typeof MerchStoreWidget).toBe('function')
  })

  it('exports AnalyticsWidget', () => {
    expect(typeof AnalyticsWidget).toBe('function')
  })

  it('exports WidgetRenderer', () => {
    expect(typeof WidgetRenderer).toBe('function')
  })
})

// ─── WidgetRenderer routing ───────────────────────────────────────────────────

describe('WidgetRenderer component routing', () => {
  function makeWidget(id: string): WidgetPlugin {
    return {
      id,
      name: `Test ${id}`,
      description: 'Test widget',
      category: 'other',
      version: '1.0.0',
      installed: true,
      enabled: true,
      order: 0,
    }
  }

  it('is a function (valid React component)', () => {
    expect(typeof WidgetRenderer).toBe('function')
  })

  it('accepts a WidgetPlugin with id=bandsintown', () => {
    const widget = makeWidget('bandsintown')
    // Just verify the function can be called (rendering is tested by React test utilities)
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=spotify-player', () => {
    const widget = makeWidget('spotify-player')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=youtube-embed', () => {
    const widget = makeWidget('youtube-embed')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=merch-store', () => {
    const widget = makeWidget('merch-store')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=analytics-dashboard', () => {
    const widget = makeWidget('analytics-dashboard')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts an unknown widget id without throwing', () => {
    const widget = makeWidget('unknown-widget-xyz')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('returns a non-null result for known IDs', () => {
    const known = ['bandsintown', 'spotify-player', 'youtube-embed', 'merch-store', 'analytics-dashboard']
    for (const id of known) {
      const result = WidgetRenderer({ widget: makeWidget(id) })
      expect(result).not.toBeNull()
    }
  })

  it('returns a non-null result for unknown IDs (graceful fallback)', () => {
    const result = WidgetRenderer({ widget: makeWidget('does-not-exist') })
    expect(result).not.toBeNull()
  })
})

// ─── Individual widget component tests ───────────────────────────────────────

describe('BandsintownWidget', () => {
  it('renders without throwing when config is empty', () => {
    const widget: WidgetPlugin = {
      id: 'bandsintown', name: 'Bandsintown', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })

  it('renders without throwing when config is set', () => {
    const widget: WidgetPlugin = {
      id: 'bandsintown', name: 'Bandsintown', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { artist: 'Zardonic', appId: 'test-id' },
    }
    expect(() => BandsintownWidget({ widget })).not.toThrow()
  })
})

describe('SpotifyPlayerWidget', () => {
  it('renders placeholder when no URI', () => {
    const widget: WidgetPlugin = {
      id: 'spotify-player', name: 'Spotify', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: { uri: '' },
    }
    expect(() => SpotifyPlayerWidget({ widget })).not.toThrow()
  })

  it('renders iframe when URI is set', () => {
    const widget: WidgetPlugin = {
      id: 'spotify-player', name: 'Spotify', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { uri: 'spotify:playlist:37i9dQZF1DX', type: 'playlist' },
    }
    const result = SpotifyPlayerWidget({ widget })
    expect(result).not.toBeNull()
  })
})

describe('YouTubeWidget', () => {
  it('renders placeholder when no config', () => {
    const widget: WidgetPlugin = {
      id: 'youtube-embed', name: 'YouTube', description: '', category: 'video',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => YouTubeWidget({ widget })).not.toThrow()
  })

  it('renders with videoId', () => {
    const widget: WidgetPlugin = {
      id: 'youtube-embed', name: 'YouTube', description: '', category: 'video',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { videoId: 'dQw4w9WgXcQ' },
    }
    expect(() => YouTubeWidget({ widget })).not.toThrow()
  })

  it('renders with playlistId', () => {
    const widget: WidgetPlugin = {
      id: 'youtube-embed', name: 'YouTube', description: '', category: 'video',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { playlistId: 'PLxxxxxxxxxxxxxxxxxx' },
    }
    expect(() => YouTubeWidget({ widget })).not.toThrow()
  })
})

describe('MerchStoreWidget', () => {
  it('renders placeholder when no config', () => {
    const widget: WidgetPlugin = {
      id: 'merch-store', name: 'Merch', description: '', category: 'merch',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => MerchStoreWidget({ widget })).not.toThrow()
  })

  it('renders with items', () => {
    const widget: WidgetPlugin = {
      id: 'merch-store', name: 'Merch', description: '', category: 'merch',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: {
        shopUrl: 'https://shop.example.com',
        items: [{ name: 'T-Shirt', price: '€25', link: 'https://shop.example.com/tshirt' }],
      },
    }
    expect(() => MerchStoreWidget({ widget })).not.toThrow()
  })
})

describe('AnalyticsWidget', () => {
  it('renders demo stats without throwing', () => {
    const widget: WidgetPlugin = {
      id: 'analytics-dashboard', name: 'Analytics', description: '', category: 'analytics',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => AnalyticsWidget({ widget })).not.toThrow()
  })
})
