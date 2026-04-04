import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import './styles.css'

import type { ThemePackage } from '@/lib/types'

export const neonSynthwaveTheme: ThemePackage = {
  id: 'neon-synthwave',
  name: 'Neon Synthwave',
  description: 'A vibrant retro 80s aesthetic with neon glows and synthwave grids',
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
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  borderRadius: 0.5,
  animationsEnabled: true,
  effects: {},
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '2rem',
  },
  colorPresets: [
    {
      id: 'synthwave-outrun',
      name: 'Outrun',
      description: 'Classic pink and cyan synthwave',
      colors: {
        primary: 'oklch(0.65 0.3 330)', // Hot Pink
        accent: 'oklch(0.7 0.15 200)',  // Cyan
        background: 'oklch(0.1 0.05 280)', // Dark Purple
        card: 'oklch(0.15 0.05 280)',
        foreground: 'oklch(0.95 0.02 280)',
        mutedForeground: 'oklch(0.6 0.05 280)',
        border: 'oklch(0.3 0.1 330)',
        secondary: 'oklch(0.4 0.2 200)', // Darker Cyan for grid
      },
    },
    {
      id: 'synthwave-miami',
      name: 'Miami Vice',
      description: 'Pastel neon vibes',
      colors: {
        primary: 'oklch(0.75 0.15 190)', // Miami Teal
        accent: 'oklch(0.8 0.15 340)',   // Pastel Pink
        background: 'oklch(0.95 0.02 200)', // Off-white
        card: 'oklch(1 0 0)',
        foreground: 'oklch(0.2 0.05 200)', // Dark Teal
        mutedForeground: 'oklch(0.5 0.05 200)',
        border: 'oklch(0.8 0.1 190)',
        secondary: 'oklch(0.85 0.1 340)',
      },
    },
    {
      id: 'synthwave-hacker',
      name: 'Neon Hacker',
      description: 'Dark mode with bright green',
      colors: {
        primary: 'oklch(0.7 0.25 140)', // Neon Green
        accent: 'oklch(0.6 0.2 140)',
        background: 'oklch(0.05 0 0)',
        card: 'oklch(0.1 0 0)',
        foreground: 'oklch(0.9 0.05 140)',
        mutedForeground: 'oklch(0.5 0.05 140)',
        border: 'oklch(0.2 0.1 140)',
        secondary: 'oklch(0.15 0.1 140)',
      },
    }
  ],
  defaultPresetId: 'synthwave-outrun',
  customizability: { customColors: true, customFonts: true, adjustEffects: true },
  defaultModalAnimation: 'systemBoot',
  supportedModalAnimations: ['circuitBreak', 'systemBoot', 'dataStream', 'ringLink', 'random'],
  defaultColors: {
    primary: 'oklch(0.65 0.3 330)',
    accent: 'oklch(0.7 0.15 200)',
    background: 'oklch(0.1 0.05 280)',
    card: 'oklch(0.15 0.05 280)',
    foreground: 'oklch(0.95 0.02 280)',
    mutedForeground: 'oklch(0.6 0.05 280)',
    border: 'oklch(0.3 0.1 330)',
    secondary: 'oklch(0.4 0.2 200)',
  },
  defaultFonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  slots: {
    Hero,
    Navigation,
    Card,
    SectionDivider,
    LoadingScreen,
  },
}
