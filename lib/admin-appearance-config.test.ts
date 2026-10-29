import { describe, expect, it } from 'vitest'
import {
  DEFAULTS,
  DEFAULT_THEME,
  parseConfig,
  parseTheme,
} from '@/lib/admin-appearance-config'
import { BUILTIN_APPEARANCE_PRESETS } from '@/lib/appearance-presets'
import { getClipShellNames } from '@/lib/overlay-animations'
import {
  DEFAULT_CARD_SURFACE_OPACITY,
  DEFAULT_SECTION_PANEL_OPACITY,
} from '@/lib/apply-appearance-config'

describe('appearance editor persisted config parsing', () => {
  it('restores the established defaults without persisted settings', () => {
    const result = parseConfig({})
    expect(result).toMatchObject({
      crtEnabled: true,
      scanlineEnabled: true,
      noiseEnabled: true,
      glitchEnabled: true,
      filmGrain: false,
      noiseIntensity: 0.15,
      accentColor: '#dc2626',
      accentColorSecondary: '#7c3aed',
      vignetteOpacity: 0.5,
      chromaticStrength: 0,
      sectionGridOpacity: 0,
      lookId: 'neuroklast-classic',
      overlayAnimation: 'circuitBreak',
      savedPresets: [],
    })
    expect(result.sectionPanelOpacity).toBe(DEFAULT_SECTION_PANEL_OPACITY)
    expect(result.cardSurfaceOpacity).toBe(DEFAULT_CARD_SURFACE_OPACITY)
    expect(result.overlayAnimations).toEqual(getClipShellNames())
    expect(result.theme).toEqual(BUILTIN_APPEARANCE_PRESETS[0].theme)
    expect(DEFAULTS.theme).toBe(DEFAULT_THEME)
  })

  it('retains valid user choices including numeric zeros, false flags and strings', () => {
    const result = parseConfig({
      crtEnabled: false,
      scanlineEnabled: false,
      noiseEnabled: false,
      glitchEnabled: false,
      noiseIntensity: 0,
      filmGrain: true,
      accentColor: '#123456',
      accentColorSecondary: '#abcdef',
      vignetteOpacity: 0,
      chromaticStrength: 0.75,
      sectionPanelOpacity: 0,
      sectionGridOpacity: 0.9,
      cardSurfaceOpacity: 1,
      faviconUrl: 'https://example.org/favicon.png',
      faviconStoragePath: 'site/favicon.png',
      lookId: 'glitch-noir',
      overlayAnimation: 'glitchScan',
    })
    expect(result).toMatchObject({
      crtEnabled: false,
      scanlineEnabled: false,
      noiseEnabled: false,
      glitchEnabled: false,
      noiseIntensity: 0,
      filmGrain: true,
      accentColor: '#123456',
      accentColorSecondary: '#abcdef',
      vignetteOpacity: 0,
      chromaticStrength: 0.75,
      sectionPanelOpacity: 0,
      sectionGridOpacity: 0.9,
      cardSurfaceOpacity: 1,
      faviconUrl: 'https://example.org/favicon.png',
      faviconStoragePath: 'site/favicon.png',
      lookId: 'glitch-noir',
      overlayAnimation: 'glitchScan',
      overlayAnimations: ['glitchScan'],
    })
  })

  it('ignores invalid stored field types without changing the previous defaults', () => {
    const result = parseConfig({
      crtEnabled: 'false',
      scanlineEnabled: 1,
      noiseEnabled: null,
      noiseIntensity: '0.7',
      filmGrain: [],
      accentColor: 7,
      faviconUrl: 9,
      faviconStoragePath: false,
      lookId: 'unknown',
      overlayAnimations: ['not-real-animation'],
      savedPresets: 'invalid',
    })
    expect(result.crtEnabled).toBe(DEFAULTS.crtEnabled)
    expect(result.noiseEnabled).toBe(DEFAULTS.noiseEnabled)
    expect(result.scanlineEnabled).toBe(DEFAULTS.scanlineEnabled)
    expect(result.noiseIntensity).toBe(DEFAULTS.noiseIntensity)
    expect(result.filmGrain).toBe(DEFAULTS.filmGrain)
    expect(result.accentColor).toBe(DEFAULTS.accentColor)
    expect(result.faviconUrl).toBe(DEFAULTS.faviconUrl)
    expect(result.faviconStoragePath).toBeUndefined()
    expect(result.lookId).toBe('neuroklast-classic')
    expect(result.overlayAnimations).toEqual(getClipShellNames())
  })

  it('retains the legacy look alias and overlay-animation pool precedence', () => {
    const result = parseConfig({
      lookId: 'zardonic-industrial',
      overlayAnimation: 'glitchScan',
      overlayAnimations: ['circuitBreak', 'invalid-name', 'glitchScan', 'none'],
    })
    expect(result.lookId).toBe('neuroklast-industrial')
    expect(result.overlayAnimations).toEqual(['circuitBreak', 'glitchScan'])
    expect(result.overlayAnimation).toBe('circuitBreak')
  })

  it('preserves extended theme fields while rejecting non-string and blank overrides', () => {
    const result = parseTheme({
      foregroundColor: 'oklch(0.9 0 0)',
      modalGlowColor: '#123456',
      headingFontSize: '2rem',
      fontMono: '  ',
      backgroundColor: 22,
      unknownField: 'not-persisted',
    })
    expect(result.foregroundColor).toBe('oklch(0.9 0 0)')
    expect(result.modalGlowColor).toBe('#123456')
    expect(result.headingFontSize).toBe('2rem')
    expect(result.fontMono).toBe(DEFAULT_THEME.fontMono)
    expect(result.backgroundColor).toBe(DEFAULT_THEME.backgroundColor)
    expect(result).not.toHaveProperty('unknownField')
    expect(parseTheme(null)).toEqual(DEFAULT_THEME)
    expect(parseTheme([])).toEqual(DEFAULT_THEME)
  })

  it('retains stored custom presets but filters entries without a name/theme object', () => {
    const savedPresets = [
      { name: 'User', theme: { accentColor: '#ff0000' } },
      { name: '', theme: {} },
      { name: 'Missing theme' },
      { name: false, theme: {} },
      null,
    ]
    expect(parseConfig({ savedPresets }).savedPresets).toEqual(savedPresets.slice(0, 2))
    expect(parseConfig({ savedPresets: 5 }).savedPresets).toEqual([])
  })

  it('creates separate theme objects for absent persisted themes', () => {
    const first = parseConfig({})
    const second = parseConfig({})
    expect(first.theme).toEqual(DEFAULT_THEME)
    expect(first.theme).not.toBe(DEFAULT_THEME)
    expect(first.theme).not.toBe(second.theme)
  })
})
