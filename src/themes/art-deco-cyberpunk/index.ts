import './styles.css'
import type { ThemePackage } from '@/lib/types'
import ArtDecoCyberpunkBackgroundEffects from './BackgroundEffects'
import ArtDecoCyberpunkHero from './Hero'
import ArtDecoCyberpunkNavigation from './Navigation'
import ArtDecoCyberpunkFooter from './Footer'
import ArtDecoCyberpunkLoadingScreen from './LoadingScreen'

export const artDecoCyberpunkTheme: ThemePackage = {
  id: 'art-deco-cyberpunk',
  name: 'Art Deco Cyberpunk',
  description: '1920s Art Deco meets future tech – geometric gold leaf patterns on black, angular symmetry',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'premium',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Orbitron', sans-serif",
    body: "'Raleway', sans-serif",
    mono: "'Courier Prime', monospace",
  },
  effects: {
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
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'gold-lila',
      name: 'Gold-Lila',
      description: 'Gold & purple neon on black – opulent Art Deco futurism',
      colors: {
        primary: 'oklch(0.75 0.12 85)',
        accent: 'oklch(0.65 0.20 310)',
        background: 'oklch(0.02 0 0)',
        card: 'oklch(0.06 0.02 300)',
        foreground: 'oklch(0.95 0.03 80)',
        mutedForeground: 'oklch(0.60 0.05 80)',
        border: 'oklch(0.30 0.10 310)',
        secondary: 'oklch(0.12 0.04 300)',
      },
    },
    {
      id: 'emerald-neon',
      name: 'Emerald-Neon',
      description: 'Emerald green with neon highlights on anthracite',
      colors: {
        primary: 'oklch(0.60 0.18 155)',
        accent: 'oklch(0.75 0.20 155)',
        background: 'oklch(0.03 0.01 150)',
        card: 'oklch(0.07 0.02 150)',
        foreground: 'oklch(0.92 0.03 140)',
        mutedForeground: 'oklch(0.55 0.06 145)',
        border: 'oklch(0.22 0.08 155)',
        secondary: 'oklch(0.10 0.03 148)',
      },
    },
    {
      id: 'chrome-onyx',
      name: 'Classic Chrome/Onyx',
      description: 'Cool chrome silver on deep onyx black',
      colors: {
        primary: 'oklch(0.80 0.01 240)',
        accent: 'oklch(0.88 0.01 240)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.10 0.01 240)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.60 0.01 240)',
        border: 'oklch(0.28 0.02 240)',
        secondary: 'oklch(0.14 0.01 240)',
      },
    },
  ],
  defaultPresetId: 'gold-lila',
  defaultColors: {
    primary: 'oklch(0.75 0.12 85)',
    accent: 'oklch(0.65 0.20 310)',
    background: 'oklch(0.02 0 0)',
    card: 'oklch(0.06 0.02 300)',
    foreground: 'oklch(0.95 0.03 80)',
    mutedForeground: 'oklch(0.60 0.05 80)',
    border: 'oklch(0.30 0.10 310)',
    secondary: 'oklch(0.12 0.04 300)',
  },
  defaultFonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Raleway', sans-serif",
    mono: "'Courier Prime', monospace",
  },
  animations: [
    { id: 'noise', label: 'Subtle Noise', defaultEnabled: true, defaultIntensity: 0.05 },
    { id: 'vignette', label: 'Vignette', defaultEnabled: true, defaultIntensity: 0.5 },
    { id: 'dotMatrix', label: 'Dot Matrix', defaultEnabled: true, defaultIntensity: 0.15 },
    { id: 'overlayTransition', label: 'Overlay Transition', defaultEnabled: true },
  ],
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {
    BackgroundEffects: ArtDecoCyberpunkBackgroundEffects,
    Hero: ArtDecoCyberpunkHero,
    Navigation: ArtDecoCyberpunkNavigation,
    Footer: ArtDecoCyberpunkFooter,
    LoadingScreen: ArtDecoCyberpunkLoadingScreen,
  },
}
