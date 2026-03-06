import Hero from './Hero'
import Navigation from './Navigation'
import Card from './Card'
import BackgroundEffects from './BackgroundEffects'
import SectionDivider from './SectionDivider'
import LoadingScreen from './LoadingScreen'
import './styles.css'

export const signalStaticTheme = {
  id: 'signal-static',
  name: 'Signal Static',
  colors: {
    primary: 'oklch(0.95 0 0)',
    accent: 'oklch(0.7 0 0)',
    background: 'oklch(0.08 0 0)',
    foreground: 'oklch(0.95 0 0)',
    card: 'oklch(0.12 0 0)',
    muted: 'oklch(0.15 0 0)',
    'muted-foreground': 'oklch(0.6 0 0)',
    border: 'oklch(0.25 0 0)'
  },
  slots: {
    Hero,
    Navigation,
    Card,
    BackgroundEffects,
    SectionDivider,
    LoadingScreen
  }
}
