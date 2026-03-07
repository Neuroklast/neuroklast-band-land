import './styles.css'
import type { ThemePackage } from '@/lib/types'
import Hero from './Hero'
import Navigation from './Navigation'
import SignalStaticBackgroundEffects from './BackgroundEffects'
import SignalStaticLoadingScreen from './LoadingScreen'

export const signalStaticTheme: ThemePackage = {
  id: 'signal-static',
  name: 'Signal Static',
  description: 'Broadcast interference aesthetic – analog noise, signal artifacts, and transmission distortion',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'premium',
  layout: {
    heroVariant: 'default',
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
      scanlines: { enabled: true, intensity: 0.4 },
      crt: { enabled: true, intensity: 0.3 },
      noise: { enabled: true, intensity: 0.6 },
      vignette: { enabled: true, intensity: 0.5 },
      chromatic: { enabled: true, intensity: 0.25 },
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
      crtVignetteOpacity: 0,
      overlayTransitionEnabled: false,
    },
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'signal-mono',
      name: 'Signal Mono',
      description: 'Monochrome transmission – white noise on deep black',
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
      id: 'signal-amber',
      name: 'Signal Amber',
      description: 'Warm amber carrier wave on dark background',
      colors: {
        primary: 'oklch(0.80 0.14 65)',
        accent: 'oklch(0.70 0.16 60)',
        background: 'oklch(0.07 0.01 55)',
        card: 'oklch(0.11 0.02 57)',
        foreground: 'oklch(0.90 0.06 68)',
        mutedForeground: 'oklch(0.55 0.07 62)',
        border: 'oklch(0.22 0.05 60)',
        secondary: 'oklch(0.13 0.02 57)',
      },
    },
    {
      id: 'signal-cyan',
      name: 'Signal Cyan',
      description: 'Electric cyan broadcast frequency on near-black',
      colors: {
        primary: 'oklch(0.80 0.14 195)',
        accent: 'oklch(0.70 0.16 195)',
        background: 'oklch(0.07 0.01 210)',
        card: 'oklch(0.11 0.02 210)',
        foreground: 'oklch(0.92 0.04 200)',
        mutedForeground: 'oklch(0.57 0.07 200)',
        border: 'oklch(0.22 0.06 205)',
        secondary: 'oklch(0.13 0.02 208)',
      },
    },
  ],
  defaultPresetId: 'signal-mono',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {
    Hero,
    Navigation,
    BackgroundEffects: SignalStaticBackgroundEffects,
    LoadingScreen: SignalStaticLoadingScreen,
  },
}
