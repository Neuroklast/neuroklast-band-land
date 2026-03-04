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
  zardonicIndustrialPreset,
  neuroklastClassicPreset,
} from '@/lib/design-presets'

describe('DESIGN_PRESETS', () => {
  it('exports exactly 7 presets', () => {
    expect(PRESET_IDS).toHaveLength(7)
    expect(PRESET_IDS).toEqual(['cyberpunk', 'minimal', 'elegant', 'neon', 'retro', 'zardonic-industrial', 'neuroklast-classic'])
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
    expect(getPreset('zardonic-industrial')).toBe(zardonicIndustrialPreset)
    expect(getPreset('neuroklast-classic')).toBe(neuroklastClassicPreset)
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

  it('maps overlayEffects when preset defines them', () => {
    const theme = presetToThemeSettings(zardonicIndustrialPreset)
    expect(theme.overlayEffects).toBeDefined()
    expect(theme.overlayEffects?.scanlines?.enabled).toBe(true)
    expect(theme.overlayEffects?.scanlines?.intensity).toBe(0.4)
    expect(theme.overlayEffects?.crt?.enabled).toBe(true)
    expect(theme.overlayEffects?.crt?.intensity).toBe(0.6)
    expect(theme.overlayEffects?.noise?.enabled).toBe(true)
    expect(theme.overlayEffects?.chromatic?.enabled).toBe(true)
  })

  it('maps overlayEffects for neuroklast-classic', () => {
    const theme = presetToThemeSettings(neuroklastClassicPreset)
    expect(theme.overlayEffects).toBeDefined()
    expect(theme.overlayEffects?.scanlines?.enabled).toBe(true)
    expect(theme.overlayEffects?.scanlines?.intensity).toBe(0.3)
    expect(theme.overlayEffects?.chromatic?.enabled).toBe(false)
  })

  it('does not include overlayEffects when preset has none', () => {
    const theme = presetToThemeSettings(cyberpunkPreset)
    expect(theme.overlayEffects).toBeUndefined()
  })

  it('maps animationSettings for zardonic-industrial', () => {
    const theme = presetToThemeSettings(zardonicIndustrialPreset)
    expect(theme.animationSettings).toBeDefined()
    expect(theme.animationSettings?.glitchEnabled).toBe(true)
    expect(theme.animationSettings?.crtEnabled).toBe(true)
    expect(theme.animationSettings?.circuitBackgroundEnabled).toBe(true)
    expect(theme.animationSettings?.crtOverlayOpacity).toBe(0.6)
  })

  it('maps loadingScreenType and heroStyle for zardonic-industrial', () => {
    const theme = presetToThemeSettings(zardonicIndustrialPreset)
    expect(theme.loadingScreenType).toBe('3d-model')
    expect(theme.heroStyle).toBe('glitch-parallax')
  })

  it('maps animationSettings for neuroklast-classic', () => {
    const theme = presetToThemeSettings(neuroklastClassicPreset)
    expect(theme.animationSettings).toBeDefined()
    expect(theme.animationSettings?.glitchEnabled).toBe(true)
    expect(theme.animationSettings?.chromaticEnabled).toBe(false)
    expect(theme.animationSettings?.crtOverlayOpacity).toBe(0.4)
  })

  it('maps loadingScreenType and heroStyle for neuroklast-classic', () => {
    const theme = presetToThemeSettings(neuroklastClassicPreset)
    expect(theme.loadingScreenType).toBe('code-rain')
    expect(theme.heroStyle).toBe('chromatic-hover')
  })

  it('does not include animationSettings/loadingScreenType/heroStyle when preset has none', () => {
    const theme = presetToThemeSettings(cyberpunkPreset)
    expect(theme.animationSettings).toBeUndefined()
    expect(theme.loadingScreenType).toBeUndefined()
    expect(theme.heroStyle).toBeUndefined()
  })
})

describe('Zardonic Industrial preset', () => {
  it('has overlay effects configured', () => {
    expect(zardonicIndustrialPreset.overlayEffects).toBeDefined()
    expect(zardonicIndustrialPreset.overlayEffects?.scanlines?.enabled).toBe(true)
    expect(zardonicIndustrialPreset.overlayEffects?.crt?.enabled).toBe(true)
    expect(zardonicIndustrialPreset.overlayEffects?.noise?.enabled).toBe(true)
    expect(zardonicIndustrialPreset.overlayEffects?.vignette?.enabled).toBe(true)
    expect(zardonicIndustrialPreset.overlayEffects?.chromatic?.enabled).toBe(true)
  })

  it('has animation settings configured', () => {
    expect(zardonicIndustrialPreset.animationSettings).toBeDefined()
    expect(zardonicIndustrialPreset.animationSettings?.glitchEnabled).toBe(true)
    expect(zardonicIndustrialPreset.animationSettings?.crtEnabled).toBe(true)
  })

  it('has loading screen and hero style', () => {
    expect(zardonicIndustrialPreset.loadingScreenType).toBe('3d-model')
    expect(zardonicIndustrialPreset.heroStyle).toBe('glitch-parallax')
  })
})

describe('Neuroklast Classic preset', () => {
  it('has overlay effects configured', () => {
    expect(neuroklastClassicPreset.overlayEffects).toBeDefined()
    expect(neuroklastClassicPreset.overlayEffects?.scanlines?.enabled).toBe(true)
    expect(neuroklastClassicPreset.overlayEffects?.crt?.enabled).toBe(true)
    expect(neuroklastClassicPreset.overlayEffects?.chromatic?.enabled).toBe(false)
  })

  it('has animation settings configured', () => {
    expect(neuroklastClassicPreset.animationSettings).toBeDefined()
    expect(neuroklastClassicPreset.animationSettings?.glitchEnabled).toBe(true)
    expect(neuroklastClassicPreset.animationSettings?.chromaticEnabled).toBe(false)
  })

  it('has loading screen and hero style', () => {
    expect(neuroklastClassicPreset.loadingScreenType).toBe('code-rain')
    expect(neuroklastClassicPreset.heroStyle).toBe('chromatic-hover')
  })
})
