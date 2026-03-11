import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import Footer from './Footer'
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
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
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
  },
}

export type UmbrellaCorpTheme = typeof umbrellaCorpTheme
