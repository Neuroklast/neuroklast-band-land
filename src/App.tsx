import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
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
  }
}

function App() {
  const [bandData, setBandData] = useKV<BandData>('band-data', defaultBandData)
  const [adminPasswordHash, setAdminPasswordHash] = useKV<string>('admin-password-hash', '')
  const [isOwner, setIsOwner] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    window.spark.user().then(user => {
      if (user) {
        setIsOwner(user.isOwner)
      }
    }).catch(err => {
      console.warn('Failed to fetch user data:', err)
    })
  }, [])

  const handleAdminLogin = async (password: string): Promise<boolean> => {
    const hash = await hashPassword(password)
    if (hash === adminPasswordHash) {
      setIsOwner(true)
      return true
    }
    return false
  }

  const handleSetAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
    setAdminPasswordHash(hash)
    setIsOwner(true)
  }

  const handleChangeAdminPassword = async (password: string): Promise<void> => {
    const hash = await hashPassword(password)
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
      <SecretTerminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      
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
                onAdminLogin={!isOwner ? () => setShowLoginDialog(true) : undefined}
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
              hasPassword={!!adminPasswordHash}
              onLogin={handleAdminLogin}
              onSetPassword={handleSetAdminPassword}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default App
