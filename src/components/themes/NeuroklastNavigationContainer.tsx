import { useState, useEffect } from 'react'
import Navigation from '../../themes/neuroklast-classic/Navigation'
import type { NavigationSlotProps } from '@/lib/types'

const GLITCH_PROBABILITY = 0.95
const GLITCH_DURATION_MS = 300
const GLITCH_INTERVAL_MS = 3000

export default function NeuroklastNavigationContainer(props: NavigationSlotProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > GLITCH_PROBABILITY) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), GLITCH_DURATION_MS)
      }
    }, GLITCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <Navigation
      {...props}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      glitch={glitch}
      playerOpen={playerOpen}
      setPlayerOpen={setPlayerOpen}
    />
  )
}
