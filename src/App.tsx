import { useKV } from '@/hooks/use-kv'
import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
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
import AdminLoginDialog, { hashPassword } from '@/components/AdminLoginDialog'
import CyberpunkLoader from '@/components/CyberpunkLoader'
import CyberpunkBackground from '@/components/CyberpunkBackground'
import AudioVisualizer from '@/components/AudioVisualizer'
import SecretTerminal from '@/components/SecretTerminal'
import ImpressumWindow from '@/components/ImpressumWindow'
import DatenschutzWindow from '@/components/DatenschutzWindow'
import CookieBanner from '@/components/CookieBanner'
import KonamiListener from '@/components/KonamiListener'
import SoundSettingsDialog from '@/components/SoundSettingsDialog'
import ConfigEditorDialog from '@/components/ConfigEditorDialog'
import { useSound } from '@/hooks/use-sound'
import type { BandData, FontSizeSettings, SectionLabels, SoundSettings } from '@/lib/types'
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
  ]
}

/** Collect all image URLs from band data for background pre-caching */
function collectImageUrls(data: BandData): string[] {
  const urls: string[] = []
  if (data.galleryImages) {
    for (const img of data.galleryImages) {
      if (img.url) urls.push(img.url)
    }
  }
  if (data.biography?.members) {
    for (const member of data.biography.members) {
      if (typeof member === 'object' && member.photo) urls.push(member.photo)
    }
  }
  if (data.biography?.friends) {
    for (const friend of data.biography.friends) {
      if (friend.photo) urls.push(friend.photo)
      if (friend.iconPhoto) urls.push(friend.iconPhoto)
      if (friend.profilePhoto) urls.push(friend.profilePhoto)
    }
  }
  if (data.biography?.photos) {
    for (const photo of data.biography.photos) {
      if (photo) urls.push(photo)
    }
  }
  if (data.releases) {
    for (const release of data.releases) {
      if (release.artwork) urls.push(release.artwork)
    }
  }
  if (data.gigs) {
    for (const gig of data.gigs) {
      if (gig.photo) urls.push(gig.photo)
    }
  }
  if (data.news) {
    for (const item of data.news) {
      if (item.photo) urls.push(item.photo)
    }
  }
  return urls
}

function App() {
  const [bandData, setBandData, bandDataLoaded] = useKV<BandData>('band-data', defaultBandData)
  const [adminPasswordHash, setAdminPasswordHash] = useKV<string>('admin-password-hash', '')
  const [isOwner, setIsOwner] = useState(false)
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

  // Restore admin session from localStorage when the password hash loads.
  // This keeps admin mode alive across page reloads, tab closes, and deployments.
  useEffect(() => {
    if (!adminPasswordHash) return
    const storedToken = localStorage.getItem('admin-token')
    if (storedToken && storedToken === adminPasswordHash) {
      setIsOwner(true)
    }
  }, [adminPasswordHash])

  // Open setup dialog once KV data has loaded and confirms no password exists
  useEffect(() => {
    if (wantsSetup.current && adminPasswordHash !== undefined && !adminPasswordHash) {
      wantsSetup.current = false
      setShowSetupDialog(true)
    }
  }, [adminPasswordHash])

  const handleAdminLogin = async (password: string): Promise<boolean> => {
    const hash = await hashPassword(password)
    if (hash === adminPasswordHash) {
      localStorage.setItem('admin-token', hash)
      setIsOwner(true)
      return true
    }
    return false
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

  const handleSetAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    localStorage.setItem('admin-token', hash)
    setAdminPasswordHash(hash)
  }

  const handleSetupAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    localStorage.setItem('admin-token', hash)
    setAdminPasswordHash(hash)
    setIsOwner(true)
  }

  const handleChangeAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    // Persist to KV first while the OLD token is still in localStorage so
    // the server can authenticate the write against the existing hash.
    setAdminPasswordHash(hash)
    // Then update the stored token for future requests.
    localStorage.setItem('admin-token', hash)
  }

  const handleTerminalActivation = () => {
    setTerminalOpen(true)
    toast.success('TERMINAL ACCESS GRANTED', {
      description: 'Secret code activated'
    })
  }

  const data = bandData || defaultBandData
  const safeSocialLinks = data.socialLinks || defaultBandData.socialLinks
  const precacheUrls = useMemo(() => bandData ? collectImageUrls(bandData) : [], [bandData])
  const { play: playSound, muted: soundMuted, toggleMute: toggleSoundMute, hasSounds } = useSound(data.soundSettings, editMode)

  // Apply config overrides whenever bandData changes
  useEffect(() => {
    applyConfigOverrides(data.configOverrides)
  }, [data.configOverrides])

  return (
    <>
      <KonamiListener onCodeActivated={handleTerminalActivation} />
      <SecretTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        customCommands={data.terminalCommands || []}
        editMode={editMode && isOwner}
        onSaveCommands={(terminalCommands) => setBandData((current) => ({ ...(current || defaultBandData), terminalCommands }))}
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
        <motion.div 
          className="min-h-screen bg-background text-foreground overflow-x-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <AudioVisualizer />
          
          <div className="fixed inset-0 pointer-events-none z-[100]">
            <div className="absolute inset-0 hud-scanline opacity-30" />
          </div>
          
          <CyberpunkBackground />
          <Toaster position="top-right" />
          
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Navigation soundMuted={soundMuted} hasSounds={hasSounds} onToggleMute={toggleSoundMute} sectionLabels={data.sectionLabels} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Hero 
              name={data.name} 
              genres={data.genres}
              editMode={editMode && isOwner}
              onEdit={() => setShowBandInfoEdit(true)}
            />

            <main className="relative">
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
                onAdminLogin={!isOwner && adminPasswordHash ? () => setShowLoginDialog(true) : undefined}
                onImpressum={() => setImpressumOpen(true)}
                onDatenschutz={() => setDatenschutzOpen(true)}
              />
            </motion.div>

            {isOwner && (
              <EditControls 
                editMode={editMode}
                onToggleEdit={() => setEditMode(!editMode)}
                hasPassword={!!adminPasswordHash}
                onChangePassword={handleChangeAdminPassword}
                onSetPassword={handleSetAdminPassword}
                bandData={data}
                onImportData={(imported) => setBandData(imported)}
                onOpenSoundSettings={() => setShowSoundSettings(true)}
                onOpenConfigEditor={() => setShowConfigEditor(true)}
              />
            )}

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

            <AdminLoginDialog
              open={showLoginDialog}
              onOpenChange={setShowLoginDialog}
              mode="login"
              onLogin={handleAdminLogin}
              onSetPassword={handleSetAdminPassword}
            />

            <AdminLoginDialog
              open={showSetupDialog}
              onOpenChange={setShowSetupDialog}
              mode="setup"
              onSetPassword={handleSetupAdminPassword}
            />

            <BandInfoEditDialog
              open={showBandInfoEdit}
              onOpenChange={setShowBandInfoEdit}
              name={data.name}
              genres={data.genres}
              label={data.label}
              onSave={({ name, genres, label }) => setBandData((current) => ({ ...(current || defaultBandData), name, genres, label }))}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default App
