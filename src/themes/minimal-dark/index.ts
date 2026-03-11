import Hero from './Hero'
import Navigation from './Navigation'
import BackgroundEffects from './BackgroundEffects'
import LoadingScreen from './LoadingScreen'
import GigsSection from './GigsSection'
import BiographySection from './BiographySection'
import Footer from './Footer'
import SectionDivider from './SectionDivider'
import Card from './Card'
import ReleasesSection from './ReleasesSection'
import './styles.css'
import type { ThemePackage } from '@/lib/types'

export const minimalDarkThemeSlots = {
  Hero,
  Navigation,
  BackgroundEffects,
  LoadingScreen,
  GigsSection,
  BiographySection,
  ReleasesSection,
  Footer,
  SectionDivider,
  Card,
}

export const minimalDarkTheme: ThemePackage = {
  id: 'minimal-dark',
  name: 'Minimal Dark',
  description: 'A clean, minimal dark theme',
  author: 'System',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'minimal',
    loadingScreen: 'minimal',
    navigationStyle: 'minimal'
  },
  typography: {
    heading: 'inter',
    body: 'inter',
    mono: 'mono'
  },
  effects: {
    overlayEffects: {},
    animationSettings: {}
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'default',
      name: 'Default',
      description: 'Default minimal dark preset',
      colors: {
        primary: '#ffffff',
        accent: '#888888',
        background: '#000000',
        card: '#111111',
        foreground: '#ffffff',
        mutedForeground: '#666666',
        border: '#222222',
        secondary: '#333333'
      }
    }
  ],
  defaultPresetId: 'default',
  customizability: {
    customColors: true,
    customFonts: true,
    adjustEffects: true
  },
  slots: minimalDarkThemeSlots
}
