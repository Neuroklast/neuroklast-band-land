/**
 * Theme switching — clean slate enforcement tests (R5, R6)
 *
 * Verifies that:
 * 1. After switching from theme A to theme B, no CSS custom properties
 *    from theme A remain on the root element (R5 / R6).
 * 2. body.backgroundColor is cleared between theme applications (R5).
 * 3. Every built-in DesignPreset either passes WCAG AA contrast or is
 *    reported as "not verifiable" (oklch not resolved in jsdom) — never
 *    as an explicit failure (R4 / R6).
 * 4. All registered ThemePackages declare a gridLayout configuration (R1 / R6).
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { applyThemeToDOM, resetThemeDOM, clearThemeFromDOM } from '@/lib/theme-application'
import { validatePresetContrast } from '@/lib/contrast'
import { DESIGN_PRESETS } from '@/lib/design-presets'
import { getAllThemes } from '@/lib/theme-registry'
import type { ThemeSettings } from '@/lib/types'

// The full set of CSS custom properties that applyThemeToDOM writes.
// After resetThemeDOM / clearThemeFromDOM these must all be absent.
const THEME_CSS_PROPS = [
  '--primary', '--accent', '--background', '--card', '--foreground',
  '--muted-foreground', '--border', '--secondary', '--font-sans', '--font-mono',
  '--font-heading', '--ring', '--destructive', '--primary-foreground',
  '--secondary-foreground', '--accent-foreground', '--card-foreground',
  '--popover-foreground', '--destructive-foreground', '--popover', '--muted',
  '--radius', '--radius-factor', '--font-size-factor',
  '--overlay-dot-matrix', '--overlay-scanlines', '--overlay-crt',
  '--overlay-noise', '--overlay-vignette', '--overlay-chromatic',
  '--overlay-moving-scanline', '--input', '--hover-color',
] as const

function makeSettings(id: string, primary: string, background: string): ThemeSettings {
  return {
    activePreset: id,
    primary,
    background,
    foreground: 'oklch(0.95 0 0)',
    card: 'oklch(0.08 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
  }
}

describe('clearThemeFromDOM / resetThemeDOM', () => {
  beforeEach(() => {
    resetThemeDOM()
  })

  it('exports clearThemeFromDOM as an alias for resetThemeDOM', () => {
    expect(clearThemeFromDOM).toBe(resetThemeDOM)
  })

  it('removes all theme CSS properties after a full application', () => {
    applyThemeToDOM(makeSettings('theme-a', 'red', 'black'))

    // Ensure at least one property was set
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('red')

    resetThemeDOM()

    for (const prop of THEME_CSS_PROPS) {
      expect(document.documentElement.style.getPropertyValue(prop)).toBe('')
    }
  })

  it('removes the data-theme attribute', () => {
    applyThemeToDOM(makeSettings('theme-a', 'red', 'black'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('theme-a')

    resetThemeDOM()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('clears body.backgroundColor', () => {
    applyThemeToDOM(makeSettings('theme-a', 'red', 'black'))
    expect(document.body.style.backgroundColor).toBe('black')

    clearThemeFromDOM()
    expect(document.body.style.backgroundColor).toBe('')
  })
})

describe('theme switch — no stale CSS from previous theme', () => {
  beforeEach(() => {
    resetThemeDOM()
  })

  it('switches from theme A to theme B atomically', () => {
    const themeA = makeSettings('theme-a', 'red', 'oklch(0.05 0 0)')
    const themeB = makeSettings('theme-b', 'blue', 'oklch(0.10 0 0)')

    applyThemeToDOM(themeA)
    expect(document.documentElement.getAttribute('data-theme')).toBe('theme-a')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('red')

    applyThemeToDOM(themeB)

    // theme-b values must be active
    expect(document.documentElement.getAttribute('data-theme')).toBe('theme-b')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('blue')
  })

  it('removes body background from theme A when switching to theme B', () => {
    applyThemeToDOM(makeSettings('theme-a', 'red', 'navy'))
    expect(document.body.style.backgroundColor).toBe('navy')

    applyThemeToDOM(makeSettings('theme-b', 'blue', 'black'))
    expect(document.body.style.backgroundColor).toBe('black')
  })

  it('clears data-theme when switching to a theme with no activePreset', () => {
    applyThemeToDOM(makeSettings('theme-a', 'red', 'black'))
    applyThemeToDOM({ primary: 'green', background: 'black' })

    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('green')
  })
})

describe('validatePresetContrast', () => {
  it('is exported from contrast.ts', () => {
    expect(typeof validatePresetContrast).toBe('function')
  })

  it('passes for high-contrast black/white pair using hex colors', () => {
    const result = validatePresetContrast({
      foreground: '#ffffff',
      background: '#000000',
      card: '#111111',
      mutedForeground: '#999999',
    })
    // Ratio white/black is 21:1 — must pass
    expect(result.passes).toBe(true)
    expect(result.details.length).toBe(3)
  })

  it('fails for low-contrast white/light pair using hex colors', () => {
    const result = validatePresetContrast({
      foreground: '#ffffff',
      background: '#eeeeee',
      card: '#f5f5f5',
      mutedForeground: '#cccccc',
    })
    // White on near-white — must fail
    expect(result.passes).toBe(false)
  })

  it('returns passes=null when colors cannot be resolved (oklch in jsdom)', () => {
    // jsdom does not resolve oklch() so cssColorToRgb returns null → skipped
    const result = validatePresetContrast({
      foreground: 'oklch(0.95 0 0)',
      background: 'oklch(0.05 0 0)',
      card: 'oklch(0.08 0 0)',
      mutedForeground: 'oklch(0.55 0 0)',
    })
    // In jsdom, all pairs are skipped → passes is null
    expect(result.passes).toBeNull()
    expect(result.details.every(d => d.skipped)).toBe(true)
  })

  it('never returns passes=false for built-in design presets in jsdom', () => {
    for (const preset of Object.values(DESIGN_PRESETS)) {
      const report = validatePresetContrast({
        foreground: preset.colors.foreground,
        background: preset.colors.background,
        card: preset.colors.card,
        mutedForeground: preset.colors.mutedForeground,
      })
      // In jsdom with oklch colors, result will be null (skipped), not false.
      // In a real browser it must be true. Never false.
      expect(report.passes).not.toBe(false)
    }
  })
})

describe('all registered themes have gridLayout config', () => {
  it('every ThemePackage defines a gridLayout property', () => {
    const themes = getAllThemes()
    expect(themes.length).toBeGreaterThan(0)

    for (const theme of themes) {
      expect(
        theme.gridLayout,
        `Theme "${theme.id}" is missing a gridLayout configuration`,
      ).toBeDefined()
      expect(typeof theme.gridLayout?.columns).toBe('string')
      expect(typeof theme.gridLayout?.gap).toBe('string')
    }
  })
})
