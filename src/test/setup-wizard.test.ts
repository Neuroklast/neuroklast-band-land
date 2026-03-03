/**
 * Tests for SetupWizard integration logic.
 *
 * These are pure logic tests that do not require a DOM or React renderer.
 * They verify:
 *  - The condition that triggers the wizard (`setupComplete === false`)
 *  - That `setupComplete === true` skips the wizard
 *  - That the wizard step count and step names are consistent
 *  - Contrast ratio calculation for WCAG compliance
 *  - Reset/re-setup functionality
 */
import { describe, it, expect } from 'vitest'
import { DEFAULT_SITE_CONFIG, createSiteConfig } from '@/lib/site-config'
import { buildDefaultSections, toggleSection, reorderSections } from '@/lib/sections'
import { relativeLuminance, contrastRatio, meetsWcagAA, meetsWcagAAA, contrastRatioFromRgb } from '@/lib/contrast'

// ─── Wizard trigger logic ────────────────────────────────────────────────────

/**
 * Mirrors the condition used in App.tsx:
 *   `siteConfigLoaded && !config.setupComplete`
 */
function shouldShowWizard(isLoaded: boolean, setupComplete: boolean): boolean {
  return isLoaded && !setupComplete
}

describe('SetupWizard trigger condition', () => {
  it('shows wizard when config is loaded and setupComplete is false', () => {
    expect(shouldShowWizard(true, false)).toBe(true)
  })

  it('does not show wizard when setupComplete is true', () => {
    expect(shouldShowWizard(true, true)).toBe(false)
  })

  it('does not show wizard when config is not yet loaded', () => {
    expect(shouldShowWizard(false, false)).toBe(false)
  })

  it('DEFAULT_SITE_CONFIG has setupComplete = false', () => {
    expect(DEFAULT_SITE_CONFIG.setupComplete).toBe(false)
  })

  it('createSiteConfig with setupComplete: true produces non-triggering config', () => {
    const config = createSiteConfig({ siteName: 'Test', setupComplete: true })
    expect(shouldShowWizard(true, config.setupComplete)).toBe(false)
  })

  it('createSiteConfig without explicit setupComplete inherits false from defaults', () => {
    const config = createSiteConfig({ siteName: 'Test' })
    expect(shouldShowWizard(true, config.setupComplete)).toBe(true)
  })
})

// ─── onComplete callback logic ────────────────────────────────────────────────

describe('SetupWizard onComplete', () => {
  it('merging wizard result with setupComplete:true makes shouldShowWizard return false', () => {
    const base = createSiteConfig({ siteName: 'Before' })
    const wizardResult = { siteName: 'After', setupComplete: true as const }
    const merged = { ...base, ...wizardResult }
    expect(shouldShowWizard(true, merged.setupComplete)).toBe(false)
  })
})

// ─── Section step helpers ────────────────────────────────────────────────────

describe('Sections step (buildDefaultSections / toggleSection / reorderSections)', () => {
  it('builds sections with all enabled by default', () => {
    const secs = buildDefaultSections()
    expect(secs.every((s) => s.enabled)).toBe(true)
    expect(secs.length).toBeGreaterThan(0)
  })

  it('toggleSection disables an enabled section', () => {
    const secs = buildDefaultSections()
    const id = secs[0].id
    const toggled = toggleSection(secs, id)
    expect(toggled.find((s) => s.id === id)?.enabled).toBe(false)
  })

  it('toggleSection re-enables a disabled section', () => {
    const secs = buildDefaultSections()
    const id = secs[0].id
    const afterDisable = toggleSection(secs, id)
    const afterEnable = toggleSection(afterDisable, id)
    expect(afterEnable.find((s) => s.id === id)?.enabled).toBe(true)
  })

  it('reorderSections moves a section to the target index', () => {
    const secs = buildDefaultSections()
    const firstId = secs[0].id
    const result = reorderSections(secs, firstId, secs.length - 1)
    const sorted = [...result].sort((a, b) => a.order - b.order)
    expect(sorted[sorted.length - 1].id).toBe(firstId)
  })
})

// ─── Genres parsing ───────────────────────────────────────────────────────────

describe('Genres comma-separated parsing', () => {
  function parseGenres(input: string): string[] {
    return input
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean)
  }

  it('splits comma-separated genres', () => {
    expect(parseGenres('Techno, Industrial, EBM')).toEqual(['Techno', 'Industrial', 'EBM'])
  })

  it('handles extra whitespace', () => {
    expect(parseGenres('  Techno ,  Industrial  ')).toEqual(['Techno', 'Industrial'])
  })

  it('returns empty array for empty string', () => {
    expect(parseGenres('')).toEqual([])
  })

  it('handles single genre without comma', () => {
    expect(parseGenres('Techno')).toEqual(['Techno'])
  })
})

// ─── Contrast ratio helpers ───────────────────────────────────────────────────

describe('Contrast ratio (WCAG)', () => {
  it('black vs white has maximum contrast (21:1)', () => {
    const ratio = contrastRatioFromRgb({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('same color has minimum contrast (1:1)', () => {
    const ratio = contrastRatioFromRgb({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 })
    expect(ratio).toBeCloseTo(1, 1)
  })

  it('relativeLuminance of black is 0', () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0)
  })

  it('relativeLuminance of white is 1', () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 2)
  })

  it('contrastRatio is commutative', () => {
    const l1 = relativeLuminance(255, 0, 0)
    const l2 = relativeLuminance(0, 0, 255)
    expect(contrastRatio(l1, l2)).toBe(contrastRatio(l2, l1))
  })

  it('meetsWcagAA passes for ratio ≥ 4.5 (normal text)', () => {
    expect(meetsWcagAA(4.5)).toBe(true)
    expect(meetsWcagAA(4.4)).toBe(false)
  })

  it('meetsWcagAA passes for ratio ≥ 3.0 (large text)', () => {
    expect(meetsWcagAA(3.0, true)).toBe(true)
    expect(meetsWcagAA(2.9, true)).toBe(false)
  })

  it('meetsWcagAAA passes for ratio ≥ 7.0 (normal text)', () => {
    expect(meetsWcagAAA(7.0)).toBe(true)
    expect(meetsWcagAAA(6.9)).toBe(false)
  })
})

// ─── Reset / Re-Setup ────────────────────────────────────────────────────────

describe('Reset / Re-Setup', () => {
  it('setting setupComplete to false re-triggers the wizard', () => {
    const config = createSiteConfig({ siteName: 'Test', setupComplete: true })
    expect(shouldShowWizard(true, config.setupComplete)).toBe(false)

    const reset = { ...config, setupComplete: false }
    expect(shouldShowWizard(true, reset.setupComplete)).toBe(true)
  })

  it('re-setup preserves existing config fields', () => {
    const config = createSiteConfig({ siteName: 'MyBand', genres: ['Techno'], setupComplete: true })
    const reset = { ...config, setupComplete: false }
    expect(reset.siteName).toBe('MyBand')
    expect(reset.genres).toEqual(['Techno'])
    expect(reset.setupComplete).toBe(false)
  })
})

// ─── Wizard config output includes new fields ───────────────────────────────

describe('Wizard config includes colors, labels and datenschutz', () => {
  it('createSiteConfig includes themeSettings with colors', () => {
    const config = createSiteConfig({
      siteName: 'Test',
      themeSettings: {
        primary: 'oklch(0.50 0.22 25)',
        accent: 'oklch(0.60 0.24 25)',
        background: 'oklch(0 0 0)',
        foreground: 'oklch(0.95 0 0)',
      },
    })
    expect(config.themeSettings?.primary).toBe('oklch(0.50 0.22 25)')
    expect(config.themeSettings?.foreground).toBe('oklch(0.95 0 0)')
  })

  it('createSiteConfig includes sectionLabels', () => {
    const config = createSiteConfig({
      siteName: 'Test',
      sectionLabels: { biography: 'About Us', gigs: 'Live Dates' },
    })
    expect(config.sectionLabels?.biography).toBe('About Us')
    expect(config.sectionLabels?.gigs).toBe('Live Dates')
  })

  it('createSiteConfig includes datenschutz', () => {
    const config = createSiteConfig({
      siteName: 'Test',
      datenschutz: { customText: 'Our privacy policy...' },
    })
    expect(config.datenschutz?.customText).toBe('Our privacy policy...')
  })
})
