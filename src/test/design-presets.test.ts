import { describe, it, expect } from 'vitest'
import {
  DESIGN_PRESETS,
  PRESET_IDS,
  getPreset,
  presetToThemeSettings,
  cyberpunkPreset,
  minimalPreset,
  elegantPreset,
  neonPreset,
  retroPreset,
} from '@/lib/design-presets'

describe('DESIGN_PRESETS', () => {
  it('exports exactly 5 presets', () => {
    expect(PRESET_IDS).toHaveLength(5)
    expect(PRESET_IDS).toEqual(['cyberpunk', 'minimal', 'elegant', 'neon', 'retro'])
  })

  it('each preset has required fields', () => {
    for (const id of PRESET_IDS) {
      const preset = DESIGN_PRESETS[id]
      expect(preset.id, `${id}.id`).toBe(id)
      expect(preset.name, `${id}.name`).toBeTruthy()
      expect(preset.description, `${id}.description`).toBeTruthy()
      expect(preset.colors.primary, `${id}.colors.primary`).toBeTruthy()
      expect(preset.colors.background, `${id}.colors.background`).toBeTruthy()
      expect(preset.fonts.heading, `${id}.fonts.heading`).toBeTruthy()
      expect(preset.fonts.body, `${id}.fonts.body`).toBeTruthy()
      expect(preset.fonts.mono, `${id}.fonts.mono`).toBeTruthy()
      expect(typeof preset.borderRadius, `${id}.borderRadius type`).toBe('number')
      expect(typeof preset.animationsEnabled, `${id}.animationsEnabled type`).toBe('boolean')
    }
  })
})

describe('getPreset', () => {
  it('returns the preset for a known ID', () => {
    expect(getPreset('cyberpunk')).toBe(cyberpunkPreset)
    expect(getPreset('minimal')).toBe(minimalPreset)
    expect(getPreset('elegant')).toBe(elegantPreset)
    expect(getPreset('neon')).toBe(neonPreset)
    expect(getPreset('retro')).toBe(retroPreset)
  })

  it('returns undefined for an unknown ID', () => {
    expect(getPreset('unknown')).toBeUndefined()
    expect(getPreset('')).toBeUndefined()
  })
})

describe('presetToThemeSettings', () => {
  it('maps all color and font fields', () => {
    const theme = presetToThemeSettings(cyberpunkPreset)
    expect(theme.primary).toBe(cyberpunkPreset.colors.primary)
    expect(theme.accent).toBe(cyberpunkPreset.colors.accent)
    expect(theme.background).toBe(cyberpunkPreset.colors.background)
    expect(theme.card).toBe(cyberpunkPreset.colors.card)
    expect(theme.foreground).toBe(cyberpunkPreset.colors.foreground)
    expect(theme.mutedForeground).toBe(cyberpunkPreset.colors.mutedForeground)
    expect(theme.border).toBe(cyberpunkPreset.colors.border)
    expect(theme.secondary).toBe(cyberpunkPreset.colors.secondary)
    expect(theme.fontHeading).toBe(cyberpunkPreset.fonts.heading)
    expect(theme.fontBody).toBe(cyberpunkPreset.fonts.body)
    expect(theme.fontMono).toBe(cyberpunkPreset.fonts.mono)
    expect(theme.borderRadius).toBe(cyberpunkPreset.borderRadius)
    expect(theme.activePreset).toBe('cyberpunk')
  })

  it('sets activePreset to the preset id', () => {
    for (const id of PRESET_IDS) {
      const theme = presetToThemeSettings(DESIGN_PRESETS[id])
      expect(theme.activePreset).toBe(id)
    }
  })

  it('result can be merged into existing ThemeSettings as an override', () => {
    const existing = { primary: 'red', fontSize: 1.2 }
    const patch = presetToThemeSettings(neonPreset)
    const merged = { ...existing, ...patch }
    expect(merged.primary).toBe(neonPreset.colors.primary)
    expect(merged.fontSize).toBe(1.2) // individual override preserved
  })
})
