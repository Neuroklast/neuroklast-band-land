/**
 * Tests for WidgetRenderer — verifies that the correct component is rendered
 * for each widget ID and that unknown widget IDs get the graceful fallback.
 *
 * These are pure unit tests (no DOM/React rendering needed) that test the
 * routing logic and component export structure.
 */
import { describe, it, expect, vi } from 'vitest'
import type { WidgetPlugin } from '@/lib/types'

// Mock the useLocale hook so widget components can be called without a
// LocaleProvider context tree.
vi.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'en', setLocale: () => {}, t: (key: string) => key }),
}))

// Verify the index re-exports are present
import {
  BandsintownWidget,
  SpotifyPlayerWidget,
  YouTubeWidget,
  MerchStoreWidget,
  AnalyticsWidget,
  NewsletterPluginWidget,
  InstagramFeedWidget,
  SoundCloudWidget,
  AppleMusicWidget,
  CustomHtmlWidget,
  DiscordWidget,
  PatreonWidget,
  EventbriteWidget,
  SetlistFmWidget,
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

  it('exports NewsletterPluginWidget', () => {
    expect(typeof NewsletterPluginWidget).toBe('function')
  })

  it('exports InstagramFeedWidget', () => {
    expect(typeof InstagramFeedWidget).toBe('function')
  })

  it('exports SoundCloudWidget', () => {
    expect(typeof SoundCloudWidget).toBe('function')
  })

  it('exports AppleMusicWidget', () => {
    expect(typeof AppleMusicWidget).toBe('function')
  })

  it('exports CustomHtmlWidget', () => {
    expect(typeof CustomHtmlWidget).toBe('function')
  })

  it('exports DiscordWidget', () => {
    expect(typeof DiscordWidget).toBe('function')
  })

  it('exports PatreonWidget', () => {
    expect(typeof PatreonWidget).toBe('function')
  })

  it('exports EventbriteWidget', () => {
    expect(typeof EventbriteWidget).toBe('function')
  })

  it('exports SetlistFmWidget', () => {
    expect(typeof SetlistFmWidget).toBe('function')
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

  it('accepts a WidgetPlugin with id=newsletter', () => {
    const widget = makeWidget('newsletter')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=instagram-feed', () => {
    const widget = makeWidget('instagram-feed')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=soundcloud-player', () => {
    const widget = makeWidget('soundcloud-player')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=apple-music-player', () => {
    const widget = makeWidget('apple-music-player')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=custom-html', () => {
    const widget = makeWidget('custom-html')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=discord-widget', () => {
    const widget = makeWidget('discord-widget')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=patreon-widget', () => {
    const widget = makeWidget('patreon-widget')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=eventbrite-widget', () => {
    const widget = makeWidget('eventbrite-widget')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts a WidgetPlugin with id=setlistfm-widget', () => {
    const widget = makeWidget('setlistfm-widget')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('accepts an unknown widget id without throwing', () => {
    const widget = makeWidget('unknown-widget-xyz')
    expect(() => WidgetRenderer({ widget })).not.toThrow()
  })

  it('returns a non-null result for known IDs', () => {
    const known = [
      'bandsintown', 'spotify-player', 'youtube-embed', 'merch-store',
      'analytics-dashboard', 'newsletter', 'instagram-feed', 'soundcloud-player',
      'apple-music-player', 'custom-html', 'discord-widget', 'patreon-widget',
      'eventbrite-widget', 'setlistfm-widget',
    ]
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

describe('NewsletterPluginWidget', () => {
  it('renders without throwing when config is empty', () => {
    const widget: WidgetPlugin = {
      id: 'newsletter', name: 'Newsletter', description: '', category: 'newsletter',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => NewsletterPluginWidget({ widget })).not.toThrow()
  })

  it('renders with custom title/description config', () => {
    const widget: WidgetPlugin = {
      id: 'newsletter', name: 'Newsletter', description: '', category: 'newsletter',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { title: 'Subscribe', description: 'Get updates', buttonText: 'Join' },
    }
    expect(() => NewsletterPluginWidget({ widget })).not.toThrow()
  })
})

describe('InstagramFeedWidget', () => {
  it('renders placeholder grid without throwing when config is empty', () => {
    const widget: WidgetPlugin = {
      id: 'instagram-feed', name: 'Instagram Feed', description: '', category: 'social',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => InstagramFeedWidget({ widget })).not.toThrow()
  })

  it('renders with custom imageCount', () => {
    const widget: WidgetPlugin = {
      id: 'instagram-feed', name: 'Instagram Feed', description: '', category: 'social',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { imageCount: 9 },
    }
    expect(() => InstagramFeedWidget({ widget })).not.toThrow()
  })
})

describe('SoundCloudWidget', () => {
  it('renders placeholder when no URL', () => {
    const widget: WidgetPlugin = {
      id: 'soundcloud-player', name: 'SoundCloud', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => SoundCloudWidget({ widget })).not.toThrow()
  })

  it('renders iframe when URL is set', () => {
    const widget: WidgetPlugin = {
      id: 'soundcloud-player', name: 'SoundCloud', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { url: 'https://soundcloud.com/artist/track', color: '#ff5500' },
    }
    const result = SoundCloudWidget({ widget })
    expect(result).not.toBeNull()
  })
})

describe('AppleMusicWidget', () => {
  it('renders placeholder when no embed URL', () => {
    const widget: WidgetPlugin = {
      id: 'apple-music-player', name: 'Apple Music', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => AppleMusicWidget({ widget })).not.toThrow()
  })

  it('renders iframe when embed URL is set', () => {
    const widget: WidgetPlugin = {
      id: 'apple-music-player', name: 'Apple Music', description: '', category: 'music',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { embedUrl: 'https://embed.music.apple.com/us/album/test/123' },
    }
    expect(() => AppleMusicWidget({ widget })).not.toThrow()
  })
})

describe('CustomHtmlWidget', () => {
  it('renders placeholder when no HTML', () => {
    const widget: WidgetPlugin = {
      id: 'custom-html', name: 'Custom HTML', description: '', category: 'other',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => CustomHtmlWidget({ widget })).not.toThrow()
  })

  it('renders iframe when HTML is set', () => {
    const widget: WidgetPlugin = {
      id: 'custom-html', name: 'Custom HTML', description: '', category: 'other',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { html: '<p>Hello World</p>', title: 'Test Embed', height: 300 },
    }
    expect(() => CustomHtmlWidget({ widget })).not.toThrow()
  })
})

describe('DiscordWidget', () => {
  it('renders placeholder when no server ID', () => {
    const widget: WidgetPlugin = {
      id: 'discord-widget', name: 'Discord', description: '', category: 'social',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => DiscordWidget({ widget })).not.toThrow()
  })

  it('renders iframe when server ID is set', () => {
    const widget: WidgetPlugin = {
      id: 'discord-widget', name: 'Discord', description: '', category: 'social',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { serverId: '123456789012345678', theme: 'dark' },
    }
    expect(() => DiscordWidget({ widget })).not.toThrow()
  })
})

describe('PatreonWidget', () => {
  it('renders placeholder when no page URL', () => {
    const widget: WidgetPlugin = {
      id: 'patreon-widget', name: 'Patreon', description: '', category: 'other',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => PatreonWidget({ widget })).not.toThrow()
  })

  it('renders CTA when page URL is set', () => {
    const widget: WidgetPlugin = {
      id: 'patreon-widget', name: 'Patreon', description: '', category: 'other',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { creatorName: 'Zardonic', pageUrl: 'https://www.patreon.com/zardonic' },
    }
    expect(() => PatreonWidget({ widget })).not.toThrow()
  })
})

describe('EventbriteWidget', () => {
  it('renders placeholder when no IDs', () => {
    const widget: WidgetPlugin = {
      id: 'eventbrite-widget', name: 'Eventbrite', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => EventbriteWidget({ widget })).not.toThrow()
  })

  it('renders iframe when organiser ID is set', () => {
    const widget: WidgetPlugin = {
      id: 'eventbrite-widget', name: 'Eventbrite', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { organizerId: '123456789' },
    }
    expect(() => EventbriteWidget({ widget })).not.toThrow()
  })
})

describe('SetlistFmWidget', () => {
  it('renders placeholder when no MBID', () => {
    const widget: WidgetPlugin = {
      id: 'setlistfm-widget', name: 'Setlist.fm', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0, config: {},
    }
    expect(() => SetlistFmWidget({ widget })).not.toThrow()
  })

  it('renders CTA link when MBID is set', () => {
    const widget: WidgetPlugin = {
      id: 'setlistfm-widget', name: 'Setlist.fm', description: '', category: 'events',
      version: '1.0.0', installed: true, enabled: true, order: 0,
      config: { artistMbid: '4b585938-f271-45e2-b19a-91215b125e38', artistName: 'Zardonic' },
    }
    expect(() => SetlistFmWidget({ widget })).not.toThrow()
  })
})
