import { describe, it, expect, beforeAll } from 'vitest'
import {
  getTheme,
  getAllThemes,
  getActiveTheme,
  useThemeSlots,
  cyberpunkTheme,
  minimalTheme,
  elegantTheme,
  neonTheme,
  retroTheme,
  zardonicIndustrialTheme,
  neuroklastClassicTheme,
} from '@/lib/theme-registry'

// Ensure registry is populated (side effects run on import)

describe('Theme Registry — all themes registered', () => {
  it('has 7 built-in themes', () => {
    const themes = getAllThemes()
    expect(themes).toHaveLength(7)
  })

  it('has expected IDs', () => {
    const ids = getAllThemes().map((t) => t.id)
    expect(ids).toContain('cyberpunk')
    expect(ids).toContain('minimal')
    expect(ids).toContain('elegant')
    expect(ids).toContain('neon')
    expect(ids).toContain('retro')
    expect(ids).toContain('zardonic-industrial')
    expect(ids).toContain('neuroklast-classic')
  })
})

describe('getTheme', () => {
  it('returns the correct theme for each ID', () => {
    expect(getTheme('cyberpunk')).toBe(cyberpunkTheme)
    expect(getTheme('minimal')).toBe(minimalTheme)
    expect(getTheme('elegant')).toBe(elegantTheme)
    expect(getTheme('neon')).toBe(neonTheme)
    expect(getTheme('retro')).toBe(retroTheme)
    expect(getTheme('zardonic-industrial')).toBe(zardonicIndustrialTheme)
    expect(getTheme('neuroklast-classic')).toBe(neuroklastClassicTheme)
  })

  it('returns undefined for unknown ID', () => {
    expect(getTheme('unknown')).toBeUndefined()
    expect(getTheme('')).toBeUndefined()
  })
})

describe('getActiveTheme', () => {
  it('returns cyberpunk when no ID is given', () => {
    expect(getActiveTheme()).toBe(cyberpunkTheme)
  })

  it('returns the matching theme for a known ID', () => {
    expect(getActiveTheme('neon')).toBe(neonTheme)
    expect(getActiveTheme('elegant')).toBe(elegantTheme)
  })

  it('falls back to cyberpunk for unknown ID', () => {
    expect(getActiveTheme('nonexistent')).toBe(cyberpunkTheme)
  })
})

describe('Access levels', () => {
  it('cyberpunk, minimal, elegant, neon, retro are free', () => {
    expect(cyberpunkTheme.access).toBe('free')
    expect(minimalTheme.access).toBe('free')
    expect(elegantTheme.access).toBe('free')
    expect(neonTheme.access).toBe('free')
    expect(retroTheme.access).toBe('free')
  })

  it('zardonic-industrial is free', () => {
    expect(zardonicIndustrialTheme.access).toBe('free')
  })

  it('neuroklast-classic is preview-only', () => {
    expect(neuroklastClassicTheme.access).toBe('preview-only')
    expect(neuroklastClassicTheme.exclusiveFor).toBe('neuroklast')
  })
})

describe('Color presets', () => {
  it('each theme has at least one color preset', () => {
    for (const theme of getAllThemes()) {
      expect(theme.colorPresets.length, `${theme.id} has colorPresets`).toBeGreaterThan(0)
    }
  })

  it('cyberpunk has 6 color presets', () => {
    expect(cyberpunkTheme.colorPresets).toHaveLength(6)
  })

  it('minimal has 2 color presets', () => {
    expect(minimalTheme.colorPresets).toHaveLength(2)
  })

  it('neuroklast-classic has 1 color preset', () => {
    expect(neuroklastClassicTheme.colorPresets).toHaveLength(1)
  })

  it('each preset has all required color fields', () => {
    for (const theme of getAllThemes()) {
      for (const preset of theme.colorPresets) {
        expect(preset.id, `${theme.id}/${preset.id}.id`).toBeTruthy()
        expect(preset.name, `${theme.id}/${preset.id}.name`).toBeTruthy()
        expect(preset.colors.primary, `${theme.id}/${preset.id}.primary`).toBeTruthy()
        expect(preset.colors.background, `${theme.id}/${preset.id}.background`).toBeTruthy()
      }
    }
  })

  it('defaultPresetId matches an existing preset ID', () => {
    for (const theme of getAllThemes()) {
      const found = theme.colorPresets.find((p) => p.id === theme.defaultPresetId)
      expect(found, `${theme.id}.defaultPresetId`).toBeDefined()
    }
  })
})

describe('Customizability', () => {
  it('free themes allow full customization', () => {
    for (const theme of [cyberpunkTheme, minimalTheme, elegantTheme, neonTheme, retroTheme]) {
      expect(theme.customizability.customColors, `${theme.id}.customColors`).toBe(true)
      expect(theme.customizability.customFonts, `${theme.id}.customFonts`).toBe(true)
      expect(theme.customizability.adjustEffects, `${theme.id}.adjustEffects`).toBe(true)
    }
  })

  it('zardonic-industrial locks font customization', () => {
    expect(zardonicIndustrialTheme.customizability.customFonts).toBe(false)
    expect(zardonicIndustrialTheme.customizability.customColors).toBe(true)
    expect(zardonicIndustrialTheme.customizability.adjustEffects).toBe(true)
  })

  it('neuroklast-classic locks all customization', () => {
    expect(neuroklastClassicTheme.customizability.customColors).toBe(false)
    expect(neuroklastClassicTheme.customizability.customFonts).toBe(false)
    expect(neuroklastClassicTheme.customizability.adjustEffects).toBe(false)
  })
})

describe('useThemeSlots — slot fallbacks', () => {
  it('returns an object with all 7 slot component keys', () => {
    const slots = useThemeSlots()
    expect(slots.Hero).toBeDefined()
    expect(slots.Navigation).toBeDefined()
    expect(slots.LoadingScreen).toBeDefined()
    expect(slots.SectionDivider).toBeDefined()
    expect(slots.Card).toBeDefined()
    expect(slots.BackgroundEffects).toBeDefined()
    expect(slots.Footer).toBeDefined()
  })

  it('all slot values are functions (React components)', () => {
    const slots = useThemeSlots('cyberpunk')
    for (const [key, component] of Object.entries(slots)) {
      expect(typeof component, `${key} is a function`).toBe('function')
    }
  })

  it('uses fallbacks for themes with no custom slots', () => {
    const slots = useThemeSlots('minimal')
    expect(typeof slots.Hero).toBe('function')
    expect(typeof slots.Footer).toBe('function')
  })
})
