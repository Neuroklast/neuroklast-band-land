import { useKV } from '@/hooks/use-kv'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import BandInfoEditDialog from '@/components/BandInfoEditDialog'
import BiographySection from '@/components/BiographySection'
import GigsSection from '@/components/GigsSection'
import ReleasesSection from '@/components/ReleasesSection'
import SocialSection from '@/components/SocialSection'
import InstagramGallery from '@/components/InstagramGallery'
import Footer from '@/components/Footer'
import EditControls from '@/components/EditControls'
import AdminLoginDialog, { hashPassword } from '@/components/AdminLoginDialog'
import CyberpunkLoader from '@/components/CyberpunkLoader'
import CyberpunkBackground from '@/components/CyberpunkBackground'
import AudioVisualizer from '@/components/AudioVisualizer'
import SecretTerminal from '@/components/SecretTerminal'
import TerminalEditDialog from '@/components/TerminalEditDialog'
import KonamiListener from '@/components/KonamiListener'
import type { BandData } from '@/lib/types'
import bandDataJson from '@/assets/documents/band-data.json'

const defaultBandData: BandData = {
  name: bandDataJson.band.name,
  genres: bandDataJson.band.genres,
  label: bandDataJson.band.label || 'Darktunes Music Group',
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

function App() {
  const [bandData, setBandData] = useKV<BandData>('band-data', defaultBandData)
  const [adminPasswordHash, setAdminPasswordHash] = useKV<string>('admin-password-hash', '')
  const [isOwner, setIsOwner] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showBandInfoEdit, setShowBandInfoEdit] = useState(false)
  const [showTerminalEdit, setShowTerminalEdit] = useState(false)

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
  }, [])

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
      sessionStorage.setItem('admin-token', hash)
      setIsOwner(true)
      return true
    }
    return false
  }

  const handleSetAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    sessionStorage.setItem('admin-token', hash)
    setAdminPasswordHash(hash)
  }

  const handleSetupAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    sessionStorage.setItem('admin-token', hash)
    setAdminPasswordHash(hash)
    setIsOwner(true)
  }

  const handleChangeAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    sessionStorage.setItem('admin-token', hash)
    setAdminPasswordHash(hash)
  }

  const handleTerminalActivation = () => {
    setTerminalOpen(true)
    toast.success('TERMINAL ACCESS GRANTED', {
      description: 'Secret code activated'
    })
  }

  const data = bandData || defaultBandData
  const safeSocialLinks = data.socialLinks || defaultBandData.socialLinks

  return (
    <>
      <KonamiListener onCodeActivated={handleTerminalActivation} />
      <SecretTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        customCommands={data.terminalCommands || []}
        editMode={editMode && isOwner}
        onEdit={() => setShowTerminalEdit(true)}
      />
      
      <AnimatePresence>
        {loading && (
          <CyberpunkLoader onLoadComplete={() => setLoading(false)} />
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
            <Navigation />
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
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <BiographySection
                  biography={data.biography}
                  editMode={editMode && isOwner}
                  onUpdate={(biography) => setBandData((current) => ({ ...(current || defaultBandData), biography }))}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <InstagramGallery />
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
              />
            </motion.div>

            {isOwner && (
              <EditControls 
                editMode={editMode}
                onToggleEdit={() => setEditMode(!editMode)}
                hasPassword={!!adminPasswordHash}
                onChangePassword={handleChangeAdminPassword}
                onSetPassword={handleSetAdminPassword}
              />
            )}

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

            <TerminalEditDialog
              open={showTerminalEdit}
              onOpenChange={setShowTerminalEdit}
              commands={data.terminalCommands || []}
              onSave={(terminalCommands) => setBandData((current) => ({ ...(current || defaultBandData), terminalCommands }))}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default App
