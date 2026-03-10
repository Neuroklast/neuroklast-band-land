import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import GigsSection from './GigsSection'
import ReleasesSection from './ReleasesSection'
import BiographySection from './BiographySection'
import Footer from './Footer'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const minimalDarkTheme: ThemePackage = {
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
  colorPresets: [],
  defaultPresetId: 'default',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  id: 'minimal-dark',
  name: 'Minimal Dark',
  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen,
    GigsSection,
    ReleasesSection,
    BiographySection,
    Footer
  }
}
