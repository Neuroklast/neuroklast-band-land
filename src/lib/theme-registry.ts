/**
 * Theme Registry — manages available ThemePackage instances.
 *
 * Provides theme lookup, registration, and a React hook for resolving
 * slot components with fallbacks.
 */

import type React from 'react'
import type { ThemePackage, ThemeSlots } from './types'

// ─── Registry ────────────────────────────────────────────────────────────────

const _registry: Map<string, ThemePackage> = new Map()

/** Register a theme package in the registry */
export function registerTheme(theme: ThemePackage): void {
  _registry.set(theme.id, theme)
}

/** Get a theme by ID, or undefined if not found */
export function getTheme(id: string): ThemePackage | undefined {
  return _registry.get(id)
}

/** Get all registered themes */
export function getAllThemes(): ThemePackage[] {
  return Array.from(_registry.values())
}

/** Get the active theme based on a theme ID (falls back to cyberpunk) */
export function getActiveTheme(themeId?: string): ThemePackage {
  if (themeId) {
    const found = _registry.get(themeId)
    if (found) return found
  }
  return _registry.get('cyberpunk') ?? Array.from(_registry.values())[0]!
}

// ─── useThemeSlots hook ───────────────────────────────────────────────────────

/**
 * Resolves a theme's slots with fallback stubs for any missing slot.
 * Returns a complete ThemeSlots object where every slot is guaranteed to
 * be a valid React component.
 */
export function useThemeSlots(themeId?: string): ThemeSlots {
  const theme = getActiveTheme(themeId)
  return resolveSlots(theme)
}

function resolveSlots(theme: ThemePackage): ThemeSlots {
  return {
    Hero: theme.slots.Hero ?? DefaultHero,
    Navigation: theme.slots.Navigation ?? DefaultNavigation,
    LoadingScreen: theme.slots.LoadingScreen ?? DefaultLoadingScreen,
    SectionDivider: theme.slots.SectionDivider ?? DefaultSectionDivider,
    Card: theme.slots.Card ?? DefaultCard,
    BackgroundEffects: theme.slots.BackgroundEffects ?? DefaultBackgroundEffects,
    Footer: theme.slots.Footer ?? DefaultFooter,
  }
}

// ─── Default slot stubs ───────────────────────────────────────────────────────

// These are minimal React components used as fallbacks when a theme doesn't
// provide its own slot implementation.

function DefaultHero() {
  return null
}
DefaultHero.displayName = 'DefaultHero'

function DefaultNavigation() {
  return null
}
DefaultNavigation.displayName = 'DefaultNavigation'

function DefaultLoadingScreen({ onComplete }: { onComplete: () => void }) {
  onComplete()
  return null
}
DefaultLoadingScreen.displayName = 'DefaultLoadingScreen'

function DefaultSectionDivider() {
  return null
}
DefaultSectionDivider.displayName = 'DefaultSectionDivider'

function DefaultCard({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
DefaultCard.displayName = 'DefaultCard'

function DefaultBackgroundEffects() {
  return null
}
DefaultBackgroundEffects.displayName = 'DefaultBackgroundEffects'

function DefaultFooter() {
  return null
}
DefaultFooter.displayName = 'DefaultFooter'

// ─── Built-in theme definitions ───────────────────────────────────────────────

const cyberpunkTheme: ThemePackage = {
  id: 'cyberpunk',
  name: 'Cyberpunk',
  description: 'Dark industrial aesthetic with crimson red neon accents',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'glitch-parallax',
    loadingScreen: 'cyberpunk',
    navigationStyle: 'cyberpunk-hud',
  },
  typography: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  effects: {
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
    },
  },
  borderRadius: 0.125,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'neon-red',
      name: 'Neon Red',
      description: 'Default crimson red neon',
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
    },
    {
      id: 'cyber-blue',
      name: 'Cyber Blue',
      description: 'Electric cyber blue',
      colors: {
        primary: 'oklch(0.55 0.22 220)',
        accent: 'oklch(0.65 0.20 210)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 220)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 220)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'toxic-green',
      name: 'Toxic Green',
      description: 'Toxic neon green',
      colors: {
        primary: 'oklch(0.60 0.22 145)',
        accent: 'oklch(0.70 0.20 150)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 145)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 145)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'violet-chrome',
      name: 'Violet Chrome',
      description: 'Deep violet with chrome sheen',
      colors: {
        primary: 'oklch(0.55 0.22 290)',
        accent: 'oklch(0.65 0.20 300)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 290)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 290)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'gold-circuit',
      name: 'Gold Circuit',
      description: 'Circuit board gold',
      colors: {
        primary: 'oklch(0.72 0.15 85)',
        accent: 'oklch(0.80 0.14 90)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 85)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'crimson-punk',
      name: 'Crimson Punk',
      description: 'Aggressive crimson punk',
      colors: {
        primary: 'oklch(0.45 0.25 10)',
        accent: 'oklch(0.55 0.26 15)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0 0)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
  ],
  defaultPresetId: 'neon-red',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {},
}

const minimalTheme: ThemePackage = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, light, content-first design with subtle accents',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'minimal',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  effects: {},
  borderRadius: 0.5,
  animationsEnabled: false,
  colorPresets: [
    {
      id: 'light',
      name: 'Light',
      description: 'Clean light mode',
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
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Clean dark mode',
      colors: {
        primary: 'oklch(0.70 0 0)',
        accent: 'oklch(0.80 0 0)',
        background: 'oklch(0.10 0 0)',
        card: 'oklch(0.15 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.60 0 0)',
        border: 'oklch(0.25 0 0)',
        secondary: 'oklch(0.20 0 0)',
      },
    },
  ],
  defaultPresetId: 'light',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {},
}

const elegantTheme: ThemePackage = {
  id: 'elegant',
  name: 'Elegant',
  description: 'Refined serif typography with warm gold accents on dark canvas',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Playfair Display', serif",
    body: "'Lora', serif",
    mono: "'Source Code Pro', monospace",
  },
  effects: {},
  borderRadius: 0.25,
  animationsEnabled: false,
  colorPresets: [
    {
      id: 'gold',
      name: 'Gold',
      description: 'Warm gold on dark canvas',
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
    },
    {
      id: 'silver',
      name: 'Silver',
      description: 'Cool silver tones',
      colors: {
        primary: 'oklch(0.65 0.02 220)',
        accent: 'oklch(0.75 0.03 220)',
        background: 'oklch(0.07 0 0)',
        card: 'oklch(0.11 0 0)',
        foreground: 'oklch(0.95 0.01 220)',
        mutedForeground: 'oklch(0.60 0.01 220)',
        border: 'oklch(0.20 0.01 220)',
        secondary: 'oklch(0.14 0 0)',
      },
    },
    {
      id: 'rose',
      name: 'Rose',
      description: 'Delicate rose tones',
      colors: {
        primary: 'oklch(0.65 0.12 0)',
        accent: 'oklch(0.75 0.13 5)',
        background: 'oklch(0.07 0.01 0)',
        card: 'oklch(0.11 0.01 0)',
        foreground: 'oklch(0.95 0.01 0)',
        mutedForeground: 'oklch(0.60 0.03 0)',
        border: 'oklch(0.20 0.03 0)',
        secondary: 'oklch(0.14 0.01 0)',
      },
    },
  ],
  defaultPresetId: 'gold',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {},
}

const neonTheme: ThemePackage = {
  id: 'neon',
  name: 'Neon',
  description: 'High-contrast electric blue and cyan on deep black – synthwave',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'cyberpunk',
    navigationStyle: 'cyberpunk-hud',
  },
  typography: {
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
  effects: {},
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'blue',
      name: 'Blue',
      description: 'Electric blue',
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
    },
    {
      id: 'pink',
      name: 'Pink',
      description: 'Synthwave pink',
      colors: {
        primary: 'oklch(0.65 0.25 340)',
        accent: 'oklch(0.75 0.22 330)',
        background: 'oklch(0.02 0.01 290)',
        card: 'oklch(0.07 0.02 290)',
        foreground: 'oklch(0.97 0.01 340)',
        mutedForeground: 'oklch(0.55 0.06 340)',
        border: 'oklch(0.18 0.05 340)',
        secondary: 'oklch(0.10 0.03 290)',
      },
    },
    {
      id: 'purple',
      name: 'Purple',
      description: 'Deep purple synthwave',
      colors: {
        primary: 'oklch(0.60 0.25 290)',
        accent: 'oklch(0.70 0.22 280)',
        background: 'oklch(0.02 0.01 280)',
        card: 'oklch(0.07 0.02 280)',
        foreground: 'oklch(0.97 0.01 280)',
        mutedForeground: 'oklch(0.55 0.06 280)',
        border: 'oklch(0.18 0.05 280)',
        secondary: 'oklch(0.10 0.03 280)',
      },
    },
  ],
  defaultPresetId: 'blue',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {},
}

const retroTheme: ThemePackage = {
  id: 'retro',
  name: 'Retro',
  description: 'Warm amber phosphor-glow on near-black – vintage terminal look',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'minimal',
  },
  typography: {
    heading: "'VT323', monospace",
    body: "'Share Tech Mono', monospace",
    mono: "'Share Tech Mono', monospace",
  },
  effects: {},
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'amber',
      name: 'Amber',
      description: 'Classic amber phosphor',
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
    },
    {
      id: 'green',
      name: 'Green',
      description: 'Classic green phosphor',
      colors: {
        primary: 'oklch(0.65 0.18 145)',
        accent: 'oklch(0.75 0.20 150)',
        background: 'oklch(0.05 0.01 145)',
        card: 'oklch(0.09 0.02 145)',
        foreground: 'oklch(0.88 0.08 145)',
        mutedForeground: 'oklch(0.55 0.06 145)',
        border: 'oklch(0.18 0.05 145)',
        secondary: 'oklch(0.12 0.02 145)',
      },
    },
    {
      id: 'white',
      name: 'White',
      description: 'Classic white phosphor',
      colors: {
        primary: 'oklch(0.80 0 0)',
        accent: 'oklch(0.90 0 0)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.88 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.18 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
  ],
  defaultPresetId: 'amber',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {},
}

const zardonicIndustrialTheme: ThemePackage = {
  id: 'zardonic-industrial',
  name: 'Zardonic Industrial',
  description: 'Heavy industrial aesthetic – CRT distortion, glitch effects, and aggressive red/orange tones',
  author: 'Zardonic / Neuroklast',
  version: '1.0.0',
  access: 'exclusive',
  exclusiveFor: 'zardonic',
  requiresActivation: true,
  lockedMessage: 'Exklusiv für ZARDONIC',
  layout: {
    heroVariant: 'glitch-parallax',
    loadingScreen: '3d-model',
    navigationStyle: 'cyberpunk-hud',
  },
  typography: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  effects: {
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
    },
  },
  borderRadius: 0.125,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'default-crimson',
      name: 'Default Crimson',
      description: 'Signature Zardonic crimson',
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
    },
    {
      id: 'cyber-blue',
      name: 'Cyber Blue',
      description: 'Electric cyber blue',
      colors: {
        primary: 'oklch(0.55 0.22 220)',
        accent: 'oklch(0.65 0.20 210)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 220)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 220)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'toxic-green',
      name: 'Toxic Green',
      description: 'Toxic neon green',
      colors: {
        primary: 'oklch(0.60 0.22 145)',
        accent: 'oklch(0.70 0.20 150)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 145)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 145)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'violet-chrome',
      name: 'Violet Chrome',
      description: 'Deep violet with chrome sheen',
      colors: {
        primary: 'oklch(0.55 0.22 290)',
        accent: 'oklch(0.65 0.20 300)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0.01 290)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 290)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'gold-circuit',
      name: 'Gold Circuit',
      description: 'Circuit board gold',
      colors: {
        primary: 'oklch(0.72 0.15 85)',
        accent: 'oklch(0.80 0.14 90)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0.02 85)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'crimson-punk',
      name: 'Crimson Punk',
      description: 'Aggressive crimson punk',
      colors: {
        primary: 'oklch(0.45 0.25 10)',
        accent: 'oklch(0.55 0.26 15)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0 0)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
  ],
  defaultPresetId: 'default-crimson',
  customizability: { customColors: true, customFonts: false, adjustEffects: true },
  slots: {},
}

const neuroklastClassicTheme: ThemePackage = {
  id: 'neuroklast-classic',
  name: 'Neuroklast Classic',
  description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'preview-only',
  exclusiveFor: 'neuroklast',
  lockedMessage: 'Exklusiv für NEUROKLAST',
  layout: {
    heroVariant: 'chromatic-hover',
    loadingScreen: 'code-rain',
    navigationStyle: 'cyberpunk-hud',
  },
  typography: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  effects: {
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
    },
  },
  borderRadius: 0.125,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'crimson',
      name: 'Crimson',
      description: 'Neuroklast signature crimson',
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
    },
  ],
  defaultPresetId: 'crimson',
  customizability: { customColors: false, customFonts: false, adjustEffects: false },
  slots: {},
}

// ─── Register all built-in themes ─────────────────────────────────────────────

registerTheme(cyberpunkTheme)
registerTheme(minimalTheme)
registerTheme(elegantTheme)
registerTheme(neonTheme)
registerTheme(retroTheme)
registerTheme(zardonicIndustrialTheme)
registerTheme(neuroklastClassicTheme)

// ─── Exports ──────────────────────────────────────────────────────────────────

export { cyberpunkTheme, minimalTheme, elegantTheme, neonTheme, retroTheme, zardonicIndustrialTheme, neuroklastClassicTheme }
