import { describe, expect, it } from 'vitest'
import { BUILTIN_APPEARANCE_PRESETS } from '@/lib/appearance-presets'
import { DEFAULTS, parseConfig } from '@/lib/admin-appearance-config'
import { composeAppearancePayload } from '@/lib/admin-appearance-payload'
import {
  appearanceDraftReducer,
  createAppearanceDraft,
} from '@/lib/admin-appearance-reducer'
import { oklchToHex } from '@/lib/color-utils'
import { LOOKS } from '@/lib/looks'

describe('appearance draft reducer', () => {
  const initial = () => createAppearanceDraft(parseConfig({}))

  it('initializes with the previously parsed appearance defaults', () => {
    const config = parseConfig({})
    const draft = createAppearanceDraft(config)
    expect(draft.crtEnabled).toBe(true)
    expect(draft.filmGrain).toBe(false)
    expect(draft.faviconUrl).toBe('')
    expect(draft.faviconStoragePath).toBe('')
    expect(draft.overlayAnimations).toEqual(config.overlayAnimations)
    expect(draft.savedPresets).toEqual([])
    expect(draft.theme).toEqual(config.theme)
    expect(composeAppearancePayload(draft)).toMatchObject({
      accentColor: DEFAULTS.accentColor,
      lookId: 'neuroklast-classic',
      faviconUrl: null,
      faviconStoragePath: null,
    })
  })

  it('applies a look atomically with exactly the original effect fallbacks', () => {
    const before = initial()
    const look = LOOKS.find(item => item.id === 'glitch-noir')
    expect(look).toBeDefined()
    if (!look) return
    const after = appearanceDraftReducer(before, { type: 'applyLook', look })
    expect(after).toMatchObject({
      lookId: look.id,
      theme: look.theme,
      accentColor: oklchToHex(look.theme.accentColor!),
      chromaticStrength: look.overlayEffects.chromatic?.intensity,
      noiseIntensity: look.overlayEffects.noise?.intensity,
      vignetteOpacity: look.overlayEffects.vignette?.intensity,
      crtEnabled: look.overlayEffects.crt?.enabled !== false,
      scanlineEnabled: look.overlayEffects.scanlines?.enabled !== false,
      noiseEnabled: look.overlayEffects.noise?.enabled !== false,
    })
    expect(after.theme).not.toBe(look.theme)
    expect(after.overlayAnimations).toBe(before.overlayAnimations)
    expect(after.savedPresets).toBe(before.savedPresets)
    expect(before.lookId).toBe('neuroklast-classic')
  })

  it('retains the previous accent if a look does not define an accent color', () => {
    const before = initial()
    const base = LOOKS[0]
    const noAccent = {
      ...base,
      theme: { ...base.theme, accentColor: undefined },
      overlayEffects: {
        ...base.overlayEffects,
        chromatic: { enabled: false, intensity: 0.9 },
      },
    }
    const after = appearanceDraftReducer(before, { type: 'applyLook', look: noAccent })
    expect(after.accentColor).toBe(before.accentColor)
    expect(after.chromaticStrength).toBe(0)
    expect(after.noiseIntensity).toBe(base.overlayEffects.noise?.intensity ?? 0.15)
  })

  it('applies presets without changing the look ID or effect settings', () => {
    const before = initial()
    const preset = BUILTIN_APPEARANCE_PRESETS[1]
    const after = appearanceDraftReducer(before, { type: 'applyPreset', preset })
    expect(after.theme).toEqual(preset.theme)
    expect(after.theme).not.toBe(preset.theme)
    expect(after.accentColor).toBe(oklchToHex(preset.theme.accentColor!))
    expect(after.lookId).toBe(before.lookId)
    expect(after.chromaticStrength).toBe(before.chromaticStrength)
    expect(after.noiseIntensity).toBe(before.noiseIntensity)
  })

  it('edits theme fields and mirrors only accentColor to the legacy accent field', () => {
    const before = initial()
    const fontChanged = appearanceDraftReducer(before, {
      type: 'themeField', key: 'fontHeading', value: 'Example Font',
    })
    expect(fontChanged.theme.fontHeading).toBe('Example Font')
    expect(fontChanged.accentColor).toBe(before.accentColor)
    expect(before.theme.fontHeading).not.toBe('Example Font')
    const changed = appearanceDraftReducer(fontChanged, {
      type: 'themeField', key: 'accentColor', value: 'oklch(0.60 0.24 25)',
    })
    expect(changed.accentColor).toBe(oklchToHex('oklch(0.60 0.24 25)'))
    expect(changed.theme.accentColor).toBe('oklch(0.60 0.24 25)')
  })

  it('preserves primitive false/zero patch updates and overlay functional updaters', () => {
    const before = initial()
    const patched = appearanceDraftReducer(before, {
      type: 'patch', values: { crtEnabled: false, sectionPanelOpacity: 0, faviconUrl: '' },
    })
    expect(patched.crtEnabled).toBe(false)
    expect(patched.sectionPanelOpacity).toBe(0)
    expect(patched.theme).toBe(before.theme)
    expect(before.sectionPanelOpacity).toBe(DEFAULTS.sectionPanelOpacity)
    const overlays = appearanceDraftReducer(patched, {
      type: 'overlayAnimations', update: () => ['circuitBreak', 'glitchScan'],
    })
    const trimmed = appearanceDraftReducer(overlays, {
      type: 'overlayAnimations', update: current => current.filter(item => item !== 'circuitBreak'),
    })
    expect(trimmed.overlayAnimations).toEqual(['glitchScan'])
    expect(overlays.overlayAnimations).toEqual(['circuitBreak', 'glitchScan'])
    const cleared = appearanceDraftReducer(trimmed, { type: 'overlayAnimations', update: [] })
    expect(composeAppearancePayload(cleared).overlayAnimation).toBe(DEFAULTS.overlayAnimation)
  })

  it('preserves readable mode without resetting the grid opacity', () => {
    const before = appearanceDraftReducer(initial(), { type: 'patch', values: { sectionGridOpacity: 0.35 } })
    const after = appearanceDraftReducer(before, { type: 'readableMode' })
    expect(after.sectionPanelOpacity).toBe(0.7)
    expect(after.cardSurfaceOpacity).toBe(0.9)
    expect(after.sectionGridOpacity).toBe(0.35)
  })

  it('saves named presets with trim, replacement, immutability and correct empty-name behavior', () => {
    const before = initial()
    const first = appearanceDraftReducer(before, { type: 'savePreset', name: '  Favorite  ' })
    expect(first.savedPresets).toEqual([{ name: 'Favorite', theme: before.theme }])
    expect(first.savedPresets[0].theme).not.toBe(before.theme)
    expect(before.savedPresets).toEqual([])
    const newTheme = appearanceDraftReducer(first, {
      type: 'themeField', key: 'primaryColor', value: '#123456',
    })
    const second = appearanceDraftReducer(newTheme, { type: 'savePreset', name: 'Favorite' })
    expect(second.savedPresets).toHaveLength(1)
    expect(second.savedPresets[0].theme.primaryColor).toBe('#123456')
    expect(appearanceDraftReducer(second, { type: 'savePreset', name: '   ' })).toBe(second)
  })
})
