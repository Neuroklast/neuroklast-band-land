import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import Footer from './Footer'
import OverlayModal from './OverlayModal'
import OverlayTransition from './OverlayTransition'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const umbrellaCorpTheme: ThemePackage = {
  id: 'umbrella-corp',
  name: 'Umbrella Corp',
  description: 'Cyberpunk biohazard military theme with tactical grid aesthetics',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'premium',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Rajdhani', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  colorPresets: [
    {
      id: 'umbrella-biohazard',
      name: 'Biohazard',
      description: 'Biohazard green default',
      colors: {
        primary: 'oklch(0.70 0.20 145)',
        accent: 'oklch(0.60 0.18 145)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.18 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
    {
      id: 'umbrella-red-alert',
      name: 'Red Alert',
      description: 'Danger red alert',
      colors: {
        primary: 'oklch(0.55 0.25 25)',
        accent: 'oklch(0.45 0.20 25)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.18 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
    {
      id: 'umbrella-white-ops',
      name: 'White Ops',
      description: 'Clinical white operations',
      colors: {
        primary: 'oklch(0.90 0 0)',
        accent: 'oklch(0.75 0 0)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.25 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
    {
      id: 'umbrella-toxic-yellow',
      name: 'Toxic Yellow',
      description: 'Hazmat yellow hazard',
      colors: {
        primary: 'oklch(0.85 0.18 100)',
        accent: 'oklch(0.75 0.15 100)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.25 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
    {
      id: 'umbrella-deep-water',
      name: 'Deep Water',
      description: 'Submerged research facility',
      colors: {
        primary: 'oklch(0.65 0.20 250)',
        accent: 'oklch(0.55 0.18 250)',
        background: 'oklch(0.05 0.02 250)',
        card: 'oklch(0.09 0.02 250)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0.02 250)',
        border: 'oklch(0.18 0.05 250)',
        secondary: 'oklch(0.12 0.05 250)',
      },
    },
  ],
  defaultPresetId: 'umbrella-biohazard',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  defaultModalAnimation: 'systemBoot',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'glitchScan', 'dataStream', 'neuralJackIn', 'hologramMaterialize', 'matrixDecode', 'ringLink', 'none', 'random'],
  defaultColors: {
    primary: 'oklch(0.70 0.20 145)',
    accent: 'oklch(0.60 0.18 145)',
    background: 'oklch(0.05 0 0)',
    card: 'oklch(0.09 0 0)',
    foreground: 'oklch(0.95 0 0)',
    mutedForeground: 'oklch(0.50 0 0)',
    border: 'oklch(0.18 0 0)',
    secondary: 'oklch(0.12 0 0)',
  },
  defaultFonts: {
    heading: "'Rajdhani', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen,
    Footer,
    OverlayModal,
    OverlayTransition,
  },
}

export type UmbrellaCorpTheme = typeof umbrellaCorpTheme
