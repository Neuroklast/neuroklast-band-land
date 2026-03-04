import { describe, it, expect } from 'vitest'
import {
  EXPORT_VERSION,
  exportSiteConfig,
  validateImport,
  mergeImportedConfig,
  encodeThemeToHash,
  decodeThemeFromHash,
} from '@/lib/config-export'
import { createSiteConfig } from '@/lib/site-config'
import type { SiteConfig } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return createSiteConfig({
    siteName: 'Test Band',
    genres: ['techno'],
    gigs: [],
    releases: [],
    socialLinks: {},
    syncUrl: 'https://example.com/sync',
    secretCode: ['UP', 'UP', 'DOWN'],
    ...overrides,
  })
}

// ─── exportSiteConfig ────────────────────────────────────────────────────────

describe('exportSiteConfig', () => {
  it('includes exportVersion, exportedAt, exportScope, siteName, data', () => {
    const cfg = makeConfig()
    const exp = exportSiteConfig(cfg)
    expect(exp.exportVersion).toBe(EXPORT_VERSION)
    expect(typeof exp.exportedAt).toBe('string')
    expect(exp.exportScope).toBe('full')
    expect(exp.siteName).toBe('Test Band')
    expect(exp.data).toBeTruthy()
  })

  it('full scope excludes syncUrl and secretCode', () => {
    const cfg = makeConfig()
    const exp = exportSiteConfig(cfg, 'full')
    expect((exp.data as Record<string, unknown>).syncUrl).toBeUndefined()
    expect((exp.data as Record<string, unknown>).secretCode).toBeUndefined()
  })

  it('theme scope includes only theme-related fields', () => {
    const cfg = makeConfig({ themeSettings: { primary: 'red' } })
    const exp = exportSiteConfig(cfg, 'theme')
    expect(exp.exportScope).toBe('theme')
    expect((exp.data as Record<string, unknown>).themeSettings).toBeTruthy()
    expect((exp.data as Record<string, unknown>).siteName).toBeUndefined()
    expect((exp.data as Record<string, unknown>).gigs).toBeUndefined()
  })

  it('content scope includes siteName and gigs but not themeSettings', () => {
    const cfg = makeConfig({ themeSettings: { primary: 'red' } })
    const exp = exportSiteConfig(cfg, 'content')
    expect(exp.exportScope).toBe('content')
    expect((exp.data as Record<string, unknown>).siteName).toBe('Test Band')
    expect((exp.data as Record<string, unknown>).gigs).toBeDefined()
    expect((exp.data as Record<string, unknown>).themeSettings).toBeUndefined()
  })

  it('settings scope includes navigation and features', () => {
    const cfg = makeConfig()
    const exp = exportSiteConfig(cfg, 'settings')
    expect(exp.exportScope).toBe('settings')
    expect((exp.data as Record<string, unknown>).navigation).toBeDefined()
    expect((exp.data as Record<string, unknown>).features).toBeDefined()
    expect((exp.data as Record<string, unknown>).siteName).toBeUndefined()
  })

  it('sanitizes widget plugin API keys in full export', () => {
    const cfg = makeConfig({
      widgetPlugins: [
        {
          id: 'test-widget',
          name: 'Test',
          description: 'A test widget',
          category: 'other',
          version: '1.0.0',
          installed: true,
          enabled: true,
          order: 0,
          config: { apiKey: 'secret123', artistName: 'Neuroklast' },
        },
      ],
    })
    const exp = exportSiteConfig(cfg, 'full')
    const plugin = (exp.data as Record<string, unknown>).widgetPlugins as Array<{ config?: Record<string, unknown> }>
    expect(plugin[0].config?.apiKey).toBe('***')
    expect(plugin[0].config?.artistName).toBe('Neuroklast')
  })
})

// ─── validateImport ──────────────────────────────────────────────────────────

describe('validateImport', () => {
  it('returns invalid for non-object input', () => {
    const result = validateImport(null)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns invalid for object without siteName or name', () => {
    const result = validateImport({ foo: 'bar' })
    expect(result.valid).toBe(false)
  })

  it('detects new export format', () => {
    const cfg = makeConfig()
    const exported = exportSiteConfig(cfg, 'full')
    const result = validateImport(exported)
    expect(result.valid).toBe(true)
    expect(result.isNewFormat).toBe(true)
    expect(result.isLegacyFormat).toBe(false)
    expect(result.siteName).toBe('Test Band')
    expect(result.scope).toBe('full')
    expect(result.data).toBeTruthy()
  })

  it('detects legacy format (direct SiteConfig with siteName)', () => {
    const raw = { siteName: 'Old Band', genres: ['metal'], gigs: [], releases: [], socialLinks: {} }
    const result = validateImport(raw)
    expect(result.valid).toBe(true)
    expect(result.isLegacyFormat).toBe(true)
    expect(result.isNewFormat).toBe(false)
    expect(result.warnings.some(w => w.includes('Legacy'))).toBe(true)
  })

  it('detects legacy format with "name" field (BandData compat)', () => {
    const raw = { name: 'Old DJ', gigs: [], releases: [], socialLinks: {} }
    const result = validateImport(raw)
    expect(result.valid).toBe(true)
    expect(result.siteName).toBe('Old DJ')
  })

  it('warns on version mismatch', () => {
    const cfg = makeConfig()
    const exported = exportSiteConfig(cfg, 'full')
    const withOldVersion = { ...exported, exportVersion: '0.9' }
    const result = validateImport(withOldVersion)
    expect(result.valid).toBe(true)
    expect(result.warnings.some(w => w.includes('0.9'))).toBe(true)
  })

  it('returns error when new format is missing siteName', () => {
    const cfg = makeConfig()
    const exported = exportSiteConfig(cfg, 'full')
    const noName = { ...exported, siteName: undefined }
    const result = validateImport(noName)
    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('siteName'))).toBe(true)
  })
})

// ─── mergeImportedConfig ─────────────────────────────────────────────────────

describe('mergeImportedConfig', () => {
  it('full scope keeps current siteId', () => {
    const current = makeConfig()
    const imported = makeConfig({ siteName: 'New Band' })
    const result = mergeImportedConfig(current, imported, 'full')
    expect(result.siteId).toBe(current.siteId)
    expect(result.siteName).toBe('New Band')
  })

  it('theme scope only updates theme fields', () => {
    const current = makeConfig({ siteName: 'Keep Me' })
    const imported: Partial<SiteConfig> = { themeSettings: { primary: 'blue' } }
    const result = mergeImportedConfig(current, imported, 'theme')
    expect(result.siteName).toBe('Keep Me')
    expect(result.themeSettings?.primary).toBe('blue')
  })

  it('content scope only updates content fields', () => {
    const current = makeConfig()
    const imported: Partial<SiteConfig> = { siteName: 'Updated Name', gigs: [] }
    const result = mergeImportedConfig(current, imported, 'content')
    expect(result.siteName).toBe('Updated Name')
    // navigation should remain from current
    expect(result.navigation).toEqual(current.navigation)
  })

  it('settings scope only updates settings fields', () => {
    const current = makeConfig({ siteName: 'Unchanged' })
    const imported: Partial<SiteConfig> = { domain: 'example.com' }
    const result = mergeImportedConfig(current, imported, 'settings')
    expect(result.siteName).toBe('Unchanged')
    expect(result.domain).toBe('example.com')
  })

  it('returns current config for unknown scope', () => {
    const current = makeConfig()
    const result = mergeImportedConfig(current, {}, 'full' as never)
    // 'full' with empty imported should still keep siteId
    expect(result.siteId).toBe(current.siteId)
  })
})

// ─── encodeThemeToHash / decodeThemeFromHash ──────────────────────────────────

describe('encodeThemeToHash / decodeThemeFromHash', () => {
  it('round-trips a theme export through base64 hash', () => {
    const cfg = makeConfig({ themeSettings: { primary: 'oklch(0.5 0.2 25)' } })
    const hash = encodeThemeToHash(cfg)
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)

    const decoded = decodeThemeFromHash(hash)
    expect(decoded).toBeTruthy()
    expect(decoded?.exportScope).toBe('theme')
    expect(decoded?.data?.themeSettings?.primary).toBe('oklch(0.5 0.2 25)')
  })

  it('returns null for invalid hash', () => {
    expect(decodeThemeFromHash('not-valid-base64!!!')).toBeNull()
    expect(decodeThemeFromHash('')).toBeNull()
  })

  it('returns null for a valid base64 but non-theme JSON', () => {
    const hash = btoa(encodeURIComponent(JSON.stringify({ foo: 'bar' })))
    expect(decodeThemeFromHash(hash)).toBeNull()
  })
})
