import './styles.css'
import type { ThemePackage } from '@/lib/types'
import Hero from './Hero'
import Navigation from './Navigation'
import GlitchNoirBackgroundEffects from './BackgroundEffects'
import GlitchNoirSectionDivider from './SectionDivider'
import GlitchNoirLoadingScreen from './LoadingScreen'

export const glitchNoirTheme: ThemePackage = {
  id: 'glitch-noir',
  name: 'Glitch Noir',
  description: 'High-contrast monochrome with glitch distortion – dark neo-noir aesthetic',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'premium',
  layout: {
    heroVariant: 'glitch-parallax',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  effects: {
    overlayEffects: {
      scanlines: { enabled: true, intensity: 0.35 },
      crt: { enabled: false, intensity: 0 },
      noise: { enabled: true, intensity: 0.5 },
      vignette: { enabled: true, intensity: 0.6 },
      chromatic: { enabled: true, intensity: 0.3 },
      dotMatrix: { enabled: false, intensity: 0 },
    },
    animationSettings: {
      glitchEnabled: true,
      scanlineEnabled: true,
      chromaticEnabled: true,
      crtEnabled: false,
      noiseEnabled: true,
      circuitBackgroundEnabled: false,
      crtOverlayOpacity: 0,
      crtVignetteOpacity: 0,
      overlayTransitionEnabled: false,
    },
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'noir-default',
      name: 'Noir Default',
      description: 'Pure monochrome – near-black background with white text',
      colors: {
        primary: 'oklch(0.95 0 0)',
        accent: 'oklch(0.70 0 0)',
        background: 'oklch(0.08 0 0)',
        card: 'oklch(0.12 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.60 0 0)',
        border: 'oklch(0.25 0 0)',
        secondary: 'oklch(0.15 0 0)',
      },
    },
    {
      id: 'noir-cold',
      name: 'Noir Cold',
      description: 'Icy blue-grey tint on near-black',
      colors: {
        primary: 'oklch(0.92 0.02 220)',
        accent: 'oklch(0.72 0.04 215)',
        background: 'oklch(0.07 0.01 230)',
        card: 'oklch(0.11 0.01 228)',
        foreground: 'oklch(0.93 0.02 220)',
        mutedForeground: 'oklch(0.58 0.03 220)',
        border: 'oklch(0.22 0.03 225)',
        secondary: 'oklch(0.14 0.01 228)',
      },
    },
    {
      id: 'noir-green',
      name: 'Noir Green',
      description: 'Terminal-green on deep black – hacker aesthetic',
      colors: {
        primary: 'oklch(0.78 0.18 145)',
        accent: 'oklch(0.68 0.20 145)',
        background: 'oklch(0.07 0.01 150)',
        card: 'oklch(0.11 0.02 148)',
        foreground: 'oklch(0.88 0.10 145)',
        mutedForeground: 'oklch(0.55 0.08 145)',
        border: 'oklch(0.22 0.06 148)',
        secondary: 'oklch(0.13 0.02 148)',
      },
    },
  ],
  defaultPresetId: 'noir-default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {
    Hero,
    Navigation,
    BackgroundEffects: GlitchNoirBackgroundEffects,
    SectionDivider: GlitchNoirSectionDivider,
    LoadingScreen: GlitchNoirLoadingScreen,
  },
}
