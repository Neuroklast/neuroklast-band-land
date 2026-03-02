import { useSiteConfig } from '@/hooks/use-site-config'
import { useEffect, useRef, useState, useMemo, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { PencilSimple } from '@phosphor-icons/react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import BandInfoEditDialog from '@/components/BandInfoEditDialog'
import NewsSection from '@/components/NewsSection'
import BiographySection from '@/components/BiographySection'
import GigsSection from '@/components/GigsSection'
import ReleasesSection from '@/components/ReleasesSection'
import MediaSection from '@/components/MediaSection'
import SocialSection from '@/components/SocialSection'
import PartnersAndFriendsSection from '@/components/PartnersAndFriendsSection'
import InstagramGallery from '@/components/InstagramGallery'
import Footer from '@/components/Footer'
import EditControls from '@/components/EditControls'
import AdminLoginDialog from '@/components/AdminLoginDialog'
import CyberpunkLoader from '@/components/CyberpunkLoader'
import CyberpunkBackground from '@/components/CyberpunkBackground'
import AudioVisualizer from '@/components/AudioVisualizer'
import SecretTerminal from '@/components/SecretTerminal'
import TerminalSettingsDialog from '@/components/TerminalSettingsDialog'
import ImpressumWindow from '@/components/ImpressumWindow'
import DatenschutzWindow from '@/components/DatenschutzWindow'
import CookieBanner from '@/components/CookieBanner'
import KonamiListener from '@/components/KonamiListener'
import SoundSettingsDialog from '@/components/SoundSettingsDialog'
import ConfigEditorDialog from '@/components/ConfigEditorDialog'
import ThemeCustomizerDialog, { applyThemeToDOM } from '@/components/ThemeCustomizerDialog'
import OverlayEffectsLayer from '@/components/OverlayEffectsLayer'
import StatsDashboard from '@/components/StatsDashboard'
import SecurityIncidentsDashboard from '@/components/SecurityIncidentsDashboard'
import SecuritySettingsDialog from '@/components/SecuritySettingsDialog'
import BlocklistManagerDialog from '@/components/BlocklistManagerDialog'
import AttackerProfileDialog from '@/components/AttackerProfileDialog'
import AttackerProfilesOverview from '@/components/AttackerProfilesOverview'
import { MovingScanline } from '@/components/MovingScanline'
import { SystemMonitorHUD } from '@/components/SystemMonitorHUD'
import NewsletterWidget from '@/components/NewsletterWidget'
import ContactSection from '@/components/ContactSection'
import ContactInboxDialog from '@/components/ContactInboxDialog'
import SubscriberListDialog from '@/components/SubscriberListDialog'
import MarketingToolsDialog from '@/components/MarketingToolsDialog'
import { useSound } from '@/hooks/use-sound'
import { useCRTEffects } from '@/hooks/use-crt-effects'
import { trackPageView, trackInteraction, trackClick } from '@/lib/analytics'
import type { SiteConfig, FontSizeSettings, SectionLabels, SoundSettings, ThemeSettings, SectionVisibility, AdminDialog } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'
import { DEFAULT_LABEL, applyConfigOverrides } from '@/lib/config'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { useOverlayState } from '@/hooks/use-overlay-state'
import CyberpunkOverlayModal from '@/components/CyberpunkOverlayModal'
import { createSiteConfig } from '@/lib/site-config'

const defaultSiteConfig: SiteConfig = createSiteConfig({
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
    achievements: bandDataJson.biography.achievements
  },
  terminalCommands: [
    { name: 'status', description: 'System status', output: ['SYSTEM STATUS:', '  AUDIO ENGINE: ACTIVE', '  HUD SYSTEMS: OPERATIONAL', '  THREAT LEVEL: CLASSIFIED'] },
    { name: 'info', description: 'Band information', output: ['SYSTEM INFO', 'LOCATION: CLASSIFIED', 'FREQUENCY: 150+ BPM'] },
  ],
  terminalMorseCode: '...',
})

/**
 * Collect a small set of critical image URLs for preloading during the
 * initial loading screen.  Only the first few news images and member
 * photos are included — everything else is lazy-loaded when the user
 * scrolls to keep mobile data usage and memory consumption low.
 */
const MAX_PRECACHE_IMAGES = 6

function collectImageUrls(data: SiteConfig): string[] {
  const urls: string[] = []
  // Preload first few news images (visible above the fold)
  data.news?.slice(0, 3).forEach(item => { if (item.photo) urls.push(item.photo) })
  // Preload member photos (biography section)
  data.biography?.members?.forEach(member => {
    if (typeof member !== 'string' && member.photo) urls.push(member.photo)
  })
  return urls.slice(0, MAX_PRECACHE_IMAGES)
}

function App() {
  const { config, updateConfig, setConfig, isLoaded: siteConfigLoaded } = useSiteConfig()
  const { isOwner, needsSetup, totpEnabled, setupTokenRequired, handleAdminLogin, handleAdminLogout, handleSetAdminPassword, handleSetupAdminPassword, handleChangeAdminPassword } = useAdminAuth()
  const { cyberpunkOverlay, setCyberpunkOverlay, overlayPhase, loadingText, overlayAnimation } = useOverlayState()
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeDialog, setActiveDialog] = useState<AdminDialog>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showBandInfoEdit, setShowBandInfoEdit] = useState(false)
  const [impressumOpen, setImpressumOpen] = useState(false)
  const [datenschutzOpen, setDatenschutzOpen] = useState(false)
  const [showAttackerProfile, setShowAttackerProfile] = useState(false)
  const [selectedAttackerIp, setSelectedAttackerIp] = useState<string>('')

  // Apply CRT effects
  useCRTEffects()

  // Track page view on mount
  useEffect(() => {
    trackPageView()
  }, [])

  // Track all clicks for heatmap
  useEffect(() => {
    const handler = (e: MouseEvent) => trackClick(e)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Check for ?admin-setup URL parameter on mount (before it gets cleaned)
  const wantsSetup = useRef(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('admin-setup')) {
      wantsSetup.current = true
      // Clean up URL immediately
      const url = new URL(window.location.href)
      url.searchParams.delete('admin-setup')
      window.history.replaceState({}, '', url.toString())
    }
    // Secret terminal access via URL
    if (params.has('access-secret-terminal-NK-666')) {
      startTransition(() => setActiveDialog('secret-terminal'))
      const url = new URL(window.location.href)
      url.searchParams.delete('access-secret-terminal-NK-666')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // Open setup dialog once auth check confirms no password exists
  useEffect(() => {
    if (wantsSetup.current && needsSetup) {
      wantsSetup.current = false
      startTransition(() => setShowSetupDialog(true))
    }
  }, [needsSetup])

  const handleFontSizeChange = (key: keyof FontSizeSettings, value: string) => {
    updateConfig({ fontSizes: { ...config.fontSizes, [key]: value } })
  }

  const handleLabelChange = (key: keyof SectionLabels, value: string) => {
    updateConfig({ sectionLabels: { ...config.sectionLabels, [key]: value } })
  }

  const handleTerminalActivation = () => {
    setActiveDialog('secret-terminal')
    trackInteraction('terminal_activated')
    toast.success('TERMINAL ACCESS GRANTED', {
      description: 'Secret code activated'
    })
  }

  const data = { ...defaultSiteConfig, ...config }
  const safeSocialLinks = data.socialLinks || defaultSiteConfig.socialLinks
  const precacheUrls = useMemo(() => collectImageUrls(data), [config])
  const { play: playSound, muted: _soundMuted, toggleMute: _toggleSoundMute, hasSounds: _hasSounds } = useSound(data.soundSettings, editMode)

  // Apply config overrides whenever bandData changes
  useEffect(() => {
    applyConfigOverrides(data.configOverrides)
  }, [data.configOverrides])

  // Apply theme settings to DOM whenever they change
  useEffect(() => {
    applyThemeToDOM(data.themeSettings)
  }, [data.themeSettings])

  // Apply CRT overlay/vignette opacity from animation settings
  useEffect(() => {
    const a = data.animations
    const root = document.documentElement
    if (typeof a?.crtOverlayOpacity === 'number') {
      root.style.setProperty('--crt-overlay-opacity', String(a.crtOverlayOpacity))
    }
    if (typeof a?.crtVignetteOpacity === 'number') {
      root.style.setProperty('--crt-vignette-opacity', String(a.crtVignetteOpacity))
    }
    return () => {
      root.style.removeProperty('--crt-overlay-opacity')
      root.style.removeProperty('--crt-vignette-opacity')
    }
  }, [data.animations?.crtOverlayOpacity, data.animations?.crtVignetteOpacity])

  const vis = data.sectionVisibility || {}

  return (
    <>
      {/* Skip navigation link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-to-main">
        Zum Hauptinhalt springen
      </a>
      <KonamiListener onCodeActivated={handleTerminalActivation} customCode={data.secretCode} />
      <SecretTerminal
        isOpen={activeDialog === 'secret-terminal'}
        onClose={() => setActiveDialog(null)}
        customCommands={data.terminalCommands || []}
        secretCode={data.secretCode}
        siteName={data.siteName}
        editMode={editMode && isOwner}
        onSaveCommands={(terminalCommands) => updateConfig({ terminalCommands })}
        onSaveSecretCode={(secretCode) => updateConfig({ secretCode })}
      />
      <ImpressumWindow
        isOpen={impressumOpen}
        onClose={() => setImpressumOpen(false)}
        impressum={data.impressum}
        editMode={editMode && isOwner}
        onSave={(impressum) => updateConfig({ impressum })}
      />
      <DatenschutzWindow
        isOpen={datenschutzOpen}
        onClose={() => setDatenschutzOpen(false)}
        datenschutz={data.datenschutz}
        impressumName={data.impressum?.name}
        editMode={editMode && isOwner}
        onSave={(datenschutz) => updateConfig({ datenschutz })}
      />
      <CookieBanner />
      
      {/* CRT/Monitor Effects */}
      {vis.scanline !== false && <MovingScanline />}
      {vis.systemMonitor !== false && <SystemMonitorHUD />}
      <OverlayEffectsLayer effects={data.themeSettings?.overlayEffects} />
      
      <AnimatePresence>
        {loading && (
          <CyberpunkLoader 
            precacheUrls={precacheUrls}
            siteName={data.siteName}
            onLoadComplete={() => {
              playSound('loadingFinished')
              setLoading(false)
            }} 
          />
        )}
      </AnimatePresence>

      {!loading && (
        <>
          <Navigation
            siteName={data.siteName}
            sectionLabels={data.sectionLabels}
            terminalMorseCode={data.terminalMorseCode || defaultSiteConfig.terminalMorseCode}
            onTerminalActivation={handleTerminalActivation}
          />
          
          <motion.div 
            className="min-h-screen bg-background text-foreground overflow-x-hidden relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {vis.audioVisualizer !== false && <AudioVisualizer />}
            
            <div className="fixed inset-0 pointer-events-none z-[100]">
              <div className="absolute inset-0 hud-scanline opacity-30" />
            </div>
            
            {vis.hudBackground !== false && <CyberpunkBackground hudTexts={data.hudTexts} siteName={data.siteName} />}
            <Toaster position="top-right" />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Edit Mode Banner */}
            <AnimatePresence>
              {editMode && isOwner && (
                <motion.div
                  className="fixed top-0 left-0 right-0 z-40 bg-primary/20 backdrop-blur-sm border-b border-primary/40"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
                    <PencilSimple size={16} weight="bold" className="text-primary" />
                    <span className="text-xs md:text-sm font-mono text-primary tracking-wider">
                      EDIT MODE ACTIVE — click any section to edit
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Hero 
              name={data.siteName} 
              genres={data.genres}
              editMode={editMode && isOwner}
              onEdit={() => setShowBandInfoEdit(true)}
              logoUrl={data.logoUrl}
              titleImageUrl={data.titleImageUrl}
            />

            <main id="main-content" className="relative">
              {vis.news !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <NewsSection
                  news={data.news}
                  editMode={editMode && isOwner}
                  onUpdate={(news) => updateConfig({ news })}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                />
              </motion.div>
              )}

              {vis.biography !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <BiographySection
                  biography={data.biography}
                  editMode={editMode && isOwner}
                  onUpdate={(biography) => updateConfig({ biography })}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                  siteName={data.siteName}
                  onMemberClick={(member) => setCyberpunkOverlay({ type: 'member', data: member })}
                />
              </motion.div>
              )}

              {vis.gallery !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <InstagramGallery
                  galleryImages={data.galleryImages}
                  editMode={editMode && isOwner}
                  onUpdate={(galleryImages) => updateConfig({ galleryImages })}
                  driveFolderUrl={data.galleryDriveFolderUrl}
                  onDriveFolderUrlChange={(galleryDriveFolderUrl) => updateConfig({ galleryDriveFolderUrl })}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                  siteName={data.siteName}
                />
              </motion.div>
              )}

              {vis.gigs !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <GigsSection 
                  gigs={data.gigs}
                  editMode={editMode && isOwner}
                  onUpdate={(gigs) => updateConfig({ gigs })}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  dataLoaded={siteConfigLoaded}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                  onGigClick={(gig) => setCyberpunkOverlay({ type: 'gig', data: gig })}
                />
              </motion.div>
              )}

              {(data.newsletterSettings?.showAfterGigs !== false && data.newsletterSettings?.enabled) && (
                <div className="py-8 px-4 max-w-2xl mx-auto">
                  <NewsletterWidget
                    enabled={data.newsletterSettings?.enabled}
                    title={data.newsletterSettings?.title}
                    description={data.newsletterSettings?.description}
                    placeholder={data.newsletterSettings?.placeholder}
                    buttonText={data.newsletterSettings?.buttonText}
                    source="gigs-section"
                  />
                </div>
              )}

              {vis.releases !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <ReleasesSection 
                  releases={data.releases}
                  editMode={editMode && isOwner}
                  onUpdate={(releases) => updateConfig({ releases })}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  dataLoaded={siteConfigLoaded}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                  siteName={data.siteName}
                  onReleaseClick={(release) => setCyberpunkOverlay({ type: 'release', data: release })}
                />
              </motion.div>
              )}

              {vis.media !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                <MediaSection
                  mediaFiles={data.mediaFiles}
                  editMode={editMode && isOwner}
                  onUpdate={(mediaFiles) => updateConfig({ mediaFiles })}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                />
              </motion.div>
              )}

              {vis.social !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <SocialSection 
                  socialLinks={safeSocialLinks}
                  editMode={editMode && isOwner}
                  onUpdate={(socialLinks) => updateConfig({ socialLinks })}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                />
              </motion.div>
              )}

              {(vis.contact !== false || (editMode && isOwner)) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.45 }}
              >
                <ContactSection
                  contactSettings={data.contactSettings}
                  editMode={editMode && isOwner}
                  onUpdate={(contactSettings) => updateConfig({ contactSettings })}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                />
              </motion.div>
              )}

              {vis.partnersAndFriends !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <PartnersAndFriendsSection
                  friends={data.biography?.friends}
                  editMode={editMode && isOwner}
                  onUpdate={(friends) => updateConfig({
                    biography: { ...(data.biography || { story: '', members: [], achievements: [] }), friends }
                  })}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
                />
              </motion.div>
              )}
            </main>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <Footer 
                socialLinks={safeSocialLinks} 
                genres={data.genres}
                label={data.label}
                siteName={data.siteName}
                onAdminLogin={!isOwner && !needsSetup ? () => setShowLoginDialog(true) : undefined}
                onImpressum={() => {
                  if (editMode && isOwner) {
                    setImpressumOpen(true)
                  } else if (data.impressum) {
                    setCyberpunkOverlay({ type: 'impressum', data: data.impressum })
                  } else {
                    setImpressumOpen(true)
                  }
                }}
                onDatenschutz={() => setDatenschutzOpen(true)}
              />
            </motion.div>

            {data.newsletterSettings?.showInFooter && data.newsletterSettings?.enabled && (
              <div className="py-8 px-4 max-w-2xl mx-auto">
                <NewsletterWidget
                  enabled={data.newsletterSettings?.enabled}
                  title={data.newsletterSettings?.title}
                  description={data.newsletterSettings?.description}
                  placeholder={data.newsletterSettings?.placeholder}
                  buttonText={data.newsletterSettings?.buttonText}
                  source="footer"
                />
              </div>
            )}

            {isOwner && (
              <EditControls 
                editMode={editMode}
                onToggleEdit={() => setEditMode(!editMode)}
                hasPassword={!needsSetup}
                onChangePassword={handleChangeAdminPassword}
                onSetPassword={handleSetAdminPassword}
                onLogout={async () => { await handleAdminLogout(); setEditMode(false) }}
                siteConfig={data}
                onImportData={(imported) => setConfig(imported)}
                onOpenDialog={setActiveDialog}
              />
            )}

            <StatsDashboard open={activeDialog === 'analytics'} onClose={() => setActiveDialog(null)} domain={data.domain} />
            <SecurityIncidentsDashboard 
              open={activeDialog === 'security-log'} 
              onClose={() => setActiveDialog(null)} 
              onViewProfile={(hashedIp) => {
                setSelectedAttackerIp(hashedIp)
                setShowAttackerProfile(true)
              }}
            />
            <SecuritySettingsDialog open={activeDialog === 'security-settings'} onClose={() => setActiveDialog(null)} />
            <BlocklistManagerDialog open={activeDialog === 'blocklist'} onClose={() => setActiveDialog(null)} />
            <AttackerProfileDialog 
              open={showAttackerProfile} 
              onClose={() => setShowAttackerProfile(false)} 
              hashedIp={selectedAttackerIp}
            />
            <AttackerProfilesOverview
              open={activeDialog === 'attacker-profiles'}
              onClose={() => setActiveDialog(null)}
              onViewProfile={(hashedIp) => {
                setSelectedAttackerIp(hashedIp)
                setShowAttackerProfile(true)
              }}
            />
            <ContactInboxDialog open={activeDialog === 'inbox'} onClose={() => setActiveDialog(null)} />
            <SubscriberListDialog open={activeDialog === 'subscribers'} onClose={() => setActiveDialog(null)} />
            <MarketingToolsDialog
              open={activeDialog === 'marketing'}
              onClose={() => setActiveDialog(null)}
              newsletterSettings={data.newsletterSettings}
              contactSettings={data.contactSettings}
              onSaveNewsletter={(newsletterSettings) => updateConfig({ newsletterSettings })}
              onSaveContact={(contactSettings) => updateConfig({ contactSettings })}
            />

            <AnimatePresence>
              {activeDialog === 'sound' && (
                <SoundSettingsDialog
                  settings={data.soundSettings}
                  onSave={(soundSettings: SoundSettings) => updateConfig({ soundSettings })}
                  onClose={() => setActiveDialog(null)}
                />
              )}
            </AnimatePresence>

            <ConfigEditorDialog
              open={activeDialog === 'config'}
              onClose={() => setActiveDialog(null)}
              overrides={data.configOverrides || {}}
              onSave={(configOverrides) => updateConfig({ configOverrides })}
            />

            <ThemeCustomizerDialog
              open={activeDialog === 'design'}
              onClose={() => setActiveDialog(null)}
              themeSettings={data.themeSettings}
              onSaveTheme={(themeSettings: ThemeSettings) => updateConfig({ themeSettings })}
              sectionVisibility={data.sectionVisibility}
              onSaveSectionVisibility={(sectionVisibility: SectionVisibility) => updateConfig({ sectionVisibility })}
            />

            <TerminalSettingsDialog
              open={activeDialog === 'terminal'}
              onClose={() => setActiveDialog(null)}
              commands={data.terminalCommands || []}
              secretCode={data.secretCode || []}
              morseCode={data.terminalMorseCode || '...'}
              onSave={(terminalCommands, secretCode, terminalMorseCode) =>
                updateConfig({ terminalCommands, secretCode, terminalMorseCode: terminalMorseCode?.trim() || defaultSiteConfig.terminalMorseCode || '...' })
              }
            />

            <AdminLoginDialog
              open={showLoginDialog}
              onOpenChange={setShowLoginDialog}
              mode="login"
              totpEnabled={totpEnabled}
              onLogin={handleAdminLogin}
              onSetPassword={handleSetAdminPassword}
            />

            <AdminLoginDialog
              open={showSetupDialog}
              onOpenChange={setShowSetupDialog}
              mode="setup"
              setupTokenRequired={setupTokenRequired}
              onSetPassword={handleSetupAdminPassword}
            />

            <BandInfoEditDialog
              open={showBandInfoEdit}
              onOpenChange={setShowBandInfoEdit}
              name={data.siteName}
              genres={data.genres}
              label={data.label}
              logoUrl={data.logoUrl}
              titleImageUrl={data.titleImageUrl}
              onSave={({ name, genres, label, logoUrl, titleImageUrl }) => updateConfig({ siteName: name, genres, label, logoUrl, titleImageUrl })}
            />
          </motion.div>
          </motion.div>
        </>
      )}

      {/* Cyberpunk 3-phase overlay modal — member / release / gig / impressum */}
      <CyberpunkOverlayModal
        overlay={cyberpunkOverlay}
        phase={overlayPhase}
        loadingText={loadingText}
        animation={overlayAnimation}
        onClose={() => setCyberpunkOverlay(null)}
        sectionLabels={data.sectionLabels}
      />
    </>
  )
}

export default App
