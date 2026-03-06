import './styles.css'
import type { ThemePackage } from '@/lib/types'
import NeonBackgroundEffects from './BackgroundEffects'
import NeonCard from './Card'
import NeonSectionDivider from './SectionDivider'
import NeonHero from './Hero'
import NeonNavigation from './Navigation'
import NeonFooter from './Footer'
import NeonLoadingScreen from './LoadingScreen'

export const neonTheme: ThemePackage = {
  id: 'neon',
  name: 'Neon',
  description: 'High-contrast electric blue and cyan on deep black – synthwave',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'default',
    loadingScreen: 'cyberpunk',
    navigationStyle: 'cyberpunk-hud',
  },
  typography: {
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
    mono: "'Share Tech Mono', monospace",
  },
  effects: {},
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'blue',
      name: 'Blue',
      description: 'Electric blue',
      colors: {
        primary: 'oklch(0.65 0.25 220)',
        accent: 'oklch(0.75 0.22 190)',
        background: 'oklch(0.02 0.01 260)',
        card: 'oklch(0.07 0.02 260)',
        foreground: 'oklch(0.97 0.01 200)',
        mutedForeground: 'oklch(0.55 0.06 220)',
        border: 'oklch(0.18 0.05 230)',
        secondary: 'oklch(0.10 0.03 250)',
      },
    },
    {
      id: 'pink',
      name: 'Pink',
      description: 'Synthwave pink',
      colors: {
        primary: 'oklch(0.65 0.25 340)',
        accent: 'oklch(0.75 0.22 330)',
        background: 'oklch(0.02 0.01 290)',
        card: 'oklch(0.07 0.02 290)',
        foreground: 'oklch(0.97 0.01 340)',
        mutedForeground: 'oklch(0.55 0.06 340)',
        border: 'oklch(0.18 0.05 340)',
        secondary: 'oklch(0.10 0.03 290)',
      },
    },
    {
      id: 'purple',
      name: 'Purple',
      description: 'Deep purple synthwave',
      colors: {
        primary: 'oklch(0.60 0.25 290)',
        accent: 'oklch(0.70 0.22 280)',
        background: 'oklch(0.02 0.01 280)',
        card: 'oklch(0.07 0.02 280)',
        foreground: 'oklch(0.97 0.01 280)',
        mutedForeground: 'oklch(0.55 0.06 280)',
        border: 'oklch(0.18 0.05 280)',
        secondary: 'oklch(0.10 0.03 280)',
      },
    },
  ],
  defaultPresetId: 'blue',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  slots: {
    BackgroundEffects: NeonBackgroundEffects,
    Card: NeonCard,
    SectionDivider: NeonSectionDivider,
    Hero: NeonHero,
    Navigation: NeonNavigation,
    Footer: NeonFooter,
    LoadingScreen: NeonLoadingScreen,
  },
}
