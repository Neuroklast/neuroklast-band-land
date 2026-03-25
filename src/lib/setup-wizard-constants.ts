/**
 * @file setup-wizard-constants.ts
 *
 * Compile-time constants for the Setup Wizard feature.
 *
 * WHY a dedicated module: Constants are referenced by both the hook
 * (use-setup-wizard) and several step components. Centralising them here
 * eliminates circular imports and keeps each file focused on a single
 * responsibility (ISO/IEC 25010 – Maintainability).
 */

import {
  MusicNote,
  Waveform,
  MicrophoneStage,
  VinylRecord,
  Briefcase,
  Code,
  type Icon,
} from '@phosphor-icons/react'
import type { SiteConfig } from '@/lib/types'

// ─── Font options ─────────────────────────────────────────────────────────────

export interface FontOption {
  /** Human-readable font label shown in the <select>. */
  label: string
  /** Full CSS font-family string applied to the document. */
  value: string
  /** Whether the font must be loaded from Google Fonts at runtime. */
  google: boolean
}

/** All fonts available in the wizard font-picker steps. */
export const FONT_OPTIONS: FontOption[] = [
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", google: false },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", google: false },
  { label: 'System Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', google: false },
  { label: 'System Sans', value: 'ui-sans-serif, system-ui, sans-serif', google: false },
  { label: 'System Serif', value: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif", google: false },
  { label: 'Orbitron', value: "'Orbitron', sans-serif", google: true },
  { label: 'Share Tech Mono', value: "'Share Tech Mono', monospace", google: true },
  { label: 'VT323', value: "'VT323', monospace", google: true },
  { label: 'Press Start 2P', value: "'Press Start 2P', monospace", google: true },
  { label: 'Audiowide', value: "'Audiowide', sans-serif", google: true },
  { label: 'Rajdhani', value: "'Rajdhani', sans-serif", google: true },
  { label: 'Chakra Petch', value: "'Chakra Petch', sans-serif", google: true },
  { label: 'Exo 2', value: "'Exo 2', sans-serif", google: true },
  { label: 'Tektur', value: "'Tektur', sans-serif", google: true },
  { label: 'Oxanium', value: "'Oxanium', sans-serif", google: true },
  { label: 'Iceland', value: "'Iceland', monospace", google: true },
  { label: 'Michroma', value: "'Michroma', sans-serif", google: true },
  { label: 'Russo One', value: "'Russo One', sans-serif", google: true },
  { label: 'Bruno Ace', value: "'Bruno Ace', sans-serif", google: true },
  { label: 'Electrolize', value: "'Electrolize', sans-serif", google: true },
]

// ─── Site-type options ────────────────────────────────────────────────────────

export interface SiteTypeOption {
  id: SiteConfig['siteType']
  label: string
  description: string
  Icon: Icon
}

/** All site-type choices shown in the wizard Site Type step. */
export const SITE_TYPES: SiteTypeOption[] = [
  { id: 'band', label: 'Band', description: 'Rock, metal, punk, indie — any group', Icon: MusicNote },
  { id: 'dj', label: 'DJ', description: 'Electronic, club, festival DJ', Icon: Waveform },
  { id: 'artist', label: 'Artist', description: 'Solo musician or singer-songwriter', Icon: MicrophoneStage },
  { id: 'label', label: 'Label', description: 'Record label or music collective', Icon: VinylRecord },
  { id: 'portfolio', label: 'Portfolio', description: 'Music producer or studio portfolio', Icon: Briefcase },
  { id: 'custom', label: 'Custom', description: 'Anything else — full control', Icon: Code },
]

// ─── Step labels ──────────────────────────────────────────────────────────────

/**
 * Ordered list of step names displayed in the progress indicator.
 * The activation step is injected at index 0 when a key is required –
 * use `getWizardSteps()` to get the correct array for a given session.
 */
export const STEPS_BASE = [
  'Welcome',
  'Site Type',
  'Basic Info',
  'Theme',
  'Colors',
  'Fonts',
  'Logo & Assets',
  'Sections',
  'Social Links',
  'Legal',
  'Admin Password',
  'Done',
] as const

export const ACTIVATION_STEP = 'Activation Key' as const

/**
 * Returns the full step-label array for this wizard session.
 *
 * @param withActivation - When `true` the activation step is prepended.
 */
export function getWizardSteps(withActivation: boolean): string[] {
  return withActivation ? [ACTIVATION_STEP, ...STEPS_BASE] : [...STEPS_BASE]
}

// ─── ENV warning colours ──────────────────────────────────────────────────────

/** OKLCH colour for the missing-ENV-vars warning border and text. */
export const ENV_WARNING_COLOR = 'oklch(0.7 0.15 60)'

/** OKLCH colour for the missing-ENV-vars warning background. */
export const ENV_WARNING_BG = 'oklch(0.7 0.15 60 / 0.08)'

// ─── Social links shape ───────────────────────────────────────────────────────

/** Initial (empty) shape for the social-links form state. */
export const SOCIAL_LINKS_INITIAL = {
  instagram: '',
  spotify: '',
  soundcloud: '',
  bandcamp: '',
  youtube: '',
  facebook: '',
  tiktok: '',
  twitter: '',
} as const

export type SocialLinksState = {
  -readonly [K in keyof typeof SOCIAL_LINKS_INITIAL]: string
}

/** Field metadata for the Social Links step. */
export const SOCIAL_FIELDS: Array<{
  key: keyof SocialLinksState
  label: string
  placeholder: string
}> = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
  { key: 'soundcloud', label: 'SoundCloud', placeholder: 'https://soundcloud.com/...' },
  { key: 'bandcamp', label: 'Bandcamp', placeholder: 'https://....bandcamp.com' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@...' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
]
