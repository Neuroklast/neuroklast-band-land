import { useState, useEffect } from 'react'
import { signalStaticTheme } from '@/themes/signal-static'

const { 
  Hero, 
  Navigation, 
  BackgroundEffects, 
  SectionDivider, 
  LoadingScreen,
  BiographySection,
  GigsSection,
  ReleasesSection,
  SocialSection,
  Footer,
  ThemeModalWrapper,
  GlobalOverlayLayer
} = signalStaticTheme.slots

function App() {
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="relative min-h-screen">
      <BackgroundEffects />
      <GlobalOverlayLayer noiseIntensity={0.4} scanlineIntensity={0.8} flickerIntensity={0.05} />
      
      <Navigation />

      <main className="relative z-10">
        <Hero />

        <SectionDivider />

        <BiographySection />

        <SectionDivider />

        <ReleasesSection />

        <SectionDivider />

        <GigsSection />

        <SectionDivider />

        <SocialSection />
      </main>

      <Footer />

      <ThemeModalWrapper
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="TRANSMISSION_DETAILS"
      >
        <div className="space-y-4 font-mono text-sm text-foreground">
          <p>
            {'>'} This is a demo modal using the ThemeModalWrapper component.
          </p>
          <p>
            {'>'} It features glitch-style animations that match the dark techno aesthetic.
          </p>
          <div className="border border-border bg-muted p-4 mt-4">
            <div className="text-accent mb-2">[SYSTEM_MESSAGE]</div>
            <div className="text-muted-foreground text-xs">
              Modal content can be fully customized with any React components.
            </div>
          </div>
        </div>
      </ThemeModalWrapper>
    </div>
  )
}

export default App