/**
 * Theme Registry — tests for resolveSlots() and content-section slot resolution.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import type { ThemePackage, ThemeSlots } from '@/lib/types'

// We test the public API: useThemeSlots + registerTheme
import { registerTheme, useThemeSlots, getActiveTheme } from '@/lib/theme-registry'

// Default slot components to verify fallbacks
import {
  DefaultGigsSection,
  DefaultReleasesSection,
  DefaultBiographySection,
  DefaultNewsSection,
  DefaultMediaSection,
  DefaultGallerySection,
  DefaultSocialSection,
  DefaultContactSection,
  DefaultPartnersSection,
} from '@/themes/default-slots'

function makeMinimalTheme(overrides: Partial<ThemePackage> = {}): ThemePackage {
  return {
    id: 'test-theme',
    name: 'Test Theme',
    description: 'Test',
    author: 'test',
    version: '1.0.0',
    access: 'free',
    layout: { heroVariant: 'default', loadingScreen: 'minimal' },
    typography: { heading: 'sans-serif', body: 'sans-serif', mono: 'monospace' },
    borderRadius: 0,
    animationsEnabled: false,
    colorPresets: [],
    defaultPresetId: 'default',
    customizability: { customColors: false, customFonts: false, adjustEffects: false },
    effects: {},
    slots: {},
    ...overrides,
  }
}

describe('resolveSlots — content-section slots', () => {
  beforeEach(() => {
    // Register a minimal theme so useThemeSlots can find it
    registerTheme(makeMinimalTheme())
  })

  it('returns all 24 slots when theme has empty slots object', () => {
    const slots: ThemeSlots = useThemeSlots('test-theme')

    // Original 15 slots
    expect(slots.Hero).toBeDefined()
    expect(slots.Navigation).toBeDefined()
    expect(slots.LoadingScreen).toBeDefined()
    expect(slots.SectionDivider).toBeDefined()
    expect(slots.Card).toBeDefined()
    expect(slots.BackgroundEffects).toBeDefined()
    expect(slots.Footer).toBeDefined()
    expect(slots.OverlayModal).toBeDefined()
    expect(slots.SectionHeading).toBeDefined()
    expect(slots.OverlayTransition).toBeDefined()
    expect(slots.ItemCard).toBeDefined()
    expect(slots.CookieBanner).toBeDefined()
    expect(slots.ScrollReveal).toBeDefined()
    expect(slots.HoverEffect).toBeDefined()
    expect(slots.PageLayout).toBeDefined()

    // New content-section slots (16-24)
    expect(slots.GigsSection).toBeDefined()
    expect(slots.ReleasesSection).toBeDefined()
    expect(slots.BiographySection).toBeDefined()
    expect(slots.NewsSection).toBeDefined()
    expect(slots.MediaSection).toBeDefined()
    expect(slots.GallerySection).toBeDefined()
    expect(slots.SocialSection).toBeDefined()
    expect(slots.ContactSection).toBeDefined()
    expect(slots.PartnersSection).toBeDefined()
  })

  it('falls back to default content-section slots when theme provides none', () => {
    const slots = useThemeSlots('test-theme')

    expect(slots.GigsSection).toBe(DefaultGigsSection)
    expect(slots.ReleasesSection).toBe(DefaultReleasesSection)
    expect(slots.BiographySection).toBe(DefaultBiographySection)
    expect(slots.NewsSection).toBe(DefaultNewsSection)
    expect(slots.MediaSection).toBe(DefaultMediaSection)
    expect(slots.GallerySection).toBe(DefaultGallerySection)
    expect(slots.SocialSection).toBe(DefaultSocialSection)
    expect(slots.ContactSection).toBe(DefaultContactSection)
    expect(slots.PartnersSection).toBe(DefaultPartnersSection)
  })

  it('uses a theme-provided content-section slot when available', () => {
    function CustomGigs() { return null }
    function CustomNews() { return null }

    registerTheme(makeMinimalTheme({
      id: 'custom-slots-theme',
      slots: {
        GigsSection: CustomGigs as ThemeSlots['GigsSection'],
        NewsSection: CustomNews as ThemeSlots['NewsSection'],
      },
    }))

    const slots = useThemeSlots('custom-slots-theme')

    expect(slots.GigsSection).toBe(CustomGigs)
    expect(slots.NewsSection).toBe(CustomNews)
    // Others still fall back to defaults
    expect(slots.ReleasesSection).toBe(DefaultReleasesSection)
    expect(slots.BiographySection).toBe(DefaultBiographySection)
  })

  it('has exactly 24 slot keys', () => {
    const slots = useThemeSlots('test-theme')
    expect(Object.keys(slots)).toHaveLength(24)
  })
})

describe('THEME_CATALOG completeness', () => {
  it('has entries for all 6 built-in themes', async () => {
    const { THEME_CATALOG } = await import('@/lib/theme-registry')
    const ids = THEME_CATALOG.map(t => t.id)
    expect(ids).toContain('glitch-noir')
    expect(ids).toContain('neuroklast-classic')
    expect(ids).toContain('zardonic-industrial')
    expect(ids).toContain('umbrella-corp')
    expect(ids).toContain('neon-synthwave')
    expect(ids).toContain('cyberpunk-os')
    expect(THEME_CATALOG).toHaveLength(6)
  })
})

describe('getActiveTheme fallback', () => {
  it('returns the requested theme when it exists', () => {
    registerTheme(makeMinimalTheme({ id: 'my-theme' }))
    const theme = getActiveTheme('my-theme')
    expect(theme.id).toBe('my-theme')
  })

  it('falls back to glitch-noir when requested theme does not exist', () => {
    const theme = getActiveTheme('nonexistent-theme')
    expect(theme.id).toBe('glitch-noir')
  })
})

describe('theme access levels', () => {
  it('neuroklast-classic is exclusive', () => {
    const theme = getActiveTheme('neuroklast-classic')
    expect(theme.access).toBe('exclusive')
  })

  it('zardonic-industrial is premium', () => {
    const theme = getActiveTheme('zardonic-industrial')
    expect(theme.access).toBe('premium')
  })

  it('umbrella-corp is premium', () => {
    const theme = getActiveTheme('umbrella-corp')
    expect(theme.access).toBe('premium')
  })

  it('glitch-noir is free', () => {
    const theme = getActiveTheme('glitch-noir')
    expect(theme.access).toBe('free')
  })
})
