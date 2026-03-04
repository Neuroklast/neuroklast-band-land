import type { SiteConfig, ThemeSettings, FontConfig, WidgetPlugin } from '@/lib/types'
import { createSiteConfig } from '@/lib/site-config'

export const EXPORT_VERSION = '1.0'

export type ExportScope = 'full' | 'theme' | 'content' | 'settings'

export interface SiteConfigExport {
  exportVersion: string
  exportedAt: string
  exportScope: ExportScope
  templateVersion: string
  siteName: string
  data: Partial<SiteConfig>
}

/** Fields included per export scope */
const SCOPE_FIELDS: Record<ExportScope, (keyof SiteConfig)[]> = {
  full: [], // empty = all fields
  theme: ['themeSettings', 'fontConfig', 'sectionVisibility', 'animations'],
  content: ['siteName', 'tagline', 'description', 'genres', 'biography', 'gigs', 'releases', 'news', 'galleryImages', 'mediaFiles', 'socialLinks', 'impressum', 'datenschutz', 'label'],
  settings: ['siteType', 'domain', 'navigation', 'footer', 'seo', 'features', 'sections', 'sectionLabels', 'newsletterSettings', 'contactSettings', 'soundSettings', 'widgetPlugins'],
}

/** Strip any API keys / tokens from widget plugin configs before export */
function sanitizeWidgetPlugins(plugins: WidgetPlugin[]): WidgetPlugin[] {
  return plugins.map(plugin => {
    if (!plugin.config) return plugin
    const sanitizedConfig: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(plugin.config)) {
      const lower = k.toLowerCase()
      if (lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('password')) {
        sanitizedConfig[k] = '***'
      } else {
        sanitizedConfig[k] = v
      }
    }
    return { ...plugin, config: sanitizedConfig }
  })
}

/** Create an export object from a SiteConfig */
export function exportSiteConfig(config: SiteConfig, scope: ExportScope = 'full'): SiteConfigExport {
  let data: Partial<SiteConfig>

  if (scope === 'full') {
    // Export everything except sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { syncUrl, secretCode, ...rest } = config
    data = { ...rest }
    if (data.widgetPlugins) {
      data.widgetPlugins = sanitizeWidgetPlugins(data.widgetPlugins)
    }
  } else {
    const fields = SCOPE_FIELDS[scope]
    data = Object.fromEntries(
      fields.map(key => [key, config[key]]).filter(([, v]) => v !== undefined)
    ) as Partial<SiteConfig>
    if (scope === 'settings' && data.widgetPlugins) {
      data.widgetPlugins = sanitizeWidgetPlugins(data.widgetPlugins)
    }
  }

  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportScope: scope,
    templateVersion: config.templateVersion,
    siteName: config.siteName,
    data,
  }
}

/** Download a SiteConfigExport as a JSON file */
export function downloadConfigExport(exportObj: SiteConfigExport): void {
  const json = JSON.stringify(exportObj, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const scopeSuffix = exportObj.exportScope !== 'full' ? `-${exportObj.exportScope}` : ''
  a.download = `site-config${scopeSuffix}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ImportValidationResult {
  valid: boolean
  isLegacyFormat: boolean
  isNewFormat: boolean
  scope: ExportScope
  siteName: string
  exportedAt?: string
  templateVersion?: string
  warnings: string[]
  errors: string[]
  data: Partial<SiteConfig> | null
}

/** Validate and parse an imported JSON object */
export function validateImport(raw: unknown): ImportValidationResult {
  const warnings: string[] = []
  const errors: string[] = []

  if (!raw || typeof raw !== 'object') {
    return { valid: false, isLegacyFormat: false, isNewFormat: false, scope: 'full', siteName: '', warnings, errors: ['Not a valid JSON object'], data: null }
  }

  const obj = raw as Record<string, unknown>

  // New format detection
  if (obj.exportVersion && obj.data) {
    const data = obj.data as Partial<SiteConfig>
    if (!obj.siteName) {
      errors.push('Missing siteName in export')
      return { valid: false, isLegacyFormat: false, isNewFormat: true, scope: (obj.exportScope as ExportScope) || 'full', siteName: '', warnings, errors, data: null }
    }
    // Version check
    if (obj.exportVersion !== EXPORT_VERSION) {
      warnings.push(`Export version ${obj.exportVersion} may differ from current version ${EXPORT_VERSION}. Migration will be attempted.`)
    }
    return {
      valid: true,
      isLegacyFormat: false,
      isNewFormat: true,
      scope: (obj.exportScope as ExportScope) || 'full',
      siteName: obj.siteName as string,
      exportedAt: obj.exportedAt as string | undefined,
      templateVersion: obj.templateVersion as string | undefined,
      warnings,
      errors,
      data,
    }
  }

  // Legacy format: direct SiteConfig or BandData
  const siteName = (obj.siteName || obj.name) as string | undefined
  if (!siteName) {
    errors.push('No siteName or name field found. Not a valid site config.')
    return { valid: false, isLegacyFormat: true, isNewFormat: false, scope: 'full', siteName: '', warnings, errors, data: null }
  }
  warnings.push('Legacy format detected. Config will be migrated to current format.')
  const normalized = { ...obj, siteName } as Partial<SiteConfig>
  return {
    valid: true,
    isLegacyFormat: true,
    isNewFormat: false,
    scope: 'full',
    siteName,
    warnings,
    errors,
    data: normalized,
  }
}

/** Merge imported data into the current config based on scope */
export function mergeImportedConfig(current: SiteConfig, imported: Partial<SiteConfig>, scope: ExportScope): SiteConfig {
  if (scope === 'full') {
    return createSiteConfig({
      ...imported,
      siteId: current.siteId, // keep own siteId
      updatedAt: new Date().toISOString(),
    })
  }

  if (scope === 'theme') {
    return createSiteConfig({
      ...current,
      themeSettings: imported.themeSettings ?? current.themeSettings,
      fontConfig: imported.fontConfig ?? current.fontConfig,
      sectionVisibility: imported.sectionVisibility ?? current.sectionVisibility,
      animations: imported.animations ?? current.animations,
      updatedAt: new Date().toISOString(),
    })
  }

  if (scope === 'content') {
    return createSiteConfig({
      ...current,
      siteName: imported.siteName ?? current.siteName,
      tagline: imported.tagline ?? current.tagline,
      description: imported.description ?? current.description,
      genres: imported.genres ?? current.genres,
      biography: imported.biography ?? current.biography,
      gigs: imported.gigs ?? current.gigs,
      releases: imported.releases ?? current.releases,
      news: imported.news ?? current.news,
      galleryImages: imported.galleryImages ?? current.galleryImages,
      mediaFiles: imported.mediaFiles ?? current.mediaFiles,
      socialLinks: imported.socialLinks ?? current.socialLinks,
      impressum: imported.impressum ?? current.impressum,
      datenschutz: imported.datenschutz ?? current.datenschutz,
      label: imported.label ?? current.label,
      updatedAt: new Date().toISOString(),
    })
  }

  if (scope === 'settings') {
    return createSiteConfig({
      ...current,
      siteType: imported.siteType ?? current.siteType,
      domain: imported.domain ?? current.domain,
      navigation: imported.navigation ?? current.navigation,
      footer: imported.footer ?? current.footer,
      seo: imported.seo ?? current.seo,
      features: imported.features ?? current.features,
      sections: imported.sections ?? current.sections,
      sectionLabels: imported.sectionLabels ?? current.sectionLabels,
      newsletterSettings: imported.newsletterSettings ?? current.newsletterSettings,
      contactSettings: imported.contactSettings ?? current.contactSettings,
      soundSettings: imported.soundSettings ?? current.soundSettings,
      widgetPlugins: imported.widgetPlugins ?? current.widgetPlugins,
      updatedAt: new Date().toISOString(),
    })
  }

  return current
}

// ─── SHAREABLE THEME URL ───────────────────────────────────────────

/** Encode a theme export as a Base64 URL-hash string */
export function encodeThemeToHash(config: SiteConfig): string {
  const themeExport = exportSiteConfig(config, 'theme')
  const json = JSON.stringify(themeExport)
  return btoa(encodeURIComponent(json))
}

/** Decode a Base64 URL-hash string to a theme export */
export function decodeThemeFromHash(hash: string): SiteConfigExport | null {
  try {
    const json = decodeURIComponent(atob(hash))
    const parsed = JSON.parse(json)
    if (parsed.exportVersion && parsed.data) return parsed as SiteConfigExport
    return null
  } catch {
    return null
  }
}

/** Copy a shareable theme URL to clipboard */
export async function copyThemeShareUrl(config: SiteConfig): Promise<void> {
  const hash = encodeThemeToHash(config)
  const url = `${window.location.origin}${window.location.pathname}#theme=${hash}`
  await navigator.clipboard.writeText(url)
}

/** Check URL hash on load and return theme export if present */
export function getThemeFromUrlHash(): SiteConfigExport | null {
  const hash = window.location.hash
  const match = hash.match(/[#&]theme=([^&]+)/)
  if (!match) return null
  return decodeThemeFromHash(match[1])
}
