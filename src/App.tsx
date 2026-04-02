import { useSiteConfig } from '@/hooks/use-site-config'
import { resolveSections, getEnabledSectionIds } from '@/lib/sections'
import { useEffect, useRef, useState, useMemo, startTransition, lazy, Suspense } from 'react'
import { useAdminDialogState } from '@/hooks/use-admin-dialog-state'
import { useAppKeyboardShortcuts } from '@/hooks/use-app-keyboard-shortcuts'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import CookieBanner from '@/components/CookieBanner'
import KonamiListener from '@/components/KonamiListener'
import CyberSpinner from '@/components/CyberSpinner'
import { useCRTEffects } from '@/hooks/use-crt-effects'
import { trackPageView, trackInteraction, trackClick } from '@/lib/analytics'
import type {
  FontSizeSettings,
  SectionLabels,
  SoundSettings,
  ThemeSettings,
  SectionVisibility,
  OverlayModalSlotProps,
} from '@/lib/types'
import { DEFAULT_LABEL, applyConfigOverrides } from '@/lib/config'
import { generateMetaTags, applyMetaTags } from '@/lib/meta-tags'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useOverlayState } from '@/hooks/use-overlay-state'
import ActivationLockScreen from '@/components/ActivationLockScreen'
import { validateActivationKey } from '@/lib/activation'
import type { ActivationResult } from '@/lib/activation'
import { getThemeFromUrlHash, mergeImportedConfig } from '@/lib/config-export'
import { useThemeSlots, getTheme } from '@/lib/theme-registry'
import { isPrimaryInstance } from '@/lib/primary-check'
import SiteContentRenderer from '@/components/SiteContentRenderer'
import { createSiteConfig } from '@/lib/site-config'
import bandDataJson from '@/assets/documents/band-data.json'
import { useLocale } from '@/hooks/use-locale'
import { ThemeProvider } from '@/contexts/ThemeContext'

// ─── Lazy-loaded heavy components ─────────────────────────────────────────────
// These are only downloaded when an admin or specific user action requires them,
// keeping the initial bundle lean for regular visitors.

const SetupWizard = lazy(() => import('@/components/SetupWizard'))
const SecretTerminal = lazy(() => import('@/components/SecretTerminal'))
const AdminDialogManager = lazy(() => import('@/components/AdminDialogManager'))
const ImpressumWindow = lazy(() => import('@/components/ImpressumWindow'))
const DatenschutzWindow = lazy(() => import('@/components/DatenschutzWindow'))
const BandInfoEditDialog = lazy(() => import('@/components/BandInfoEditDialog'))
const AdminButton = lazy(() => import('@/components/AdminButton'))
const AdminLoginDialog = lazy(() => import('@/components/AdminLoginDialog'))
const AudioVisualizer = lazy(() => import('@/components/AudioVisualizer'))
const OverlayEffectsLayer = lazy(() => import('@/components/OverlayEffectsLayer'))
const MovingScanline = lazy(() => import('@/components/MovingScanline').then(m => ({ default: m.MovingScanline })))
const SystemMonitorHUD = lazy(() => import('@/components/SystemMonitorHUD').then(m => ({ default: m.SystemMonitorHUD })))
const LicenseStatusBadge = lazy(() => import('@/components/LicenseStatusBadge'))

// ─── Default config ───────────────────────────────────────────────────────────

const defaultSiteConfig = createSiteConfig({
  siteName: bandDataJson.band.name,
  genres: bandDataJson.band.genres,
  label: bandDataJson.band.label || DEFAULT_LABEL,
  socialLinks: {},
  gigs: [],
  releases: [],
  biography: {
    story: bandDataJson.biography.story,
    founded: bandDataJson.biography.founded,
    members: bandDataJson.biography.members,
    achievements: bandDataJson.biography.achievements,
  },
  terminalCommands: [
    {
      name: 'status',
      description: 'System status',
      output: ['SYSTEM STATUS:', '  AUDIO ENGINE: ACTIVE', '  HUD SYSTEMS: OPERATIONAL', '  THREAT LEVEL: CLASSIFIED'],
    },
    {
      name: 'info',
      description: 'Band information',
      output: ['SYSTEM INFO', 'LOCATION: CLASSIFIED', 'FREQUENCY: 150+ BPM'],
    },
  ],
  terminalMorseCode: '...',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Collect the first few image URLs for prefetching. */
function collectImageUrls(data: typeof defaultSiteConfig): string[] {
  const urls: string[] = []
  if (data.logoUrl) urls.push(data.logoUrl)
  if (data.titleImageUrl) urls.push(data.titleImageUrl)
  data.news?.slice(0, 3).forEach(item => { if (item.photo) urls.push(item.photo) })
  data.biography?.members?.forEach(m => { if (typeof m !== 'string' && m.photo) urls.push(m.photo) })
  return urls.slice(0, 6)
}

/**
 * Remove a query parameter from the current URL without triggering a
 * navigation or adding a history entry.
 */
function removeSearchParam(key: string): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  window.history.replaceState({}, '', url.toString())
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { t } = useLocale()
  const { config, updateConfig, setConfig, isLoaded: siteConfigLoaded } = useSiteConfig()
  const { isOwner, needsSetup, totpEnabled, setupTokenRequired, handleAdminLogin, handleAdminLogout, handleSetAdminPassword, handleSetupAdminPassword, handleChangeAdminPassword } = useAdminAuth()
  const { cyberpunkOverlay, setCyberpunkOverlay } = useOverlayState(config.themeSettings?.overlayAnimationStyle)
  const { Navigation: ThemeNavigation, LoadingScreen: ThemeLoadingScreen, OverlayModal: ThemeOverlayModal } = useThemeSlots(config.themeSettings?.activePreset)
  const [loading, setLoading] = useState(true)
  const [themeTransitioning, setThemeTransitioning] = useState(false)
  const prevActivePresetRef = useRef<string | undefined>(undefined)
  const [activationResult, setActivationResult] = useState<ActivationResult | null>(null)
  const {
    activeDialog, setActiveDialog,
    showLoginDialog, setShowLoginDialog,
    showSetupDialog, setShowSetupDialog,
    showBandInfoEdit, setShowBandInfoEdit,
    impressumOpen, setImpressumOpen,
    datenschutzOpen, setDatenschutzOpen,
    showAttackerProfile, setShowAttackerProfile,
    selectedAttackerIp, setSelectedAttackerIp,
    openAdminHubOnMount, setOpenAdminHubOnMount,
  } = useAdminDialogState()
  // SECURITY: hostname-based check; env vars like VITE_IS_PRIMARY must never be used here.
  const isPrimary = isPrimaryInstance()
  const isDevTestMode = import.meta.env.VITE_DEV_TEST_MODE === 'true'

  useCRTEffects()

  useAppKeyboardShortcuts({ isOwner, setShowLoginDialog, setOpenAdminHubOnMount })

  // ── Theme transition loading screen ─────────────────────────────────────────
  // When the active theme preset changes (after initial load), show the new
  // theme's LoadingScreen before revealing the page with the new theme applied.
  useEffect(() => {
    const currentPreset = config.themeSettings?.activePreset
    if (prevActivePresetRef.current === undefined) {
      // First render — just record the preset, don't trigger a transition
      prevActivePresetRef.current = currentPreset
      return
    }
    if (currentPreset !== prevActivePresetRef.current && !loading) {
      prevActivePresetRef.current = currentPreset
      setThemeTransitioning(true)
    } else {
      prevActivePresetRef.current = currentPreset
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.themeSettings?.activePreset])

  // ── Meta tags / browser tab title ───────────────────────────────────────────
  useEffect(() => {
    if (siteConfigLoaded) {
      applyMetaTags(generateMetaTags(config))
    }
  }, [config, siteConfigLoaded])

  // ── Analytics ───────────────────────────────────────────────────────────────
  useEffect(() => { validateActivationKey().then(setActivationResult) }, [])
  useEffect(() => { trackPageView() }, [])
  useEffect(() => {
    const handleClick = (e: MouseEvent) => trackClick(e)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // ── Theme import from URL hash ────────────────────────────────────────────────
  const configAtMountRef = useRef(config)
  useEffect(() => {
    const te = getThemeFromUrlHash()
    if (!te?.data) return
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    const base = configAtMountRef.current
    toast(t('app.themeDetected'), {
      duration: 10000,
      action: {
        label: t('app.themeApply'),
        onClick: () => {
          setConfig(mergeImportedConfig(base, te.data, 'theme'))
          toast.success(t('app.themeApplied'))
        },
      },
      cancel: { label: t('app.themeIgnore'), onClick: () => {} },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Special URL params (parsed once on mount) ────────────────────────────────
  const wantsSetup = useRef(false)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.has('admin-setup')) {
      wantsSetup.current = true
      removeSearchParam('admin-setup')
    }
    if (p.has('access-secret-terminal-NK-666')) {
      startTransition(() => setActiveDialog('secret-terminal'))
      removeSearchParam('access-secret-terminal-NK-666')
    }
  }, [])
  useEffect(() => {
    if (wantsSetup.current && needsSetup) {
      wantsSetup.current = false
      startTransition(() => setShowSetupDialog(true))
    }
  }, [needsSetup])

  // Apply developer test data if active
  useEffect(() => {
    if (isDevTestMode && siteConfigLoaded && !config.setupComplete) {
      setConfig({
        ...config,
        setupComplete: true,
        siteName: 'Dev Test Band',
        gigs: [{ id: '1', date: '2025-10-10', venue: 'Cyber Club', location: 'Night City', ticketUrl: '#' }],
        releases: [{ id: '1', title: 'Test Release', releaseDate: '2024-01-01', artwork: 'https://via.placeholder.com/300', type: 'album', streamingLinks: {} }],
        socialLinks: { youtube: 'https://youtube.com', instagram: 'https://instagram.com' }
      })
      toast.success('Developer Test Mode Active: Fake data loaded.')
    }
  }, [isDevTestMode, siteConfigLoaded, config, setConfig])

  // Derived state
  const data = useMemo(() => ({ ...defaultSiteConfig, ...config }), [config])
  const _precacheUrls = useMemo(() => collectImageUrls(data), [data])
  const vis = useMemo(() => data.sectionVisibility || {}, [data.sectionVisibility])
  const activeSectionIds = useMemo(() => getEnabledSectionIds(resolveSections(data)), [data])
  // ── DOM side effects ─────────────────────────────────────────────────────────
  useEffect(() => { applyConfigOverrides(data.configOverrides) }, [data.configOverrides])
  // Theme DOM application is handled by ThemeProvider (see JSX below)
  useEffect(() => {
    const a = data.animations
    const root = document.documentElement
    if (typeof a?.crtOverlayOpacity === 'number') root.style.setProperty('--crt-overlay-opacity', String(a.crtOverlayOpacity))
    if (typeof a?.crtVignetteOpacity === 'number') root.style.setProperty('--crt-vignette-opacity', String(a.crtVignetteOpacity))
    return () => {
      root.style.removeProperty('--crt-overlay-opacity')
      root.style.removeProperty('--crt-vignette-opacity')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.animations?.crtOverlayOpacity, data.animations?.crtVignetteOpacity])

  // ── Event handlers ────────────────────────────────────────────────────────────
  const handleFontSizeChange = (key: keyof FontSizeSettings, value: string) =>
    updateConfig({ fontSizes: { ...config.fontSizes, [key]: value } })

  const handleLabelChange = (key: keyof SectionLabels, value: string) =>
    updateConfig({ sectionLabels: { ...config.sectionLabels, [key]: value } })

  const handleTerminalActivation = () => {
    setActiveDialog('secret-terminal')
    trackInteraction('terminal_activated')
    toast.success('TERMINAL ACCESS GRANTED', { description: 'Secret code activated' })
  }

  if (!activationResult?.valid) return <ActivationLockScreen pending={activationResult === null} />

  return (
    <ThemeProvider
      themeSettings={data.themeSettings}
      onChangeTheme={(themeSettings: ThemeSettings) => updateConfig({ themeSettings })}
    >
      {(siteConfigLoaded && !data.setupComplete && !isDevTestMode) && (
        <Suspense fallback={<CyberSpinner />}>
          <SetupWizard onComplete={(r) => setConfig({ ...config, ...r, setupComplete: true })} onSetAdminPassword={handleSetupAdminPassword} initialConfig={config} />
        </Suspense>
      )}
      <a href="#main-content" className="skip-to-main">{t('app.skipToMain')}</a>
      <KonamiListener onCodeActivated={handleTerminalActivation} customCode={data.secretCode} />
      <Suspense fallback={null}>
        <SecretTerminal isOpen={activeDialog === 'secret-terminal'} onClose={() => setActiveDialog(null)} customCommands={data.terminalCommands || []} secretCode={data.secretCode} siteName={data.siteName} editMode={isOwner} onSaveCommands={(tc) => updateConfig({ terminalCommands: tc })} onSaveSecretCode={(sc) => updateConfig({ secretCode: sc })} />
      </Suspense>
      <Suspense fallback={null}>
        <ImpressumWindow open={impressumOpen} onClose={() => setImpressumOpen(false)} impressum={data.impressum} editMode={isOwner} onSave={(impressum) => updateConfig({ impressum })} />
      </Suspense>
      <Suspense fallback={null}>
        <DatenschutzWindow open={datenschutzOpen} onClose={() => setDatenschutzOpen(false)} datenschutz={data.datenschutz} impressumName={data.impressum?.name} editMode={isOwner} onSave={(datenschutz) => updateConfig({ datenschutz })} />
      </Suspense>
      <CookieBanner />
      {vis.scanline !== false && <Suspense fallback={null}><MovingScanline /></Suspense>}
      {vis.systemMonitor !== false && <Suspense fallback={null}><SystemMonitorHUD /></Suspense>}
      <Suspense fallback={null}><OverlayEffectsLayer effects={data.themeSettings?.overlayEffects} /></Suspense>
      <AnimatePresence>
        {loading && (
          siteConfigLoaded ? (
            <ThemeLoadingScreen
              onComplete={() => {
                setLoading(false)
              }}
            />
          ) : (
            <div className="fixed inset-0 z-[9999] bg-background" />
          )
        )}
      </AnimatePresence>
      <AnimatePresence>
        {themeTransitioning && (
          <ThemeLoadingScreen
            onComplete={() => {
              setThemeTransitioning(false)
            }}
          />
        )}
      </AnimatePresence>

      {!loading && (
        <>
          <ThemeNavigation
            siteName={data.siteName}
            items={[
              { label: data.sectionLabels?.home || 'Home', id: 'hero' },
              { label: data.sectionLabels?.news || 'News', id: 'news' },
              { label: data.sectionLabels?.biography || 'Biography', id: 'biography' },
              { label: data.sectionLabels?.gallery || 'Gallery', id: 'gallery' },
              { label: data.sectionLabels?.gigs || 'Gigs', id: 'gigs' },
              { label: data.sectionLabels?.releases || 'Releases', id: 'releases' },
              { label: data.sectionLabels?.media || 'Media', id: 'media' },
              { label: data.sectionLabels?.connect || 'Connect', id: 'social' },
              { label: data.sectionLabels?.contact || 'Contact', id: 'contact' },
              { label: data.sectionLabels?.partnersAndFriends || 'Partners', id: 'partners' },
            ].filter(item => item.id === 'hero' || (activeSectionIds.includes(item.id) && vis[item.id as keyof typeof vis] !== false))}
          />
          <motion.div className="min-h-screen bg-background text-foreground overflow-x-hidden relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            {vis.audioVisualizer !== false && <Suspense fallback={null}><AudioVisualizer /></Suspense>}
            <div className="fixed inset-0 pointer-events-none z-[100]"><div className="absolute inset-0 hud-scanline opacity-30" /></div>
            <Toaster position="top-right" />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}>

              <SiteContentRenderer
                data={data}
                defaultData={defaultSiteConfig}
                isOwner={isOwner}
                siteConfigLoaded={siteConfigLoaded}
                vis={vis}
                onUpdate={(key, value) => updateConfig({ [key]: value })}
                onFontSizeChange={handleFontSizeChange}
                onLabelChange={handleLabelChange}
                onShowBandInfoEdit={() => setShowBandInfoEdit(true)}
                onSetCyberpunkOverlay={setCyberpunkOverlay}
                onShowLogin={() => setShowLoginDialog(true)}
                onShowImpressum={() => {
                  if (isOwner) {
                    setImpressumOpen(true)
                  } else if (data.impressum) {
                    setCyberpunkOverlay({ type: 'impressum', data: data.impressum })
                  } else {
                    setImpressumOpen(true)
                  }
                }}
                onShowDatenschutz={() => setDatenschutzOpen(true)}
              />

              {isOwner && (
                <div className="flex items-center gap-2">
                  <Suspense fallback={null}>
                    {activationResult && (
                      <LicenseStatusBadge valid={activationResult.valid} tier={activationResult.tier} />
                    )}
                    <AdminButton
                      hasPassword={!needsSetup}
                      onChangePassword={handleChangeAdminPassword}
                      onSetPassword={handleSetAdminPassword}
                      onLogout={handleAdminLogout}
                      onResetSetup={() => {
                        updateConfig({ setupComplete: false })
                      }}
                      siteConfig={data}
                      onUpdateSiteConfig={(key, value) => updateConfig({ [key]: value })}
                      onImportData={(imported) => setConfig(imported)}
                      onOpenDialog={setActiveDialog}
                      isPrimary={isPrimary}
                      openHubOnMount={openAdminHubOnMount}
                    />
                  </Suspense>
                </div>
              )}

              <Suspense fallback={<CyberSpinner />}>
                <AdminDialogManager
                  activeDialog={activeDialog}
                  setActiveDialog={setActiveDialog}
                  showAttackerProfile={showAttackerProfile}
                  setShowAttackerProfile={setShowAttackerProfile}
                  selectedAttackerIp={selectedAttackerIp}
                  setSelectedAttackerIp={setSelectedAttackerIp}
                  isPrimary={isPrimary}
                  domain={data.domain}
                  configOverrides={data.configOverrides || {}}
                  onSaveConfigOverrides={(co) => updateConfig({ configOverrides: co })}
                  themeSettings={data.themeSettings}
                  onSaveTheme={(ts: ThemeSettings) => updateConfig({ themeSettings: ts })}
                  sectionVisibility={data.sectionVisibility}
                  onSaveSectionVisibility={(sv: SectionVisibility) => updateConfig({ sectionVisibility: sv })}
                  terminalCommands={data.terminalCommands || []}
                  secretCode={data.secretCode}
                  terminalMorseCode={data.terminalMorseCode}
                  defaultMorseCode={defaultSiteConfig.terminalMorseCode || '...'}
                  onSaveTerminal={(tc, sc, mc) => updateConfig({
                    terminalCommands: tc,
                    secretCode: sc,
                    terminalMorseCode: mc?.trim() || defaultSiteConfig.terminalMorseCode || '...',
                  })}
                  soundSettings={data.soundSettings}
                  onSaveSoundSettings={(ss: SoundSettings) => updateConfig({ soundSettings: ss })}
                  widgetPlugins={data.widgetPlugins ?? []}
                  onUpdatePlugins={(wp) => updateConfig({ widgetPlugins: wp })}
                  activePresetId={data.themeSettings?.activePreset}
                  activationResult={activationResult}
                  newsletterSettings={data.newsletterSettings}
                  contactSettings={data.contactSettings}
                  onSaveNewsletter={(ns) => updateConfig({ newsletterSettings: ns })}
                  onSaveContact={(cs) => updateConfig({ contactSettings: cs })}
                  themeAccessOverrides={data.themeAccessOverrides}
                  onSaveThemeAccessOverrides={(tao) => updateConfig({ themeAccessOverrides: tao })}
                  siteConfig={data}
                  onUpdateSiteConfig={(key, value) => updateConfig({ [key]: value })}
                  sections={data.sections}
                  onSaveSections={(sections) => updateConfig({ sections, sectionOrder: sections.map(s => s.id) })}
                />
              </Suspense>
            </motion.div>
          </motion.div>
        </>
      )}

      <Suspense fallback={null}>
        <AdminLoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} mode="login" totpEnabled={totpEnabled} onLogin={handleAdminLogin} onSetPassword={handleSetAdminPassword} />
        <AdminLoginDialog open={showSetupDialog} onOpenChange={setShowSetupDialog} mode="setup" setupTokenRequired={setupTokenRequired} onSetPassword={handleSetupAdminPassword} />
      </Suspense>
      <Suspense fallback={null}>
        <BandInfoEditDialog
          open={showBandInfoEdit}
          onOpenChange={setShowBandInfoEdit}
          name={data.siteName}
          genres={data.genres}
          label={data.label}
          logoUrl={data.logoUrl}
          titleImageUrl={data.titleImageUrl}
          onSave={({ name, genres, label, logoUrl, titleImageUrl }) =>
            updateConfig({ siteName: name, genres, label, logoUrl, titleImageUrl })
          }
        />
      </Suspense>
      <ThemeOverlayModal
        overlay={cyberpunkOverlay as OverlayModalSlotProps['overlay']}
        onClose={() => {
          // Reset news URL hash when closing a news overlay
          if (cyberpunkOverlay?.type === 'news') {
            window.history.replaceState(null, '', '#news')
          }
          setCyberpunkOverlay(null)
        }}
        sectionLabels={data.sectionLabels}
        themeSettings={config.themeSettings}
        activeThemePkg={getTheme(config.themeSettings?.activePreset ?? '')}
      />
    </ThemeProvider>
  )
}

export default App
