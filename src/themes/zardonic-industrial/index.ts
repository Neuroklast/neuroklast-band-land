import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import Footer from './Footer'
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
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
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
  },
}

export type ZardonicIndustrialTheme = typeof zardonicIndustrialTheme
