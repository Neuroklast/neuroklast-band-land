/**
 * Theme Registry — manages available ThemePackage instances.
 *
 * Provides theme lookup, registration, and a React hook for resolving
 * slot components with fallbacks.
 */

import type { ThemePackage, ThemeSlots } from './types'
import {
  DefaultHero,
  DefaultNavigation,
  DefaultLoadingScreen,
  DefaultSectionDivider,
  DefaultCard,
  DefaultBackgroundEffects,
  DefaultFooter,
  DefaultOverlayModal,
  DefaultSectionHeading,
  DefaultOverlayTransition,
  DefaultItemCard,
  DefaultCookieBanner,
  DefaultScrollReveal,
  DefaultHoverEffect,
  DefaultPageLayout,
  DefaultGigsSection,
  DefaultReleasesSection,
  DefaultBiographySection,
  DefaultNewsSection,
  DefaultMediaSection,
  DefaultGallerySection,
  DefaultSocialSection,
  DefaultContactSection,
  DefaultPartnersSection,
} from '@/themes/default-slots'
import { builtInThemes, neuroklastClassicTheme } from '@/themes'
import type { ThemeDefinition, ThemeLicenseStatus } from './types'
import type { LicenseTier } from './activation'
import {
  presetToThemeSettings,
  neuroklastClassicPreset,
} from './design-presets'
import { hasFeature } from './license'

const _registry: Map<string, ThemePackage> = new Map()

export function registerTheme(theme: ThemePackage): void {
  _registry.set(theme.id, theme)
}

export function getTheme(id: string): ThemePackage | undefined {
  return _registry.get(id)
}

export function getAllThemes(): ThemePackage[] {
  return Array.from(_registry.values())
}

export function getActiveTheme(themeId?: string): ThemePackage {
  if (themeId) {
    const found = _registry.get(themeId)
    if (found) return found
  }
  const fallback = _registry.get('neuroklast-classic') ?? Array.from(_registry.values())[0]
  if (!fallback) throw new Error('Theme registry is empty — no themes have been registered')
  return fallback
}

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
    OverlayModal: theme.slots.OverlayModal ?? DefaultOverlayModal,
    SectionHeading: theme.slots.SectionHeading ?? DefaultSectionHeading,
    OverlayTransition: theme.slots.OverlayTransition ?? DefaultOverlayTransition,
    ItemCard: theme.slots.ItemCard ?? DefaultItemCard,
    CookieBanner: theme.slots.CookieBanner ?? DefaultCookieBanner,
    ScrollReveal: theme.slots.ScrollReveal ?? DefaultScrollReveal,
    HoverEffect: theme.slots.HoverEffect ?? DefaultHoverEffect,
    PageLayout: theme.slots.PageLayout ?? DefaultPageLayout,
  }
}

for (const theme of builtInThemes) {
  registerTheme(theme)
}

export { neuroklastClassicTheme }

export const THEME_CATALOG: ThemeDefinition[] = [
  {
    id: 'neuroklast-classic',
    name: 'Neuroklast Classic',
    description: 'The original Neuroklast look – dark cyber aesthetic with crimson accents and code-rain loading',
    licenseStatus: 'free',
    theme: {
      ...presetToThemeSettings(neuroklastClassicPreset),
      heroStyle: 'chromatic-hover',
      loadingScreenType: 'code-rain',
    },
    author: 'Neuroklast',
    tags: ['dark', 'cyber', 'industrial'],
    themeType: 'full',
  },
]

export interface ThemeCatalogRegistry {
  themes: ThemeDefinition[]
  getTheme(id: string): ThemeDefinition | undefined
  getLicenseStatus(id: string): ThemeLicenseStatus
  isUnlocked(id: string): boolean
}

export function createThemeRegistry(
  unlockedThemeIds: string[] = [],
  assignedThemeIds: string[] = [],
  tier: LicenseTier = 'free',
): ThemeCatalogRegistry {
  const unlockedSet = new Set(unlockedThemeIds)
  const assignedSet = new Set(assignedThemeIds)

  function getEffectiveStatus(def: ThemeDefinition): ThemeLicenseStatus {
    if (def.licenseStatus === 'free') return 'free'
    if (unlockedSet.has(def.id) || assignedSet.has(def.id)) return 'licensed'
    const pkg = _registry.get(def.id)
    if (pkg?.access === 'premium' && hasFeature(tier, 'premium-themes')) return 'licensed'
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
