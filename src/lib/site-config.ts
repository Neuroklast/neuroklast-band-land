import type { BandData, SiteConfig } from './types'

export const TEMPLATE_VERSION = '2.0.0'

export const DEFAULT_SECTION_ORDER = [
  'news',
  'biography',
  'gallery',
  'gigs',
  'releases',
  'media',
  'social',
  'partners',
  'contact',
]

const DEFAULT_BAND_DATA: BandData = {
  name: '',
  genres: [],
  socialLinks: {},
  gigs: [],
  releases: [],
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteId: '',
  siteType: 'band',
  siteName: '',
  setupComplete: false,
  templateVersion: TEMPLATE_VERSION,
  content: DEFAULT_BAND_DATA,
  theme: {},
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: {},
  navigation: {},
  footer: {},
  seo: {},
  features: {},
}

/**
 * Merges user-supplied partial config with the defaults to produce a complete SiteConfig.
 */
export function createSiteConfig(partial: Partial<SiteConfig>): SiteConfig {
  return {
    ...DEFAULT_SITE_CONFIG,
    ...partial,
    content: { ...DEFAULT_BAND_DATA, ...partial.content },
    theme: { ...DEFAULT_SITE_CONFIG.theme, ...partial.theme },
    sectionOrder: partial.sectionOrder ?? DEFAULT_SECTION_ORDER,
    sectionVisibility: { ...DEFAULT_SITE_CONFIG.sectionVisibility, ...partial.sectionVisibility },
    navigation: { ...DEFAULT_SITE_CONFIG.navigation, ...partial.navigation },
    footer: { ...DEFAULT_SITE_CONFIG.footer, ...partial.footer },
    seo: { ...DEFAULT_SITE_CONFIG.seo, ...partial.seo },
    features: { ...DEFAULT_SITE_CONFIG.features, ...partial.features },
  }
}

/**
 * Converts existing BandData into a SiteConfig (migration / backwards compatibility).
 */
export function migrateFromBandData(bandData: BandData): SiteConfig {
  return createSiteConfig({
    siteId: '',
    siteType: 'band',
    siteName: bandData.name,
    setupComplete: false,
    templateVersion: TEMPLATE_VERSION,
    content: bandData,
    theme: bandData.themeSettings ?? {},
    sectionVisibility: bandData.sectionVisibility ?? {},
  })
}

/**
 * Extracts the BandData sub-object from a SiteConfig for components that still need it.
 */
export function extractBandData(config: SiteConfig): BandData {
  return config.content
}
