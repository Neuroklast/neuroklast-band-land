import { useState } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from '@/components/ui/sonner'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import BiographySection from '@/components/BiographySection'
import GigsSection from '@/components/GigsSection'
import ReleasesSection from '@/components/ReleasesSection'
import SocialSection from '@/components/SocialSection'
import Footer from '@/components/Footer'
import type { BandData } from '@/lib/types'

const defaultBandData: BandData = {
  name: 'NEUROKLAST',
  genres: ['HARD TECHNO', 'INDUSTRIAL', 'DNB', 'DARK ELECTRO'],
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
    story: `NEUROKLAST emerged from the underground, forging a relentless sound that merges hard techno, industrial, drum and bass, and dark electro into a singular sonic assault. Born from a vision to push boundaries and challenge the status quo, NEUROKLAST delivers raw, uncompromising energy designed for the darkest dancefloors and most intense festival stages.

With a commitment to innovation and experimentation, each performance is a journey through distorted rhythms, heavy basslines, and hypnotic atmospheres. NEUROKLAST represents the collision of machine precision and human emotion, creating an experience that transcends typical electronic music boundaries.`,
    founded: '2020'
  }
}

function App() {
  const [bandData, setBandData] = useState<BandData>(defaultBandData)
  const [editMode, setEditMode] = useState(false)

  const data = bandData || defaultBandData

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Toaster position="top-right" />
      <Navigation />
      
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
          <BiographySection
            biography={data.biography}
            editMode={editMode}
            onUpdate={(biography) => setBandData((current) => ({ ...(current || defaultBandData), biography }))}
          />

          <GigsSection 
            gigs={data.gigs}
            editMode={editMode}
            onUpdate={(gigs) => setBandData((current) => ({ ...(current || defaultBandData), gigs }))}
          />

          <ReleasesSection 
            releases={data.releases}
            editMode={editMode}
            onUpdate={(releases) => setBandData((current) => ({ ...(current || defaultBandData), releases }))}
          />

          <SocialSection 
            socialLinks={data.socialLinks}
            editMode={editMode}
            onUpdate={(socialLinks) => setBandData((current) => ({ ...(current || defaultBandData), socialLinks }))}
          />
        </main>

        <Footer socialLinks={data.socialLinks} />
      </motion.div>
    </div>
  )
}

export default App
