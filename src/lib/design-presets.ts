import type { DesignPreset, ThemeSettings } from './types'

export const neuroklastClassicPreset: DesignPreset = {
  id: 'neuroklast-classic',
  name: 'Neuroklast Classic',
  description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
  colors: {
    primary: 'oklch(0.60 0.25 25)',
    accent: 'oklch(0.65 0.26 25)',
    background: 'oklch(0.04 0.01 0)',
    card: 'oklch(0.08 0.02 0)',
    foreground: 'oklch(0.95 0.02 0)',
    mutedForeground: 'oklch(0.55 0.05 0)',
    border: 'oklch(0.20 0.05 0)',
    secondary: 'oklch(0.12 0.02 0)',
  },
  fonts: {
    heading: "'Rajdhani', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  overlayEffects: {
    scanlines: { enabled: true, intensity: 0.2 },
    crt: { enabled: true, intensity: 0.3 },
    noise: { enabled: true, intensity: 0.5 },
    vignette: { enabled: true, intensity: 0.6 },
    chromatic: { enabled: true, intensity: 0.4 },
    dotMatrix: { enabled: false, intensity: 0 },
  },
  animationSettings: {
    glitchEnabled: true,
    scanlineEnabled: true,
    chromaticEnabled: true,
    crtEnabled: true,
    noiseEnabled: true,
    circuitBackgroundEnabled: false,
    crtOverlayOpacity: 0.3,
    crtVignetteOpacity: 0.6,
    overlayTransitionEnabled: false,
  },
}

export const minimalDarkPreset: DesignPreset = {
  id: 'minimal-dark',
  name: 'Minimal Dark',
  description: 'A minimal dark techno theme with clean aesthetics',
  colors: {
    primary: 'oklch(0.95 0 0)',
    accent: 'oklch(0.7 0 0)',
    background: 'oklch(0.08 0 0)',
    foreground: 'oklch(0.95 0 0)',
    card: 'oklch(0.12 0 0)',
    cardForeground: 'oklch(0.95 0 0)',
    border: 'oklch(0.25 0 0)',
    mutedForeground: 'oklch(0.6 0 0)',
    secondary: 'oklch(0.15 0 0)',
  },
  fonts: {
    heading: "'JetBrains Mono', monospace",
    body: "'JetBrains Mono', monospace",
    mono: "'JetBrains Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
}

export const DESIGN_PRESETS: Record<string, DesignPreset> = {
  'neuroklast-classic': neuroklastClassicPreset,
  'minimal-dark': minimalDarkPreset,
}

export const PRESET_IDS = Object.keys(DESIGN_PRESETS) as (keyof typeof DESIGN_PRESETS)[]

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
