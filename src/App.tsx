import { useKV } from '@/hooks/use-kv'
import { useEffect, useRef, useState, useMemo } from 'react'
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
import { MovingScanline } from '@/components/MovingScanline'
import { SystemMonitorHUD } from '@/components/SystemMonitorHUD'
import NewsletterWidget from '@/components/NewsletterWidget'
import { useSound } from '@/hooks/use-sound'
import { useCRTEffects } from '@/hooks/use-crt-effects'
import { trackPageView, trackInteraction, trackClick } from '@/lib/analytics'
import type { BandData, FontSizeSettings, SectionLabels, SoundSettings, ThemeSettings, SectionVisibility } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'
import { DEFAULT_LABEL, applyConfigOverrides } from '@/lib/config'

const defaultBandData: BandData = {
  name: bandDataJson.band.name,
  genres: bandDataJson.band.genres,
  label: bandDataJson.band.label || DEFAULT_LABEL,
  socialLinks: {
    instagram: 'https://instagram.com/neuroklast_music',
    facebook: 'https://www.facebook.com/Neuroklast/',
    spotify: 'https://open.spotify.com/intl-de/artist/5xfQSijbVetvH1QAS58n30',
    soundcloud: 'https://soundcloud.com/neuroklast',
    youtube: 'https://youtube.com/@neuroklast',
    bandcamp: 'https://neuroklast.bandcamp.com',
    linktr: 'https://linktr.ee/neuroklast'
  },
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
    { name: 'info', description: 'Band information', output: ['NEUROKLAST - HARD TECHNO · INDUSTRIAL · DNB · DARK ELECTRO', 'LABEL: DARKTUNES MUSIC GROUP', 'LOCATION: CLASSIFIED', 'FREQUENCY: 150+ BPM'] },
  ],
  terminalMorseCode: '...',
}

/**
 * Collect a small set of critical image URLs for preloading during the
 * initial loading screen.  Only the first few news images and member
 * photos are included — everything else is lazy-loaded when the user
 * scrolls to keep mobile data usage and memory consumption low.
 */
const MAX_PRECACHE_IMAGES = 6

function collectImageUrls(data: BandData): string[] {
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
  const [bandData, setBandData, bandDataLoaded] = useKV<BandData>('band-data', defaultBandData, {
    onSaveResult: (result) => {
      if (result.ok) return // success is logged to console by useKV; no toast to avoid noise
      if (result.status === 403) {
        toast.error('Not saved globally — admin login required', { id: 'kv-save-403' })
      } else if (result.status === 503) {
        toast.error('KV not configured — data saved locally only', { id: 'kv-save-503' })
      } else if (result.status === 0) {
        toast.error('Not saved globally — network error', { id: 'kv-save-net' })
      } else {
        toast.error(`Global save failed (${result.status})`, { id: 'kv-save-err' })
      }
    },
  })
  const [isOwner, setIsOwner] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [setupTokenRequired, setSetupTokenRequired] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showBandInfoEdit, setShowBandInfoEdit] = useState(false)
  const [impressumOpen, setImpressumOpen] = useState(false)
  const [datenschutzOpen, setDatenschutzOpen] = useState(false)
  const [showSoundSettings, setShowSoundSettings] = useState(false)
  const [showConfigEditor, setShowConfigEditor] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showSecurityIncidents, setShowSecurityIncidents] = useState(false)
  const [showSecuritySettings, setShowSecuritySettings] = useState(false)
  const [showBlocklist, setShowBlocklist] = useState(false)
  const [showAttackerProfile, setShowAttackerProfile] = useState(false)
  const [selectedAttackerIp, setSelectedAttackerIp] = useState<string>('')
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false)
  const [showTerminalSettings, setShowTerminalSettings] = useState(false)

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
      setTerminalOpen(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('access-secret-terminal-NK-666')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // Check auth status on mount via cookie-based session
  useEffect(() => {
    fetch('/api/auth', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.authenticated) setIsOwner(true)
          setNeedsSetup(data.needsSetup)
          setTotpEnabled(data.totpEnabled || false)
          setSetupTokenRequired(data.setupTokenRequired || false)
        }
      })
      .catch(() => { /* ignore — local dev without API */ })
  }, [])

  // Open setup dialog once auth check confirms no password exists
  useEffect(() => {
    if (wantsSetup.current && needsSetup) {
      wantsSetup.current = false
      setShowSetupDialog(true)
    }
  }, [needsSetup])

  const handleAdminLogin = async (password: string, totpCode?: string): Promise<boolean | 'totp-required'> => {
    try {
      const body: Record<string, string> = { password }
      if (totpCode) body.totpCode = totpCode
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setIsOwner(true)
        setNeedsSetup(false)
        return true
      }
      const data = await res.json().catch(() => ({}))
      if (data.totpRequired) return 'totp-required'
      return false
    } catch {
      return false
    }
  }

  const handleFontSizeChange = (key: keyof FontSizeSettings, value: string) => {
    setBandData((current) => ({
      ...(current || defaultBandData),
      fontSizes: { ...(current || defaultBandData).fontSizes, [key]: value }
    }))
  }

  const handleLabelChange = (key: keyof SectionLabels, value: string) => {
    setBandData((current) => ({
      ...(current || defaultBandData),
      sectionLabels: { ...(current || defaultBandData).sectionLabels, [key]: value }
    }))
  }

  const handleSetAdminPassword = async (password: string, setupToken?: string): Promise<void> => {
    const body: Record<string, string> = { password, action: 'setup' }
    if (setupToken) body.setupToken = setupToken
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to set password')
    }
    setNeedsSetup(false)
  }

  const handleSetupAdminPassword = async (password: string, setupToken?: string): Promise<void> => {
    await handleSetAdminPassword(password, setupToken)
    setIsOwner(true)
  }

  const handleChangeAdminPassword = async (password: string): Promise<void> => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ newPassword: password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to change password')
    }
  }

  const handleAdminLogout = async (): Promise<void> => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
        credentials: 'same-origin',
      })
    } catch { /* ignore */ }
    setIsOwner(false)
    setEditMode(false)
  }

  const handleTerminalActivation = () => {
    setTerminalOpen(true)
    trackInteraction('terminal_activated')
    toast.success('TERMINAL ACCESS GRANTED', {
      description: 'Secret code activated'
    })
  }

  const data = bandData ? { ...defaultBandData, ...bandData } : defaultBandData
  const safeSocialLinks = data.socialLinks || defaultBandData.socialLinks
  const precacheUrls = useMemo(() => bandData ? collectImageUrls(bandData) : [], [bandData])
  const { play: playSound, muted: soundMuted, toggleMute: toggleSoundMute, hasSounds } = useSound(data.soundSettings, editMode)

  // Apply config overrides whenever bandData changes
  useEffect(() => {
    applyConfigOverrides(data.configOverrides)
  }, [data.configOverrides])

  // Apply theme settings to DOM whenever they change
  useEffect(() => {
    applyThemeToDOM(data.themeSettings)
  }, [data.themeSettings])

  const vis = data.sectionVisibility || {}

  return (
    <>
      <KonamiListener onCodeActivated={handleTerminalActivation} customCode={data.secretCode} />
      <SecretTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        customCommands={data.terminalCommands || []}
        secretCode={data.secretCode}
        editMode={editMode && isOwner}
        onSaveCommands={(terminalCommands) => setBandData((current) => ({ ...(current || defaultBandData), terminalCommands }))}
        onSaveSecretCode={(secretCode) => setBandData((current) => ({ ...(current || defaultBandData), secretCode }))}
      />
      <ImpressumWindow
        isOpen={impressumOpen}
        onClose={() => setImpressumOpen(false)}
        impressum={data.impressum}
        editMode={editMode && isOwner}
        onSave={(impressum) => setBandData((current) => ({ ...(current || defaultBandData), impressum }))}
      />
      <DatenschutzWindow
        isOpen={datenschutzOpen}
        onClose={() => setDatenschutzOpen(false)}
        datenschutz={data.datenschutz}
        impressumName={data.impressum?.name}
        editMode={editMode && isOwner}
        onSave={(datenschutz) => setBandData((current) => ({ ...(current || defaultBandData), datenschutz }))}
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
            sectionLabels={data.sectionLabels}
            terminalMorseCode={data.terminalMorseCode || defaultBandData.terminalMorseCode}
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
            
            {vis.hudBackground !== false && <CyberpunkBackground hudTexts={data.hudTexts} />}
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
              name={data.name} 
              genres={data.genres}
              editMode={editMode && isOwner}
              onEdit={() => setShowBandInfoEdit(true)}
              logoUrl={data.logoUrl}
              titleImageUrl={data.titleImageUrl}
            />

            <main className="relative">
              {vis.news !== false && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <NewsSection
                  news={data.news}
                  editMode={editMode && isOwner}
                  onUpdate={(news) => setBandData((current) => ({ ...(current || defaultBandData), news }))}
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
                  onUpdate={(biography) => setBandData((current) => ({ ...(current || defaultBandData), biography }))}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
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
                  onUpdate={(galleryImages) => setBandData((current) => ({ ...(current || defaultBandData), galleryImages }))}
                  driveFolderUrl={data.galleryDriveFolderUrl}
                  onDriveFolderUrlChange={(url) => setBandData((current) => ({ ...(current || defaultBandData), galleryDriveFolderUrl: url }))}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
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
                  onUpdate={(gigs) => setBandData((current) => ({ ...(current || defaultBandData), gigs }))}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  dataLoaded={bandDataLoaded}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
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
                  onUpdate={(releases) => setBandData((current) => ({ ...(current || defaultBandData), releases }))}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
                  dataLoaded={bandDataLoaded}
                  sectionLabels={data.sectionLabels}
                  onLabelChange={handleLabelChange}
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
                  onUpdate={(mediaFiles) => setBandData((current) => ({ ...(current || defaultBandData), mediaFiles }))}
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
                  onUpdate={(socialLinks) => setBandData((current) => ({ ...(current || defaultBandData), socialLinks }))}
                  fontSizes={data.fontSizes}
                  onFontSizeChange={handleFontSizeChange}
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
                  onUpdate={(friends) => setBandData((current) => ({
                    ...(current || defaultBandData),
                    biography: { ...(current || defaultBandData).biography!, friends }
                  }))}
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
                onAdminLogin={!isOwner && !needsSetup ? () => setShowLoginDialog(true) : undefined}
                onImpressum={() => setImpressumOpen(true)}
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
                onLogout={handleAdminLogout}
                bandData={data}
                onImportData={(imported) => setBandData(imported)}
                onOpenSoundSettings={() => setShowSoundSettings(true)}
                onOpenConfigEditor={() => setShowConfigEditor(true)}
                onOpenAnalytics={() => setShowStats(true)}
                onOpenSecurityLog={() => setShowSecurityIncidents(true)}
                onOpenSecuritySettings={() => setShowSecuritySettings(true)}
                onOpenBlocklist={() => setShowBlocklist(true)}
                onOpenThemeCustomizer={() => setShowThemeCustomizer(true)}
                onOpenTerminalSettings={() => setShowTerminalSettings(true)}
                onOpenTerminal={() => setTerminalOpen(true)}
              />
            )}

            <StatsDashboard open={showStats} onClose={() => setShowStats(false)} />
            <SecurityIncidentsDashboard 
              open={showSecurityIncidents} 
              onClose={() => setShowSecurityIncidents(false)} 
              onViewProfile={(hashedIp) => {
                setSelectedAttackerIp(hashedIp)
                setShowAttackerProfile(true)
              }}
            />
            <SecuritySettingsDialog open={showSecuritySettings} onClose={() => setShowSecuritySettings(false)} />
            <BlocklistManagerDialog open={showBlocklist} onClose={() => setShowBlocklist(false)} />
            <AttackerProfileDialog 
              open={showAttackerProfile} 
              onClose={() => setShowAttackerProfile(false)} 
              hashedIp={selectedAttackerIp}
            />

            <AnimatePresence>
              {showSoundSettings && (
                <SoundSettingsDialog
                  settings={data.soundSettings}
                  onSave={(soundSettings: SoundSettings) => setBandData((current) => ({ ...(current || defaultBandData), soundSettings }))}
                  onClose={() => setShowSoundSettings(false)}
                />
              )}
            </AnimatePresence>

            <ConfigEditorDialog
              open={showConfigEditor}
              onClose={() => setShowConfigEditor(false)}
              overrides={data.configOverrides || {}}
              onSave={(configOverrides) => setBandData((current) => ({ ...(current || defaultBandData), configOverrides }))}
            />

            <ThemeCustomizerDialog
              open={showThemeCustomizer}
              onClose={() => setShowThemeCustomizer(false)}
              themeSettings={data.themeSettings}
              onSaveTheme={(themeSettings: ThemeSettings) => setBandData((current) => ({ ...(current || defaultBandData), themeSettings }))}
              sectionVisibility={data.sectionVisibility}
              onSaveSectionVisibility={(sectionVisibility: SectionVisibility) => setBandData((current) => ({ ...(current || defaultBandData), sectionVisibility }))}
            />

            <TerminalSettingsDialog
              open={showTerminalSettings}
              onClose={() => setShowTerminalSettings(false)}
              commands={data.terminalCommands || []}
              secretCode={data.secretCode || []}
              morseCode={data.terminalMorseCode || '...'}
              onSave={(terminalCommands, secretCode, terminalMorseCode) =>
                setBandData((current) => ({ ...(current || defaultBandData), terminalCommands, secretCode, terminalMorseCode: terminalMorseCode?.trim() || defaultBandData.terminalMorseCode || '...' }))
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
              name={data.name}
              genres={data.genres}
              label={data.label}
              logoUrl={data.logoUrl}
              titleImageUrl={data.titleImageUrl}
              onSave={({ name, genres, label, logoUrl, titleImageUrl }) => setBandData((current) => ({ ...(current || defaultBandData), name, genres, label, logoUrl, titleImageUrl }))}
            />
          </motion.div>
          </motion.div>
        </>
      )}
    </>
  )
}

export default App
