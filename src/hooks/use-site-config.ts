import { useCallback, useEffect, useRef } from 'react'
import { useKV } from './use-kv'
import { createSiteConfig, DEFAULT_SITE_CONFIG, migrateFromBandData } from '@/lib/site-config'
import type { BandData, SiteConfig } from '@/lib/types'

/**
 * Central hook for reading and updating the SiteConfig.
 *
 * Internally:
 *  - Stores config under the KV key `'site-config'`
 *  - On first load, if `'site-config'` is absent but `'band-data'` exists,
 *    auto-migrates legacy BandData to SiteConfig format.
 *  - Falls back to DEFAULT_SITE_CONFIG when neither key has data.
 */
export function useSiteConfig() {
  // Use null as default so we can reliably distinguish "never saved" from "saved default"
  const [rawConfig, setRawConfig, configLoaded] = useKV<SiteConfig | null>('site-config', null)
  const [legacyBandData, , legacyLoaded] = useKV<BandData>('band-data', {} as BandData)

  // Track whether we have already attempted the migration so we don't run it twice.
  const migratedRef = useRef(false)

  useEffect(() => {
    if (!configLoaded || !legacyLoaded) return
    if (migratedRef.current) return

    // If site-config is absent (null) but band-data exists, auto-migrate.
    const hasSiteConfig = rawConfig !== null
    const hasBandData = legacyBandData && legacyBandData.name

    if (!hasSiteConfig && hasBandData) {
      migratedRef.current = true
      const migrated = migrateFromBandData(legacyBandData as BandData)
      setRawConfig(migrated)
    } else {
      migratedRef.current = true
    }
  }, [configLoaded, legacyLoaded, rawConfig, legacyBandData, setRawConfig])

  const siteConfig: SiteConfig = rawConfig
    ? createSiteConfig(rawConfig)
    : DEFAULT_SITE_CONFIG

  const updateConfig = useCallback(
    (partial: Partial<SiteConfig>) => {
      setRawConfig((current) => createSiteConfig({ ...(current ?? DEFAULT_SITE_CONFIG), ...partial }))
    },
    [setRawConfig],
  )

  const updateContent = useCallback(
    (partial: Partial<BandData>) => {
      setRawConfig((current) => {
        const base = current ?? DEFAULT_SITE_CONFIG
        return createSiteConfig({ ...base, content: { ...base.content, ...partial } })
      })
    },
    [setRawConfig],
  )

  const isSetupComplete = siteConfig.setupComplete

  return {
    siteConfig,
    updateConfig,
    updateContent,
    isSetupComplete,
    loaded: configLoaded && legacyLoaded,
  }
}
