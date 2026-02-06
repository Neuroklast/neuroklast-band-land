import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Hero from '@/components/Hero'
import GigsSection from '@/components/GigsSection'
import ReleasesSection from '@/components/ReleasesSection'
import SocialSection from '@/components/SocialSection'
import EditControls from '@/components/EditControls'
import type { BandData } from '@/lib/types'

const defaultBandData: BandData = {
  name: 'NEUROKLAST',
  genres: ['HARD TECHNO', 'INDUSTRIAL', 'DNB', 'DARK ELECTRO'],
  socialLinks: {
    instagram: 'https://instagram.com/neuroklast',
    facebook: 'https://facebook.com/neuroklast',
    spotify: 'https://open.spotify.com/artist/neuroklast',
    soundcloud: 'https://soundcloud.com/neuroklast',
    youtube: 'https://youtube.com/@neuroklast',
    bandcamp: 'https://neuroklast.bandcamp.com',
    linktr: 'https://linktr.ee/neuroklast'
  },
  gigs: [],
  releases: []
}

function App() {
  const [bandData, setBandData] = useKV<BandData>('band-data', defaultBandData)
  const [isOwner, setIsOwner] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    window.spark.user().then(user => {
      if (user) {
        setIsOwner(user.isOwner)
      }
    })
  }, [])

  const data = bandData || defaultBandData

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Hero 
          name={data.name} 
          genres={data.genres}
        />

        <main className="relative">
          <GigsSection 
            gigs={data.gigs}
            editMode={editMode && isOwner}
            onUpdate={(gigs) => setBandData((current) => ({ ...(current || defaultBandData), gigs }))}
          />

          <ReleasesSection 
            releases={data.releases}
            editMode={editMode && isOwner}
            onUpdate={(releases) => setBandData((current) => ({ ...(current || defaultBandData), releases }))}
          />

          <SocialSection 
            socialLinks={data.socialLinks}
            editMode={editMode && isOwner}
            onUpdate={(socialLinks) => setBandData((current) => ({ ...(current || defaultBandData), socialLinks }))}
          />
        </main>

        {isOwner && (
          <EditControls 
            editMode={editMode}
            onToggleEdit={() => setEditMode(!editMode)}
          />
        )}
      </motion.div>
    </div>
  )
}

export default App
