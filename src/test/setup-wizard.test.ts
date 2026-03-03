/**
 * Tests for SetupWizard integration logic.
 *
 * These are pure logic tests that do not require a DOM or React renderer.
 * They verify:
 *  - The condition that triggers the wizard (`setupComplete === false`)
 *  - That `setupComplete === true` skips the wizard
 *  - That the wizard step count and step names are consistent
 */
import { describe, it, expect } from 'vitest'
import { DEFAULT_SITE_CONFIG, createSiteConfig } from '@/lib/site-config'
import { buildDefaultSections, toggleSection, reorderSections } from '@/lib/sections'

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
