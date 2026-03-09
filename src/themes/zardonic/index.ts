import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const zardonicTheme: ThemePackage = {
  description: 'Zardonic industrial dark cyberpunk theme',
  version: '1.0.0',
  author: 'Neuroklast',
  access: 'free',
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
  id: 'zardonic-theme',
  name: 'Zardonic Cyberpunk Theme',


  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen,
  }
}

export type ZardonicTheme = typeof zardonicTheme
