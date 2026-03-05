/**
 * Bundled design presets for the site template.
 *
 * Each preset defines a complete visual theme: color palette, font pairings,
 * border-radius, and animation preferences.  When a preset is applied its
 * values are written to `ThemeSettings`, which in turn populates CSS custom
 * properties.  Individual values can always be overridden afterwards.
 *
 * Related issue: #157
 */

import type { DesignPreset, ThemeSettings } from './types'

// ─── Bundled presets ─────────────────────────────────────────────────────────

export const cyberpunkPreset: DesignPreset = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description: 'Dark industrial aesthetic with crimson red neon accents',
  colors: {
    primary: 'oklch(0.50 0.22 25)',
    accent: 'oklch(0.60 0.24 25)',
    background: 'oklch(0 0 0)',
    card: 'oklch(0.05 0 0)',
    foreground: 'oklch(1 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    border: 'oklch(0.15 0 0)',
    secondary: 'oklch(0.10 0 0)',
  },
  fonts: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  borderRadius: 0.125,
  animationsEnabled: true,
}

export const minimalPreset: DesignPreset = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, light, content-first design with subtle accents',
  colors: {
    primary: 'oklch(0.30 0 0)',
    accent: 'oklch(0.45 0 0)',
    background: 'oklch(0.99 0 0)',
    card: 'oklch(0.96 0 0)',
    foreground: 'oklch(0.15 0 0)',
    mutedForeground: 'oklch(0.50 0 0)',
    border: 'oklch(0.88 0 0)',
    secondary: 'oklch(0.93 0 0)',
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0.5,
  animationsEnabled: false,
}

export const elegantPreset: DesignPreset = {
  id: 'elegant',
  name: 'Elegant',
  description: 'Refined serif typography with warm gold accents on dark canvas',
  colors: {
    primary: 'oklch(0.72 0.12 85)',
    accent: 'oklch(0.80 0.14 90)',
    background: 'oklch(0.07 0.01 60)',
    card: 'oklch(0.11 0.01 60)',
    foreground: 'oklch(0.95 0.02 80)',
    mutedForeground: 'oklch(0.60 0.04 80)',
    border: 'oklch(0.20 0.03 70)',
    secondary: 'oklch(0.14 0.02 65)',
  },
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Lora', serif",
    mono: "'Source Code Pro', monospace",
  },
  borderRadius: 0.25,
  animationsEnabled: false,
}

export const neonPreset: DesignPreset = {
  id: 'neon',
  name: 'Neon',
  description: 'High-contrast electric blue and cyan on deep black – synthwave',
  colors: {
    primary: 'oklch(0.65 0.25 220)',
    accent: 'oklch(0.75 0.22 190)',
    background: 'oklch(0.02 0.01 260)',
    card: 'oklch(0.07 0.02 260)',
    foreground: 'oklch(0.97 0.01 200)',
    mutedForeground: 'oklch(0.55 0.06 220)',
    border: 'oklch(0.18 0.05 230)',
    secondary: 'oklch(0.10 0.03 250)',
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
}

export const retroPreset: DesignPreset = {
  id: 'retro',
  name: 'Retro',
  description: 'Warm amber phosphor-glow on near-black – vintage terminal look',
  colors: {
    primary: 'oklch(0.70 0.15 70)',
    accent: 'oklch(0.80 0.18 75)',
    background: 'oklch(0.05 0.02 60)',
    card: 'oklch(0.09 0.02 60)',
    foreground: 'oklch(0.88 0.10 80)',
    mutedForeground: 'oklch(0.55 0.07 70)',
    border: 'oklch(0.18 0.05 65)',
    secondary: 'oklch(0.12 0.03 62)',
  },
  fonts: {
    heading: "'VT323', monospace",
    body: "'Share Tech Mono', monospace",
    mono: "'Share Tech Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
}

export const zardonicIndustrialPreset: DesignPreset = {
  id: 'zardonic-industrial',
  name: 'Zardonic Industrial',
  description: 'Heavy industrial aesthetic – CRT distortion, glitch effects, and aggressive red/orange tones',
  colors: {
    primary: 'oklch(0.50 0.22 25)',
    accent: 'oklch(0.60 0.24 25)',
    background: 'oklch(0 0 0)',
    card: 'oklch(0.05 0 0)',
    foreground: 'oklch(1 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    border: 'oklch(0.15 0 0)',
    secondary: 'oklch(0.10 0 0)',
  },
  fonts: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  borderRadius: 0.125,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: true, intensity: 0.4 },
    crt: { enabled: true, intensity: 0.6 },
    noise: { enabled: true, intensity: 0.15 },
    vignette: { enabled: true, intensity: 0.3 },
    chromatic: { enabled: true, intensity: 0.3 },
    dotMatrix: { enabled: false, intensity: 0 },
  },
  animationSettings: {
    glitchEnabled: true,
    scanlineEnabled: true,
    chromaticEnabled: true,
    crtEnabled: true,
    noiseEnabled: true,
    circuitBackgroundEnabled: true,
    crtOverlayOpacity: 0.6,
    crtVignetteOpacity: 0.3,
    overlayTransitionEnabled: false,
  },
  loadingScreenType: '3d-model',
  heroStyle: 'glitch-parallax',
}

export const neuroklastClassicPreset: DesignPreset = {
  id: 'neuroklast-classic',
  name: 'Neuroklast Classic',
  description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
  colors: {
    primary: 'oklch(0.50 0.22 25)',
    accent: 'oklch(0.60 0.24 25)',
    background: 'oklch(0 0 0)',
    card: 'oklch(0.05 0 0)',
    foreground: 'oklch(1 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    border: 'oklch(0.15 0 0)',
    secondary: 'oklch(0.10 0 0)',
  },
  fonts: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  borderRadius: 0.125,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: true, intensity: 0.3 },
    crt: { enabled: true, intensity: 0.4 },
    noise: { enabled: true, intensity: 0.15 },
    vignette: { enabled: true, intensity: 0.5 },
    chromatic: { enabled: false, intensity: 0 },
    dotMatrix: { enabled: false, intensity: 0 },
  },
  animationSettings: {
    glitchEnabled: true,
    scanlineEnabled: true,
    chromaticEnabled: false,
    crtEnabled: true,
    noiseEnabled: true,
    circuitBackgroundEnabled: true,
    crtOverlayOpacity: 0.4,
    crtVignetteOpacity: 0.5,
    overlayTransitionEnabled: false,
  },
  loadingScreenType: 'code-rain',
  heroStyle: 'chromatic-hover',
}

export const artDecoCyberpunkPreset: DesignPreset = {
  id: 'art-deco-cyberpunk',
  name: 'Art Deco Cyberpunk',
  description: '1920s Art Deco meets future tech – geometric gold leaf patterns on black',
  colors: {
    primary: 'oklch(0.75 0.12 85)',
    accent: 'oklch(0.85 0.14 90)',
    background: 'oklch(0.02 0 0)',
    card: 'oklch(0.06 0.01 60)',
    foreground: 'oklch(0.95 0.03 80)',
    mutedForeground: 'oklch(0.60 0.05 80)',
    border: 'oklch(0.25 0.06 75)',
    secondary: 'oklch(0.10 0.01 65)',
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Raleway', sans-serif",
    mono: "'Courier Prime', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: false, intensity: 0 },
    crt: { enabled: false, intensity: 0 },
    noise: { enabled: true, intensity: 0.05 },
    vignette: { enabled: true, intensity: 0.5 },
    chromatic: { enabled: false, intensity: 0 },
    dotMatrix: { enabled: true, intensity: 0.15 },
  },
  animationSettings: {
    glitchEnabled: false,
    scanlineEnabled: false,
    chromaticEnabled: false,
    crtEnabled: false,
    noiseEnabled: false,
    circuitBackgroundEnabled: false,
    crtOverlayOpacity: 0,
    crtVignetteOpacity: 0,
    overlayTransitionEnabled: true,
  },
}

export const vhsRetroPreset: DesignPreset = {
  id: 'vhs-retro',
  name: 'VHS Retro',
  description: 'Analog VHS tape aesthetic – tracking lines, color bleeding, tape distortion',
  colors: {
    primary: 'oklch(0.72 0.10 75)',
    accent: 'oklch(0.80 0.08 80)',
    background: 'oklch(0.06 0.02 60)',
    card: 'oklch(0.10 0.02 60)',
    foreground: 'oklch(0.90 0.04 80)',
    mutedForeground: 'oklch(0.58 0.05 70)',
    border: 'oklch(0.22 0.03 65)',
    secondary: 'oklch(0.14 0.02 62)',
  },
  fonts: {
    heading: "'Press Start 2P', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'VT323', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: true, intensity: 0.5 },
    crt: { enabled: true, intensity: 0.5 },
    noise: { enabled: true, intensity: 0.4 },
    vignette: { enabled: false, intensity: 0 },
    chromatic: { enabled: true, intensity: 0.4 },
    dotMatrix: { enabled: false, intensity: 0 },
  },
  animationSettings: {
    glitchEnabled: false,
    scanlineEnabled: true,
    chromaticEnabled: true,
    crtEnabled: true,
    noiseEnabled: true,
    circuitBackgroundEnabled: false,
    crtOverlayOpacity: 0.5,
    crtVignetteOpacity: 0,
    overlayTransitionEnabled: false,
  },
}

export const steampunkPreset: DesignPreset = {
  id: 'steampunk',
  name: 'Steampunk',
  description: 'Victorian industrial meets brass machinery – copper tones and ornate details',
  colors: {
    primary: 'oklch(0.62 0.12 50)',
    accent: 'oklch(0.72 0.14 55)',
    background: 'oklch(0.10 0.03 40)',
    card: 'oklch(0.15 0.03 40)',
    foreground: 'oklch(0.92 0.04 60)',
    mutedForeground: 'oklch(0.58 0.06 50)',
    border: 'oklch(0.25 0.05 48)',
    secondary: 'oklch(0.18 0.03 42)',
  },
  fonts: {
    heading: "'Cinzel', serif",
    body: "'Lora', serif",
    mono: "'Courier Prime', monospace",
  },
  borderRadius: 0.25,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: false, intensity: 0 },
    crt: { enabled: false, intensity: 0 },
    noise: { enabled: true, intensity: 0.2 },
    vignette: { enabled: true, intensity: 0.6 },
    chromatic: { enabled: false, intensity: 0 },
    dotMatrix: { enabled: true, intensity: 0.1 },
  },
  animationSettings: {
    glitchEnabled: false,
    scanlineEnabled: false,
    chromaticEnabled: false,
    crtEnabled: false,
    noiseEnabled: false,
    circuitBackgroundEnabled: false,
    crtOverlayOpacity: 0,
    crtVignetteOpacity: 0,
    overlayTransitionEnabled: false,
  },
}

export const analogDarkMetalPreset: DesignPreset = {
  id: 'analog-dark-metal',
  name: 'Analog Dark Metal',
  description: 'Dark, heavy, brutal – analog grain, blackletter type, raw texture',
  colors: {
    primary: 'oklch(0.75 0 0)',
    accent: 'oklch(0.88 0 0)',
    background: 'oklch(0.03 0 0)',
    card: 'oklch(0.07 0 0)',
    foreground: 'oklch(0.85 0 0)',
    mutedForeground: 'oklch(0.45 0 0)',
    border: 'oklch(0.15 0 0)',
    secondary: 'oklch(0.10 0 0)',
  },
  fonts: {
    heading: "'UnifrakturMaguntia', cursive",
    body: "'Bitter', serif",
    mono: "'IBM Plex Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: true, intensity: 0.1 },
    crt: { enabled: false, intensity: 0 },
    noise: { enabled: true, intensity: 0.5 },
    vignette: { enabled: true, intensity: 0.7 },
    chromatic: { enabled: false, intensity: 0 },
    dotMatrix: { enabled: false, intensity: 0 },
  },
  animationSettings: {
    glitchEnabled: false,
    scanlineEnabled: false,
    chromaticEnabled: false,
    crtEnabled: false,
    noiseEnabled: true,
    circuitBackgroundEnabled: false,
    crtOverlayOpacity: 0,
    crtVignetteOpacity: 0,
    overlayTransitionEnabled: false,
  },
}

/** All bundled presets indexed by their ID */
export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  cyberpunk: cyberpunkPreset,
  minimal: minimalPreset,
  elegant: elegantPreset,
  neon: neonPreset,
  retro: retroPreset,
  'zardonic-industrial': zardonicIndustrialPreset,
  'neuroklast-classic': neuroklastClassicPreset,
  'art-deco-cyberpunk': artDecoCyberpunkPreset,
  'vhs-retro': vhsRetroPreset,
  steampunk: steampunkPreset,
  'analog-dark-metal': analogDarkMetalPreset,
}

/** Ordered list of all bundled preset IDs */
export const PRESET_IDS = Object.keys(DESIGN_PRESETS) as (keyof typeof DESIGN_PRESETS)[]

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Look up a preset by ID.  Returns `undefined` if the ID is unknown.
 */
export function getPreset(id: string): DesignPreset | undefined {
  return DESIGN_PRESETS[id]
}

/**
 * Convert a `DesignPreset` into a `ThemeSettings` patch that can be merged
 * into the active `SiteConfig.themeSettings`.
 *
 * The caller can then override individual values after applying the preset.
 */
export function presetToThemeSettings(preset: DesignPreset): ThemeSettings {
  return {
    primary: preset.colors.primary,
    accent: preset.colors.accent,
    background: preset.colors.background,
    card: preset.colors.card,
    foreground: preset.colors.foreground,
    mutedForeground: preset.colors.mutedForeground,
    border: preset.colors.border,
    secondary: preset.colors.secondary,
    fontHeading: preset.fonts.heading,
    fontBody: preset.fonts.body,
    fontMono: preset.fonts.mono,
    borderRadius: preset.borderRadius,
    activePreset: preset.id,
    ...(preset.overlayEffects ? { overlayEffects: preset.overlayEffects } : {}),
    ...(preset.animationSettings ? { animationSettings: preset.animationSettings } : {}),
    ...(preset.loadingScreenType ? { loadingScreenType: preset.loadingScreenType } : {}),
    ...(preset.heroStyle ? { heroStyle: preset.heroStyle } : {}),
    // Extended optional colors
    ...(preset.colors.primaryForeground !== undefined ? { primaryForeground: preset.colors.primaryForeground } : {}),
    ...(preset.colors.cardForeground !== undefined ? { cardForeground: preset.colors.cardForeground } : {}),
    ...(preset.colors.popoverColor !== undefined ? { popoverColor: preset.colors.popoverColor } : {}),
    ...(preset.colors.popoverForeground !== undefined ? { popoverForeground: preset.colors.popoverForeground } : {}),
    ...(preset.colors.secondaryForeground !== undefined ? { secondaryForeground: preset.colors.secondaryForeground } : {}),
    ...(preset.colors.accentForeground !== undefined ? { accentForeground: preset.colors.accentForeground } : {}),
    ...(preset.colors.destructiveColor !== undefined ? { destructiveColor: preset.colors.destructiveColor } : {}),
    ...(preset.colors.destructiveForeground !== undefined ? { destructiveForeground: preset.colors.destructiveForeground } : {}),
    ...(preset.colors.inputColor !== undefined ? { inputColor: preset.colors.inputColor } : {}),
    ...(preset.colors.ringColor !== undefined ? { ringColor: preset.colors.ringColor } : {}),
    ...(preset.colors.hoverColor !== undefined ? { hoverColor: preset.colors.hoverColor } : {}),
  }
}
