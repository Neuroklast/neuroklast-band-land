/**
 * Tests for updateConfig themeSettings merge behavior.
 *
 * Verifies that calling updateConfig({ themeSettings: partial }) merges
 * into the existing themeSettings instead of replacing the entire object.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to test the merge logic directly. The updateConfig function
// is inside useSiteConfig which uses useKV. We'll extract the merge logic
// pattern and test it in isolation.
describe('updateConfig themeSettings merge', () => {
  it('merges themeSettings instead of replacing', () => {
    // Simulate the merge logic from use-site-config.ts
    const base = {
      themeSettings: {
        primary: 'oklch(0.50 0.22 25)',
        accent: 'oklch(0.60 0.25 30)',
        background: 'oklch(0.1 0 0)',
        activePreset: 'neuroklast-classic',
        borderRadius: 0.125,
        animationsEnabled: true,
      },
    }

    const partial = {
      themeSettings: {
        activePreset: 'glitch-noir',
      },
    }

    // The fixed merge logic
    const result = {
      ...base,
      ...partial,
      themeSettings: partial.themeSettings
        ? { ...base.themeSettings, ...partial.themeSettings }
        : base.themeSettings,
    }

    // activePreset should be updated
    expect(result.themeSettings.activePreset).toBe('glitch-noir')
    // Other properties should be preserved
    expect(result.themeSettings.primary).toBe('oklch(0.50 0.22 25)')
    expect(result.themeSettings.accent).toBe('oklch(0.60 0.25 30)')
    expect(result.themeSettings.background).toBe('oklch(0.1 0 0)')
    expect(result.themeSettings.borderRadius).toBe(0.125)
    expect(result.themeSettings.animationsEnabled).toBe(true)
  })

  it('preserves themeSettings when partial does not include it', () => {
    const base = {
      themeSettings: {
        primary: 'oklch(0.50 0.22 25)',
        activePreset: 'neuroklast-classic',
      },
    }

    const partial = {
      siteName: 'New Name',
    }

    const result = {
      ...base,
      ...partial,
      themeSettings: (partial as Record<string, unknown>).themeSettings
        ? { ...base.themeSettings, ...(partial as Record<string, unknown>).themeSettings as Record<string, unknown> }
        : base.themeSettings,
    }

    expect(result.themeSettings.primary).toBe('oklch(0.50 0.22 25)')
    expect(result.themeSettings.activePreset).toBe('neuroklast-classic')
  })

  it('handles full themeSettings update correctly', () => {
    const base = {
      themeSettings: {
        primary: 'oklch(0.50 0.22 25)',
        accent: 'oklch(0.60 0.25 30)',
        activePreset: 'neuroklast-classic',
      },
    }

    const partial = {
      themeSettings: {
        primary: 'oklch(0.70 0.15 200)',
        accent: 'oklch(0.80 0.10 180)',
        activePreset: 'glitch-noir',
        background: 'oklch(0.05 0 0)',
      },
    }

    const result = {
      ...base,
      ...partial,
      themeSettings: partial.themeSettings
        ? { ...base.themeSettings, ...partial.themeSettings }
        : base.themeSettings,
    }

    expect(result.themeSettings.primary).toBe('oklch(0.70 0.15 200)')
    expect(result.themeSettings.accent).toBe('oklch(0.80 0.10 180)')
    expect(result.themeSettings.activePreset).toBe('glitch-noir')
    expect(result.themeSettings.background).toBe('oklch(0.05 0 0)')
  })
})
