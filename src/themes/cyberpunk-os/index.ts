import { ThemePackage } from '@/lib/types';
import { CyberpunkHero } from './Hero';
import { CyberpunkNavigation } from './Navigation';
import { CyberpunkCard } from './Card';
import { CyberpunkSectionDivider } from './SectionDivider';
import { CyberpunkBackgroundEffects } from './BackgroundEffects';
import { CyberpunkOverlayModal } from './OverlayModal';
import { CyberpunkLoadingScreen } from './LoadingScreen';
import { CyberpunkFooter } from './Footer';
import { CyberpunkOverlayTransition } from './OverlayTransition';
import { netrunnerGreenPreset } from '@/lib/design-presets';
import './styles.css';

export const cyberpunkOsTheme: ThemePackage = {
  id: 'cyberpunk-os',
  name: 'Cyberpunk OS',
  description: 'A clean, dark, terminal-style OS interface with subtle glitches.',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',
  layout: {
    heroVariant: 'minimal',
    loadingScreen: 'minimal',
    navigationStyle: 'minimal'
  },
  typography: {
    heading: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    body: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  effects: {
    overlayEffects: {
      scanlines: { enabled: true, intensity: 0.1 },
      noise: { enabled: true, intensity: 0.2 },
    },
  },
  borderRadius: 0,
  animationsEnabled: true,
  colorPresets: [
    {
      id: 'netrunner-green',
      name: 'Netrunner Green',
      description: 'Classic OS terminal green with dark background',
      colors: netrunnerGreenPreset.colors
    }
  ],
  defaultPresetId: 'netrunner-green',
  gridLayout: {
    columns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  customizability: {
    customColors: true,
    customFonts: true,
    adjustEffects: true
  },
  slots: {
    Hero: CyberpunkHero as any,
    Navigation: CyberpunkNavigation as any,
    Card: CyberpunkCard as any,
    SectionDivider: CyberpunkSectionDivider as any,
    BackgroundEffects: CyberpunkBackgroundEffects as any,
    OverlayModal: CyberpunkOverlayModal as any,
    LoadingScreen: CyberpunkLoadingScreen as any,
    Footer: CyberpunkFooter as any,
    OverlayTransition: CyberpunkOverlayTransition as any
  }
};
