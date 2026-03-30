import Hero from '../../components/themes/GlitchHeroContainer'
import Navigation from '../../components/themes/GlitchNavigationContainer'
import Card from '../../components/themes/GlitchCardContainer'
import BackgroundEffects from '../../components/themes/GlitchBackgroundContainer'
import SectionDivider from './SectionDivider'
import LoadingScreen from '../../components/themes/GlitchLoadingContainer'
import OverlayModal from './OverlayModal'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const glitchNoirTheme: ThemePackage = {
  description: 'A minimal dark techno theme',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Inter', serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '1.5rem',
  },
  colorPresets: [
    {
      id: 'glitch-noir-monochrome',
      name: 'Monochrome',
      description: 'Pure greyscale aesthetic',
      colors: {
        primary: 'oklch(0.85 0 0)',
        accent: 'oklch(0.70 0 0)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.08 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.20 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
    {
      id: 'glitch-noir-terminal-green',
      name: 'Terminal Green',
      description: 'Classic terminal green on black',
      colors: {
        primary: 'oklch(0.65 0.20 142)',
        accent: 'oklch(0.55 0.18 142)',
        background: 'oklch(0.04 0 0)',
        card: 'oklch(0.08 0 0)',
        foreground: 'oklch(0.90 0.05 142)',
        mutedForeground: 'oklch(0.50 0.05 142)',
        border: 'oklch(0.18 0.05 142)',
        secondary: 'oklch(0.10 0 0)',
      },
    },
    {
      id: 'glitch-noir-acid-yellow',
      name: 'Acid Yellow',
      description: 'High-contrast acid yellow',
      colors: {
        primary: 'oklch(0.80 0.22 95)',
        accent: 'oklch(0.70 0.20 95)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.08 0 0)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.20 0 0)',
        secondary: 'oklch(0.12 0 0)',
      },
    },
  ],
  defaultPresetId: 'glitch-noir-monochrome',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  id: 'glitch-noir',
  name: 'Glitch Noir',
  defaultModalAnimation: 'glitchScan',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'glitchScan', 'dataStream', 'neuralJackIn', 'hologramMaterialize', 'matrixDecode', 'ringLink', 'random'],
  // colors: {

  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen,
    OverlayModal,
  }
}
