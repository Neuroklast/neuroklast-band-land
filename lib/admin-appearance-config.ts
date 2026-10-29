import {
  BUILTIN_APPEARANCE_PRESETS,
  type AppearanceTheme,
  type SavedAppearancePreset,
} from '@/lib/appearance-presets'
import { parseLookId } from '@/lib/looks'
import { getClipShellNames, parseOverlayAnimationPool } from '@/lib/overlay-animations'
import {
  DEFAULT_CARD_SURFACE_OPACITY,
  DEFAULT_SECTION_PANEL_OPACITY,
} from '@/lib/apply-appearance-config'

/**
 * Storage parsing for the admin appearance editor.
 * The renderer owns interaction and persistence; this module has no React or server actions.
 */
export interface AppearanceConfig {
  crtEnabled: boolean
  scanlineEnabled: boolean
  noiseEnabled: boolean
  glitchEnabled: boolean
  noiseIntensity: number
  filmGrain: boolean
  accentColor: string
  accentColorSecondary: string
  vignetteOpacity: number
  chromaticStrength: number
  sectionPanelOpacity: number
  sectionGridOpacity: number
  cardSurfaceOpacity: number
  faviconUrl?: string | null
  faviconStoragePath?: string | null
  theme?: AppearanceTheme
  lookId?: string
  overlayAnimation?: string
  overlayAnimations?: string[]
  savedPresets?: SavedAppearancePreset[]
}

export const DEFAULT_THEME: AppearanceTheme = BUILTIN_APPEARANCE_PRESETS[0].theme


export const DEFAULTS: AppearanceConfig = {
  crtEnabled: true,
  scanlineEnabled: true,
  noiseEnabled: true,
  glitchEnabled: true,
  noiseIntensity: 0.15,
  filmGrain: false,
  accentColor: '#dc2626',
  accentColorSecondary: '#7c3aed',
  vignetteOpacity: 0.5,
  chromaticStrength: 0,
  sectionPanelOpacity: DEFAULT_SECTION_PANEL_OPACITY,
  sectionGridOpacity: 0,
  cardSurfaceOpacity: DEFAULT_CARD_SURFACE_OPACITY,
  faviconUrl: '',
  theme: DEFAULT_THEME,
  lookId: 'neuroklast-classic',
  overlayAnimation: 'circuitBreak',
  overlayAnimations: getClipShellNames(),
  savedPresets: [],
}

/** All theme keys we accept from storage (not only preset defaults — so modalGlowColor etc. persist). */
const THEME_STRING_KEYS: Array<keyof AppearanceTheme> = [
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'cardColor',
  'foregroundColor',
  'mutedForegroundColor',
  'borderColor',
  'secondaryColor',
  'modalGlowColor',
  'fontHeading',
  'fontBody',
  'fontMono',
  'headingFontSize',
  'bodyFontSize',
  'monoFontSize',
]

export function parseTheme(raw: unknown): AppearanceTheme {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_THEME }
  const source = raw as Record<string, unknown>
  const theme: AppearanceTheme = { ...DEFAULT_THEME }
  for (const key of THEME_STRING_KEYS) {
    if (typeof source[key] === 'string' && source[key].trim() !== '') {
      theme[key] = source[key] as string
    }
  }
  return theme
}

export function parseConfig(raw: Record<string, unknown>): AppearanceConfig {
  const savedPresets = Array.isArray(raw.savedPresets)
    ? (raw.savedPresets as SavedAppearancePreset[]).filter(
        (p) => p && typeof p.name === 'string' && p.theme && typeof p.theme === 'object',
      )
    : []

  return {
    crtEnabled: typeof raw.crtEnabled === 'boolean' ? raw.crtEnabled : DEFAULTS.crtEnabled,
    scanlineEnabled: typeof raw.scanlineEnabled === 'boolean' ? raw.scanlineEnabled : DEFAULTS.scanlineEnabled,
    noiseEnabled: typeof raw.noiseEnabled === 'boolean' ? raw.noiseEnabled : DEFAULTS.noiseEnabled,
    glitchEnabled: typeof raw.glitchEnabled === 'boolean' ? raw.glitchEnabled : DEFAULTS.glitchEnabled,
    noiseIntensity:
      typeof raw.noiseIntensity === 'number' ? raw.noiseIntensity : DEFAULTS.noiseIntensity,
    filmGrain: typeof raw.filmGrain === 'boolean' ? raw.filmGrain : DEFAULTS.filmGrain,
    accentColor: typeof raw.accentColor === 'string' ? raw.accentColor : DEFAULTS.accentColor,
    accentColorSecondary:
      typeof raw.accentColorSecondary === 'string' ? raw.accentColorSecondary : DEFAULTS.accentColorSecondary,
    vignetteOpacity: typeof raw.vignetteOpacity === 'number' ? raw.vignetteOpacity : DEFAULTS.vignetteOpacity,
    chromaticStrength:
      typeof raw.chromaticStrength === 'number' ? raw.chromaticStrength : DEFAULTS.chromaticStrength,
    sectionPanelOpacity:
      typeof raw.sectionPanelOpacity === 'number'
        ? raw.sectionPanelOpacity
        : DEFAULTS.sectionPanelOpacity,
    sectionGridOpacity:
      typeof raw.sectionGridOpacity === 'number'
        ? raw.sectionGridOpacity
        : DEFAULTS.sectionGridOpacity,
    cardSurfaceOpacity:
      typeof raw.cardSurfaceOpacity === 'number'
        ? raw.cardSurfaceOpacity
        : DEFAULTS.cardSurfaceOpacity,
    faviconUrl: typeof raw.faviconUrl === 'string' ? raw.faviconUrl : DEFAULTS.faviconUrl,
    faviconStoragePath:
      typeof raw.faviconStoragePath === 'string' ? raw.faviconStoragePath : undefined,
    theme: parseTheme(raw.theme),
    lookId: parseLookId(raw.lookId),
    overlayAnimation: parseOverlayAnimationPool(raw.overlayAnimations ?? raw.overlayAnimation)[0] ?? DEFAULTS.overlayAnimation,
    overlayAnimations: (() => {
      const pool = parseOverlayAnimationPool(raw.overlayAnimations ?? raw.overlayAnimation)
      return pool.length > 0 ? pool : DEFAULTS.overlayAnimations
    })(),
    savedPresets,
  }
}

