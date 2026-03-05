/**
 * Theme Registry — manages available ThemePackage instances.
 *
 * Provides theme lookup, registration, and a React hook for resolving
 * slot components with fallbacks.
 */

import type { ThemePackage, ThemeSlots } from './types'
import {
  builtInThemes,
  cyberpunkTheme,
  minimalTheme,
  elegantTheme,
  neonTheme,
  retroTheme,
  zardonicIndustrialTheme,
  neuroklastClassicTheme,
  DefaultHero,
  DefaultNavigation,
  DefaultLoadingScreen,
  DefaultSectionDivider,
  DefaultCard,
  DefaultBackgroundEffects,
  DefaultFooter,
} from '@/themes'

// ─── Registry ────────────────────────────────────────────────────────────────

const _registry: Map<string, ThemePackage> = new Map()

/** Register a theme package in the registry */
export function registerTheme(theme: ThemePackage): void {
  _registry.set(theme.id, theme)
}

/** Get a theme by ID, or undefined if not found */
export function getTheme(id: string): ThemePackage | undefined {
  return _registry.get(id)
}

/** Get all registered themes */
export function getAllThemes(): ThemePackage[] {
  return Array.from(_registry.values())
}

/** Get the active theme based on a theme ID (falls back to cyberpunk) */
export function getActiveTheme(themeId?: string): ThemePackage {
  if (themeId) {
    const found = _registry.get(themeId)
    if (found) return found
  }
  const fallback = _registry.get('cyberpunk') ?? Array.from(_registry.values()).at(0)
  if (!fallback) throw new Error('Theme registry is empty — no themes have been registered')
  return fallback
}

// ─── useThemeSlots hook ───────────────────────────────────────────────────────

/**
 * Resolves a theme's slots with fallback stubs for any missing slot.
 * Returns a complete ThemeSlots object where every slot is guaranteed to
 * be a valid React component.
 */
export function useThemeSlots(themeId?: string): ThemeSlots {
  const theme = getActiveTheme(themeId)
  return resolveSlots(theme)
}

function resolveSlots(theme: ThemePackage): ThemeSlots {
  return {
    Hero: theme.slots.Hero ?? DefaultHero,
    Navigation: theme.slots.Navigation ?? DefaultNavigation,
    LoadingScreen: theme.slots.LoadingScreen ?? DefaultLoadingScreen,
    SectionDivider: theme.slots.SectionDivider ?? DefaultSectionDivider,
    Card: theme.slots.Card ?? DefaultCard,
    BackgroundEffects: theme.slots.BackgroundEffects ?? DefaultBackgroundEffects,
    Footer: theme.slots.Footer ?? DefaultFooter,
  }
}

// ─── Auto-register all built-in themes ────────────────────────────────────────

for (const theme of builtInThemes) {
  registerTheme(theme)
}

// ─── Re-export theme objects for backward compatibility ───────────────────────

export { cyberpunkTheme, minimalTheme, elegantTheme, neonTheme, retroTheme, zardonicIndustrialTheme, neuroklastClassicTheme }

// ─── ThemeDefinition-based registry (license-aware) ──────────────────────────

import type { ThemeDefinition, ThemeLicenseStatus } from './types'
import { DESIGN_PRESETS, presetToThemeSettings } from './design-presets'

/** Catalog of all built-in themes with license metadata */
export const THEME_CATALOG: ThemeDefinition[] = [
  {
    id: 'neuroklast-classic',
    name: 'Neuroklast Classic',
    description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['neuroklast-classic']),
    author: 'Neuroklast',
    tags: ['dark', 'cyber', 'industrial'],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Dark industrial aesthetic with crimson red neon accents',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['cyberpunk']),
    author: 'Neuroklast',
    tags: ['dark', 'neon', 'cyberpunk'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, light, content-first design with subtle accents',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['minimal']),
    author: 'Neuroklast',
    tags: ['light', 'clean', 'minimal'],
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined serif typography with warm gold accents on dark canvas',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['elegant']),
    author: 'Neuroklast',
    tags: ['dark', 'gold', 'serif'],
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'High-contrast electric blue and cyan on deep black – synthwave',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['neon']),
    author: 'Neuroklast',
    tags: ['dark', 'neon', 'synthwave'],
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Warm amber phosphor-glow on near-black – vintage terminal look',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['retro']),
    author: 'Neuroklast',
    tags: ['dark', 'amber', 'retro', 'terminal'],
  },
  {
    id: 'zardonic-industrial',
    name: 'Zardonic Industrial',
    description: 'Heavy industrial aesthetic – CRT distortion, glitch effects, aggressive red/orange tones',
    licenseStatus: 'free',
    theme: presetToThemeSettings(DESIGN_PRESETS['zardonic-industrial']),
    author: 'Zardonic',
    tags: ['dark', 'industrial', 'glitch', 'premium'],
  },
]

export interface ThemeCatalogRegistry {
  themes: ThemeDefinition[]
  getTheme(id: string): ThemeDefinition | undefined
  getLicenseStatus(id: string): ThemeLicenseStatus
  isUnlocked(id: string): boolean
}

/**
 * Create a license-aware ThemeCatalogRegistry.
 *
 * @param unlockedThemeIds IDs of themes whose license has been validated.
 */
export function createThemeRegistry(unlockedThemeIds: string[] = []): ThemeCatalogRegistry {
  const unlockedSet = new Set(unlockedThemeIds)

  function getEffectiveStatus(def: ThemeDefinition): ThemeLicenseStatus {
    if (def.licenseStatus === 'free') return 'free'
    if (unlockedSet.has(def.id)) return 'licensed'
    return def.licenseStatus
  }

  return {
    themes: THEME_CATALOG,

    getTheme(id: string) {
      return THEME_CATALOG.find((t) => t.id === id)
    },

    getLicenseStatus(id: string) {
      const def = THEME_CATALOG.find((t) => t.id === id)
      if (!def) return 'locked'
      return getEffectiveStatus(def)
    },

    isUnlocked(id: string) {
      const def = THEME_CATALOG.find((t) => t.id === id)
      if (!def) return false
      const status = getEffectiveStatus(def)
      return status === 'free' || status === 'licensed'
    },
  }
}
