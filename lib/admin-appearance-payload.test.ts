import { describe, expect, it } from 'vitest'
import { DEFAULTS, DEFAULT_THEME } from '@/lib/admin-appearance-config'
import { composeAppearancePayload, type AppearanceEditorDraft } from '@/lib/admin-appearance-payload'

const makeDraft = (overrides: Partial<AppearanceEditorDraft> = {}): AppearanceEditorDraft => ({
  crtEnabled: true,
  scanlineEnabled: false,
  noiseEnabled: true,
  glitchEnabled: false,
  noiseIntensity: 0.4,
  filmGrain: false,
  accentColor: '#ff0000',
  accentColorSecondary: '#7c3aed',
  vignetteOpacity: 0.5,
  chromaticStrength: 0,
  sectionPanelOpacity: 0.55,
  sectionGridOpacity: 0,
  cardSurfaceOpacity: 0.85,
  faviconUrl: '',
  faviconStoragePath: '',
  theme: { ...DEFAULT_THEME },
  lookId: 'neuroklast-classic',
  overlayAnimations: ['circuitBreak', 'glitchScan'],
  savedPresets: [{ name: 'Example', theme: { accentColor: '#ff0000' } }],
  ...overrides,
})

describe('appearance editor draft serialization', () => {
  it('preserves the complete persisted JSON key order and all field values', () => {
    const draft = makeDraft()
    const payload = composeAppearancePayload(draft)
    expect(Object.keys(payload)).toEqual([
      'crtEnabled', 'scanlineEnabled', 'noiseEnabled', 'glitchEnabled',
      'noiseIntensity', 'filmGrain', 'accentColor', 'accentColorSecondary',
      'vignetteOpacity', 'chromaticStrength', 'sectionPanelOpacity',
      'sectionGridOpacity', 'cardSurfaceOpacity', 'faviconUrl',
      'faviconStoragePath', 'theme', 'lookId', 'overlayAnimations',
      'overlayAnimation', 'savedPresets',
    ])
    expect(payload).toEqual({
      crtEnabled: true,
      scanlineEnabled: false,
      noiseEnabled: true,
      glitchEnabled: false,
      noiseIntensity: 0.4,
      filmGrain: false,
      accentColor: '#ff0000',
      accentColorSecondary: '#7c3aed',
      vignetteOpacity: 0.5,
      chromaticStrength: 0,
      sectionPanelOpacity: 0.55,
      sectionGridOpacity: 0,
      cardSurfaceOpacity: 0.85,
      faviconUrl: null,
      faviconStoragePath: null,
      theme: draft.theme,
      lookId: 'neuroklast-classic',
      overlayAnimations: draft.overlayAnimations,
      overlayAnimation: 'circuitBreak',
      savedPresets: draft.savedPresets,
    })
  })

  it('preserves optional media paths, the selected animation and boolean/numeric zeros', () => {
    const draft = makeDraft({
      faviconUrl: 'https://cdn.example/icon.png',
      faviconStoragePath: 'site/favicon/icon.png',
      overlayAnimations: ['glitchScan'],
      crtEnabled: false,
      noiseIntensity: 0,
      vignetteOpacity: 0,
      cardSurfaceOpacity: 0,
    })
    expect(composeAppearancePayload(draft)).toMatchObject({
      faviconUrl: 'https://cdn.example/icon.png',
      faviconStoragePath: 'site/favicon/icon.png',
      overlayAnimation: 'glitchScan',
      crtEnabled: false,
      noiseIntensity: 0,
      vignetteOpacity: 0,
      cardSurfaceOpacity: 0,
    })
  })

  it('uses the historical default animation when the selected pool is empty', () => {
    const draft = makeDraft({ overlayAnimations: [] })
    const payload = composeAppearancePayload(draft)
    expect(payload.overlayAnimations).toEqual([])
    expect(payload.overlayAnimation).toBe(DEFAULTS.overlayAnimation)
  })

  it('returns a fresh container without mutating the theme, pool, or presets', () => {
    const draft = makeDraft()
    const first = composeAppearancePayload(draft)
    const second = composeAppearancePayload(draft)
    expect(first).not.toBe(second)
    expect(first.theme).toBe(draft.theme)
    expect(first.savedPresets).toBe(draft.savedPresets)
    expect(first.overlayAnimations).toBe(draft.overlayAnimations)
    expect(draft.faviconUrl).toBe('')
    expect(draft.faviconStoragePath).toBe('')
  })
})
