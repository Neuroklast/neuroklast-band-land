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
  zardonicPreset,
  neuroklastClassicPreset,
  artDecoCyberpunkPreset,
  vhsRetroPreset,
  steampunkPreset,
  analogDarkMetalPreset,
  glitchNoirPreset,
  signalStaticPreset,
} from '@/lib/design-presets'

describe('DESIGN_PRESETS', () => {
  it('exports exactly 13 presets', () => {
    expect(PRESET_IDS).toHaveLength(13)
    expect(PRESET_IDS).toEqual([
      'cyberpunk', 'minimal', 'elegant', 'neon', 'retro',
      'zardonic', 'neuroklast-classic',
      'art-deco-cyberpunk', 'vhs-retro', 'steampunk', 'analog-dark-metal',
      'glitch-noir', 'signal-static',
    ])
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
    expect(getPreset('zardonic')).toBe(zardonicPreset)
    expect(getPreset('neuroklast-classic')).toBe(neuroklastClassicPreset)
    expect(getPreset('art-deco-cyberpunk')).toBe(artDecoCyberpunkPreset)
    expect(getPreset('vhs-retro')).toBe(vhsRetroPreset)
    expect(getPreset('steampunk')).toBe(steampunkPreset)
    expect(getPreset('analog-dark-metal')).toBe(analogDarkMetalPreset)
    expect(getPreset('glitch-noir')).toBe(glitchNoirPreset)
    expect(getPreset('signal-static')).toBe(signalStaticPreset)
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
    const theme = presetToThemeSettings(zardonicPreset)
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

  it('maps animationSettings for zardonic', () => {
    const theme = presetToThemeSettings(zardonicPreset)
    expect(theme.animationSettings).toBeDefined()
    expect(theme.animationSettings?.glitchEnabled).toBe(true)
    expect(theme.animationSettings?.crtEnabled).toBe(true)
    expect(theme.animationSettings?.circuitBackgroundEnabled).toBe(false)
    expect(theme.animationSettings?.crtOverlayOpacity).toBe(0.6)
  })

  it('maps loadingScreenType and heroStyle for zardonic', () => {
    const theme = presetToThemeSettings(zardonicPreset)
    // loadingScreenType and heroStyle are structural layout properties that belong
    // to the Theme Engine, not the Design Preset — they must NOT appear in the output.
    expect(theme.loadingScreenType).toBeUndefined()
    expect(theme.heroStyle).toBeUndefined()
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
    // loadingScreenType and heroStyle are structural layout properties that belong
    // to the Theme Engine, not the Design Preset — they must NOT appear in the output.
    expect(theme.loadingScreenType).toBeUndefined()
    expect(theme.heroStyle).toBeUndefined()
  })

  it('does not include animationSettings when preset has none', () => {
    const theme = presetToThemeSettings(cyberpunkPreset)
    expect(theme.animationSettings).toBeUndefined()
    // heroStyle / loadingScreenType are never included — they belong to the Theme Engine
    expect(theme.loadingScreenType).toBeUndefined()
    expect(theme.heroStyle).toBeUndefined()
  })
})

describe('Zardonic preset', () => {
  it('has overlay effects configured', () => {
    expect(zardonicPreset.overlayEffects).toBeDefined()
    expect(zardonicPreset.overlayEffects?.scanlines?.enabled).toBe(true)
    expect(zardonicPreset.overlayEffects?.crt?.enabled).toBe(true)
    expect(zardonicPreset.overlayEffects?.noise?.enabled).toBe(true)
    expect(zardonicPreset.overlayEffects?.vignette?.enabled).toBe(true)
    expect(zardonicPreset.overlayEffects?.chromatic?.enabled).toBe(true)
  })

  it('has animation settings configured', () => {
    expect(zardonicPreset.animationSettings).toBeDefined()
    expect(zardonicPreset.animationSettings?.glitchEnabled).toBe(true)
    expect(zardonicPreset.animationSettings?.crtEnabled).toBe(true)
  })

  it('has no loadingScreenType or heroStyle — structural fields belong to the Theme Engine', () => {
    expect((zardonicPreset as unknown as Record<string, unknown>).loadingScreenType).toBeUndefined()
    expect((zardonicPreset as unknown as Record<string, unknown>).heroStyle).toBeUndefined()
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

  it('has no loadingScreenType or heroStyle — structural fields belong to the Theme Engine', () => {
    expect((neuroklastClassicPreset as unknown as Record<string, unknown>).loadingScreenType).toBeUndefined()
    expect((neuroklastClassicPreset as unknown as Record<string, unknown>).heroStyle).toBeUndefined()
  })
})
