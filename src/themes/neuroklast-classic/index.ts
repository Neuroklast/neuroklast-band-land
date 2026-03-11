import './styles.css'
import type { ThemePackage } from '@/lib/types'
import NeuroklastClassicBackgroundEffects from './BackgroundEffects'
import NeuroklastClassicLoadingScreen from './LoadingScreen'
import NeuroklastClassicHero from './Hero'
import NeuroklastClassicNavigation from './Navigation'
import NeuroklastClassicFooter from './Footer'

export const neuroklastClassicTheme: ThemePackage = {
  id: 'neuroklast-classic',
  name: 'Neuroklast Classic',
  description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'exclusive',
  exclusiveFor: 'neuroklast',
  lockedMessage: 'Exclusive to NEUROKLAST',
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
      overlayTransitionEnabled: false,
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
    {
      id: 'neuroklast-cobalt',
      name: 'Cobalt',
      description: 'Blue/cyberpunk variant',
      colors: {
        primary: 'oklch(0.55 0.20 240)',
        accent: 'oklch(0.65 0.22 240)',
        background: 'oklch(0 0 0)',
        card: 'oklch(0.05 0 0)',
        foreground: 'oklch(1 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.15 0 0)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'neuroklast-void',
      name: 'Void',
      description: 'Deep purple variant',
      colors: {
        primary: 'oklch(0.45 0.15 300)',
        accent: 'oklch(0.55 0.18 300)',
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
  defaultColors: {
    primary: 'oklch(0.50 0.22 25)',
    accent: 'oklch(0.60 0.24 25)',
    background: 'oklch(0 0 0)',
    card: 'oklch(0.05 0 0)',
    foreground: 'oklch(1 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    border: 'oklch(0.15 0 0)',
    secondary: 'oklch(0.10 0 0)',
  },
  defaultFonts: {
    heading: "'JetBrains Mono', monospace",
    body: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  animations: [
    { id: 'glitch', label: 'Glitch Effect', defaultEnabled: true, defaultIntensity: 0.7 },
    { id: 'scanlines', label: 'CRT Scanlines', defaultEnabled: true, defaultIntensity: 0.3 , hasIntensity: true },
    { id: 'crt', label: 'CRT Curvature', defaultEnabled: true, defaultIntensity: 0.4 , hasIntensity: true },
    { id: 'noise', label: 'Static Noise', defaultEnabled: true, defaultIntensity: 0.15 , hasIntensity: true },
    { id: 'vignette', label: 'Vignette', defaultEnabled: true, defaultIntensity: 0.5 , hasIntensity: true },
    { id: 'chromatic', label: 'Chromatic Aberration', defaultEnabled: false },
    { id: 'particles', label: 'Background Particles', defaultEnabled: true },
  ],
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  defaultModalAnimation: 'neuralJackIn',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'glitchScan', 'dataStream', 'neuralJackIn', 'hologramMaterialize', 'matrixDecode', 'ringLink', 'random'],
  slots: {
    BackgroundEffects: NeuroklastClassicBackgroundEffects,
    LoadingScreen: NeuroklastClassicLoadingScreen,
    Hero: NeuroklastClassicHero,
    Navigation: NeuroklastClassicNavigation,
    Footer: NeuroklastClassicFooter,
  },
}
