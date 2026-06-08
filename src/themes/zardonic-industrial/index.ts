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

export const zardonicIndustrialTheme: ThemePackage = {
  id: 'zardonic-industrial',
  name: 'Zardonic Industrial',
  description: 'Zardonic industrial dark cyberpunk theme — premium edition',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'premium',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },
  typography: {
    heading: "'Orbitron', sans-serif",
    body: "'Share Tech Mono', monospace",
    mono: "'Share Tech Mono', monospace",
  },
  borderRadius: 0,
  animationsEnabled: true,
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  colorPresets: [
    {
      id: 'zardonic-ember',
      name: 'Ember',
      description: 'Industrial orange/red default',
      colors: {
        primary: 'oklch(0.65 0.25 30)',
        accent: 'oklch(0.55 0.20 200)',
        background: 'oklch(0.05 0.01 250)',
        card: 'oklch(0.09 0.01 250)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.18 0.02 250)',
        secondary: 'oklch(0.12 0.01 250)',
      },
    },
    {
      id: 'zardonic-steel-blue',
      name: 'Steel Blue',
      description: 'Cold industrial steel blue',
      colors: {
        primary: 'oklch(0.60 0.18 220)',
        accent: 'oklch(0.50 0.15 220)',
        background: 'oklch(0.05 0.01 220)',
        card: 'oklch(0.09 0.01 220)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.18 0.03 220)',
        secondary: 'oklch(0.12 0.01 220)',
      },
    },
    {
      id: 'zardonic-toxic',
      name: 'Toxic',
      description: 'Toxic industrial green',
      colors: {
        primary: 'oklch(0.65 0.22 142)',
        accent: 'oklch(0.55 0.18 142)',
        background: 'oklch(0.05 0.01 250)',
        card: 'oklch(0.09 0.01 250)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.50 0 0)',
        border: 'oklch(0.18 0.02 250)',
        secondary: 'oklch(0.12 0.01 250)',
      },
    },
    {
      id: 'zardonic-steel-blue',
      name: 'Steel Blue',
      description: 'Cold steel industrial',
      colors: {
        primary: 'oklch(0.60 0.15 260)',
        accent: 'oklch(0.50 0.15 260)',
        background: 'oklch(0.05 0.01 260)',
        card: 'oklch(0.09 0.01 260)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.18 0.01 260)',
        secondary: 'oklch(0.12 0.01 260)',
      },
    },
    {
      id: 'zardonic-radioactive',
      name: 'Radioactive',
      description: 'Industrial radioactive green',
      colors: {
        primary: 'oklch(0.70 0.20 140)',
        accent: 'oklch(0.60 0.20 140)',
        background: 'oklch(0.05 0.01 140)',
        card: 'oklch(0.09 0.01 140)',
        foreground: 'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border: 'oklch(0.18 0.01 140)',
        secondary: 'oklch(0.12 0.01 140)',
      },
    },
  ],
  defaultPresetId: 'zardonic-ember',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  defaultModalAnimation: 'circuitBreak',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'glitchScan', 'dataStream', 'hologramMaterialize', 'matrixDecode', 'ringLink', 'random'],
  defaultColors: {
    primary: 'oklch(0.65 0.25 30)',
    accent: 'oklch(0.55 0.20 200)',
    background: 'oklch(0.05 0.01 250)',
    card: 'oklch(0.09 0.01 250)',
    foreground: 'oklch(0.95 0 0)',
    mutedForeground: 'oklch(0.50 0 0)',
    border: 'oklch(0.18 0.02 250)',
    secondary: 'oklch(0.12 0.01 250)',
  },
  defaultFonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Share Tech Mono', monospace",
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

export type ZardonicIndustrialTheme = typeof zardonicIndustrialTheme
