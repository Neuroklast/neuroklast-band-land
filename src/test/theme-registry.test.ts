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
        GigsSection: CustomGigs as unknown as ThemeSlots['GigsSection'],
        NewsSection: CustomNews as unknown as ThemeSlots['NewsSection'],
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
  it('has entries for all 4 built-in themes', async () => {
    const { THEME_CATALOG } = await import('@/lib/theme-registry')
    const ids = THEME_CATALOG.map(t => t.id)
    expect(ids).toContain('neuroklast-classic')
    expect(ids).toContain('nebula-noir-theme')
    expect(ids).toContain('glitch-noir')
    expect(ids).toContain('zardonic-theme')
    expect(THEME_CATALOG).toHaveLength(4)
  })
})

describe('getActiveTheme fallback', () => {
  it('returns the requested theme when it exists', () => {
    registerTheme(makeMinimalTheme({ id: 'my-theme' }))
    const theme = getActiveTheme('my-theme')
    expect(theme.id).toBe('my-theme')
  })

  it('falls back to neuroklast-classic when requested theme does not exist', () => {
    const theme = getActiveTheme('nonexistent-theme')
    expect(theme.id).toBe('neuroklast-classic')
  })
})

describe('theme access levels', () => {
  it('neuroklast-classic is exclusive', () => {
    const theme = getActiveTheme('neuroklast-classic')
    expect(theme.access).toBe('exclusive')
  })

  it('zardonic-theme is exclusive', () => {
    const theme = getActiveTheme('zardonic-theme')
    expect(theme.access).toBe('exclusive')
  })

  it('nebula-noir-theme is free', () => {
    const theme = getActiveTheme('nebula-noir-theme')
    expect(theme.access).toBe('free')
  })

  it('glitch-noir is free', () => {
    const theme = getActiveTheme('glitch-noir')
    expect(theme.access).toBe('free')
  })
})
