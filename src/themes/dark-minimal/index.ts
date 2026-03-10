/**
 * Dark Minimal Theme
 *
 * A clean, simple dark theme with light text.
 * This is the default free theme for all band sites — the public starting point
 * before choosing a more characterful theme.
 *
 * Design principles:
 *  - Dark background (near-black), white/off-white foreground
 *  - No complex effects, no animations by default
 *  - Fully customisable colors, fonts, and effects via the theme customiser
 *  - Uses only default slots — no custom slot overrides needed for a clean result
 *
 * Because this theme deliberately uses all default slots, it intentionally
 * has an empty slots object. The theme-validator warning about missing
 * recommended slots is expected and valid for this special-purpose theme.
 */

import type { ThemePackage } from '@/lib/types'

export const darkMinimalTheme: ThemePackage = {
  id: 'dark-minimal',
  name: 'Dark Minimal',
  description: 'A clean, simple dark theme with white text. The default starting point for any band site.',
  author: 'Neuroklast',
  version: '1.0.0',
  access: 'free',

  layout: {
    heroVariant: 'default',
    loadingScreen: 'minimal',
    navigationStyle: 'clean',
  },

  typography: {
    heading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Fira Code', 'Consolas', 'Courier New', monospace",
  },

  borderRadius: 0.25,
  animationsEnabled: false,
  effects: {},

  colorPresets: [
    {
      id: 'dark-default',
      name: 'Dark Default',
      description: 'Near-black background with white text and a subtle blue-grey accent',
      colors: {
        primary:         'oklch(0.80 0.06 240)',
        accent:          'oklch(0.70 0.10 240)',
        background:      'oklch(0.08 0 0)',
        card:            'oklch(0.12 0 0)',
        foreground:      'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border:          'oklch(0.22 0 0)',
        secondary:       'oklch(0.14 0 0)',
      },
    },
    {
      id: 'dark-warm',
      name: 'Dark Warm',
      description: 'Dark background with warm amber accent',
      colors: {
        primary:         'oklch(0.78 0.12 60)',
        accent:          'oklch(0.70 0.15 55)',
        background:      'oklch(0.08 0.01 60)',
        card:            'oklch(0.12 0.01 60)',
        foreground:      'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border:          'oklch(0.22 0.01 60)',
        secondary:       'oklch(0.14 0.01 60)',
      },
    },
    {
      id: 'dark-red',
      name: 'Dark Red',
      description: 'Dark background with vivid red accent',
      colors: {
        primary:         'oklch(0.60 0.20 25)',
        accent:          'oklch(0.65 0.22 25)',
        background:      'oklch(0.07 0 0)',
        card:            'oklch(0.11 0 0)',
        foreground:      'oklch(0.95 0 0)',
        mutedForeground: 'oklch(0.55 0 0)',
        border:          'oklch(0.20 0 0)',
        secondary:       'oklch(0.13 0 0)',
      },
    },
  ],

  defaultPresetId: 'dark-default',

  defaultColors: {
    primary:         'oklch(0.80 0.06 240)',
    accent:          'oklch(0.70 0.10 240)',
    background:      'oklch(0.08 0 0)',
    card:            'oklch(0.12 0 0)',
    foreground:      'oklch(0.95 0 0)',
    mutedForeground: 'oklch(0.55 0 0)',
    border:          'oklch(0.22 0 0)',
    secondary:       'oklch(0.14 0 0)',
  },

  defaultFonts: {
    heading: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
    mono:    "'Fira Code', 'Consolas', 'Courier New', monospace",
  },

  customizability: {
    customColors: true,
    customFonts:  true,
    adjustEffects: false,
  },

  // No slot overrides — this theme intentionally uses all defaults.
  // The default slots already provide a clean, functional dark UI.
  slots: {},
}
