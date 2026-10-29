import { parseHeroPowerGlitch, type HeroPowerGlitchConfig } from '@/lib/hero-glitch-config'
import { parseHeroDesktopLogoWidth, parseHeroMobileLogoWidth } from '@/lib/hero-logo-widths'
import { resolveImageUrl } from '@/lib/r2'

/** Editable hero fields; transient save/error state is deliberately not included. */
export interface HeroEditorDraft {
  headline: string
  tagline: string
  ctaLabel: string
  ctaUrl: string
  logoImageStoragePath: string
  logoImageUrl: string
  backgroundImageStoragePath: string
  backgroundImageUrl: string
  backgroundImageOpacity: number
  bootSequenceEnabled: boolean
  logoWidthPercent: number
  logoWidthPercentMobile: number
  powerGlitch: HeroPowerGlitchConfig
}

export function createHeroEditorDraft(value: Record<string, unknown>): HeroEditorDraft {
  const logoImageStoragePath = typeof value.logoImageStoragePath === 'string' ? value.logoImageStoragePath : ''
  const backgroundImageStoragePath =
    typeof value.backgroundImageStoragePath === 'string' ? value.backgroundImageStoragePath : ''

  return {
    headline: typeof value.headline === 'string' ? value.headline : 'NEUROKLAST',
    tagline: typeof value.tagline === 'string' ? value.tagline : 'Industrial Metal / Drum & Bass',
    ctaLabel: typeof value.ctaLabel === 'string' ? value.ctaLabel : 'Listen Now',
    ctaUrl: typeof value.ctaUrl === 'string' ? value.ctaUrl : '#releases',
    logoImageStoragePath,
    logoImageUrl: resolveImageUrl(
      typeof value.logoImageStoragePath === 'string' ? value.logoImageStoragePath : null,
      typeof value.logoImageUrl === 'string' ? value.logoImageUrl : null,
    ) ?? '',
    backgroundImageStoragePath,
    backgroundImageUrl: resolveImageUrl(
      typeof value.backgroundImageStoragePath === 'string' ? value.backgroundImageStoragePath : null,
      typeof value.backgroundImageUrl === 'string' ? value.backgroundImageUrl : null,
    ) ?? '',
    backgroundImageOpacity: typeof value.backgroundImageOpacity === 'number'
      ? value.backgroundImageOpacity : 0.35,
    bootSequenceEnabled: value.bootSequenceEnabled !== false,
    logoWidthPercent: parseHeroDesktopLogoWidth(value),
    logoWidthPercentMobile: parseHeroMobileLogoWidth(value),
    powerGlitch: parseHeroPowerGlitch(value.powerGlitch),
  }
}

export type HeroEditorAction =
  | { type: 'patch'; changes: Partial<Omit<HeroEditorDraft, 'powerGlitch'>> }
  | { type: 'powerGlitch'; changes: Partial<HeroPowerGlitchConfig> }
  | { type: 'logoResolved'; path: string; publicUrl?: string }
  | { type: 'resetLogo' }
  | { type: 'backgroundResolved'; path: string; publicUrl?: string }
  | { type: 'clearBackground' }
  | { type: 'toggleBoot' }

/** Apply related hero changes atomically, retaining the old path-only media semantics. */
export function heroEditorReducer(state: HeroEditorDraft, action: HeroEditorAction): HeroEditorDraft {
  switch (action.type) {
    case 'patch':
      return { ...state, ...action.changes }
    case 'powerGlitch':
      return { ...state, powerGlitch: { ...state.powerGlitch, ...action.changes } }
    case 'logoResolved':
      return {
        ...state,
        logoImageStoragePath: action.path,
        logoImageUrl: action.publicUrl || state.logoImageUrl,
      }
    case 'resetLogo':
      return { ...state, logoImageStoragePath: '', logoImageUrl: '' }
    case 'backgroundResolved':
      return {
        ...state,
        backgroundImageStoragePath: action.path,
        backgroundImageUrl: action.publicUrl || state.backgroundImageUrl,
      }
    case 'clearBackground':
      return { ...state, backgroundImageStoragePath: '', backgroundImageUrl: '' }
    case 'toggleBoot':
      return { ...state, bootSequenceEnabled: !state.bootSequenceEnabled }
  }
}

/** Preserve the old persisted JSON key order for dirty snapshots and site-config updates. */
export function composeHeroPayload(draft: HeroEditorDraft) {
  return {
    headline: draft.headline,
    tagline: draft.tagline,
    ctaLabel: draft.ctaLabel,
    ctaUrl: draft.ctaUrl,
    logoImageStoragePath: draft.logoImageStoragePath || null,
    logoImageUrl: draft.logoImageUrl || null,
    backgroundImageStoragePath: draft.backgroundImageStoragePath || null,
    backgroundImageUrl: draft.backgroundImageUrl || null,
    backgroundImageOpacity: draft.backgroundImageOpacity,
    bootSequenceEnabled: draft.bootSequenceEnabled,
    logoWidthPercent: draft.logoWidthPercent,
    logoWidthPercentMobile: draft.logoWidthPercentMobile,
    powerGlitch: {
      mode: draft.powerGlitch.mode,
      durationMs: draft.powerGlitch.durationMs,
      sliceCount: draft.powerGlitch.sliceCount,
      shake: draft.powerGlitch.shake,
      hueRotate: draft.powerGlitch.hueRotate,
      pulse: draft.powerGlitch.pulse,
      continuous: draft.powerGlitch.continuous,
    },
  }
}
