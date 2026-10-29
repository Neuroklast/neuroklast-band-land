import { DEFAULTS, type AppearanceConfig } from '@/lib/admin-appearance-config'

export type AppearanceEditorDraft =
  Omit<AppearanceConfig,
    'faviconUrl' | 'faviconStoragePath' | 'overlayAnimation' | 'overlayAnimations' | 'theme' | 'lookId' | 'savedPresets'
  > & {
    faviconUrl: string
    faviconStoragePath: string
    theme: NonNullable<AppearanceConfig['theme']>
    lookId: string
    overlayAnimations: string[]
    savedPresets: NonNullable<AppearanceConfig['savedPresets']>
  }

/**
 * Keep the serialized field order and null/fallback semantics of the original editor.
 * The same payload drives dirty checks, live preview and the updateSiteConfig action.
 */
export function composeAppearancePayload(draft: AppearanceEditorDraft): AppearanceConfig {
  return {
    crtEnabled: draft.crtEnabled,
    scanlineEnabled: draft.scanlineEnabled,
    noiseEnabled: draft.noiseEnabled,
    glitchEnabled: draft.glitchEnabled,
    noiseIntensity: draft.noiseIntensity,
    filmGrain: draft.filmGrain,
    accentColor: draft.accentColor,
    accentColorSecondary: draft.accentColorSecondary,
    vignetteOpacity: draft.vignetteOpacity,
    chromaticStrength: draft.chromaticStrength,
    sectionPanelOpacity: draft.sectionPanelOpacity,
    sectionGridOpacity: draft.sectionGridOpacity,
    cardSurfaceOpacity: draft.cardSurfaceOpacity,
    faviconUrl: draft.faviconUrl || null,
    faviconStoragePath: draft.faviconStoragePath || null,
    theme: draft.theme,
    lookId: draft.lookId,
    overlayAnimations: draft.overlayAnimations,
    overlayAnimation: draft.overlayAnimations[0] ?? DEFAULTS.overlayAnimation,
    savedPresets: draft.savedPresets,
  }
}
