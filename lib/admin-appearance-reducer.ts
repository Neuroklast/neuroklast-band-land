import type { SetStateAction } from 'react'
import type { AppearanceTheme, SavedAppearancePreset } from '@/lib/appearance-presets'
import type { LookDefinition } from '@/lib/looks'
import { DEFAULTS, DEFAULT_THEME, type AppearanceConfig } from '@/lib/admin-appearance-config'
import type { AppearanceEditorDraft } from '@/lib/admin-appearance-payload'
import { oklchToHex } from '@/lib/color-utils'
import { resolveImageUrl } from '@/lib/r2'

/**
 * The appearance editor owns one persisted draft and dispatches atomic transitions.
 * Transient UI state (save status/errors, preset input and saved snapshot) stays in React.
 */
export function createAppearanceDraft(config: AppearanceConfig): AppearanceEditorDraft {
  return {
    crtEnabled: config.crtEnabled,
    scanlineEnabled: config.scanlineEnabled,
    noiseEnabled: config.noiseEnabled,
    glitchEnabled: config.glitchEnabled,
    noiseIntensity: config.noiseIntensity,
    filmGrain: config.filmGrain,
    accentColor: config.accentColor,
    accentColorSecondary: config.accentColorSecondary,
    vignetteOpacity: config.vignetteOpacity,
    chromaticStrength: config.chromaticStrength,
    sectionPanelOpacity: config.sectionPanelOpacity,
    sectionGridOpacity: config.sectionGridOpacity,
    cardSurfaceOpacity: config.cardSurfaceOpacity,
    faviconStoragePath: config.faviconStoragePath ?? '',
    faviconUrl: resolveImageUrl(config.faviconStoragePath, config.faviconUrl) ?? '',
    theme: config.theme ?? DEFAULT_THEME,
    lookId: config.lookId ?? 'neuroklast-classic',
    overlayAnimations: config.overlayAnimations ?? DEFAULTS.overlayAnimations ?? [],
    savedPresets: config.savedPresets ?? [],
  }
}

export type AppearanceDraftAction =
  | { type: 'patch'; values: Partial<AppearanceEditorDraft> }
  | { type: 'overlayAnimations'; update: SetStateAction<string[]> }
  | { type: 'applyLook'; look: LookDefinition }
  | { type: 'applyPreset'; preset: SavedAppearancePreset }
  | { type: 'readableMode' }
  | { type: 'themeField'; key: keyof AppearanceTheme; value: string }
  | { type: 'savePreset'; name: string }

/**
 * Preserve the editor's previous field update semantics.
 * Look changes are applied in a single transition, so preview never sees partial looks.
 */
export function appearanceDraftReducer(
  state: AppearanceEditorDraft,
  action: AppearanceDraftAction,
): AppearanceEditorDraft {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.values }
    case 'overlayAnimations': {
      const next = typeof action.update === 'function'
        ? action.update(state.overlayAnimations)
        : action.update
      return { ...state, overlayAnimations: next }
    }
    case 'applyLook': {
      const { look } = action
      return {
        ...state,
        lookId: look.id,
        theme: { ...look.theme },
        accentColor: look.theme.accentColor
          ? oklchToHex(look.theme.accentColor)
          : state.accentColor,
        chromaticStrength: look.overlayEffects.chromatic?.enabled
          ? look.overlayEffects.chromatic.intensity : 0,
        noiseIntensity: look.overlayEffects.noise?.intensity ?? 0.15,
        vignetteOpacity: look.overlayEffects.vignette?.intensity ?? 0.5,
        crtEnabled: look.overlayEffects.crt?.enabled !== false,
        scanlineEnabled: look.overlayEffects.scanlines?.enabled !== false,
        noiseEnabled: look.overlayEffects.noise?.enabled !== false,
      }
    }
    case 'applyPreset':
      return {
        ...state,
        theme: { ...action.preset.theme },
        accentColor: action.preset.theme.accentColor
          ? oklchToHex(action.preset.theme.accentColor)
          : state.accentColor,
      }
    case 'readableMode':
      return { ...state, sectionPanelOpacity: 0.7, cardSurfaceOpacity: 0.9 }
    case 'themeField':
      return {
        ...state,
        theme: { ...state.theme, [action.key]: action.value },
        accentColor: action.key === 'accentColor'
          ? oklchToHex(action.value) : state.accentColor,
      }
    case 'savePreset': {
      const name = action.name.trim()
      if (!name) return state
      return {
        ...state,
        savedPresets: [
          ...state.savedPresets.filter(preset => preset.name !== name),
          { name, theme: { ...state.theme } },
        ],
      }
    }
  }
}
