import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [glitchActive, setGlitchActive] = useState(false)
  const [signalText, setSignalText] = useState('[SIGNAL_DETECTED]')
  
  const signalStates = [
    '[SIGNAL_DETECTED]',
    '[TRANSMISSION_ACTIVE]',
    '[CARRIER_WAVE_LOCKED]',
    '[FREQUENCY_SYNC]',
    '[NEURAL_LINK_ESTABLISHED]'
  ]

  useEffect(() => {
    const textInterval = setInterval(() => {
      setSignalText(signalStates[Math.floor(Math.random() * signalStates.length)])
    }, 3500)
    
    return () => clearInterval(textInterval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), Math.random() * 150 + 50)
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="glitch-noir-scanline-overlay" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-accent/10 glitch-noir-flicker" />
        <div className="absolute top-1/3 right-1/3 w-px h-24 bg-accent/10 glitch-noir-flicker" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-px h-40 bg-accent/10 glitch-noir-flicker" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 text-center px-6"
      >
        <div className={`relative ${glitchActive ? 'glitch-noir-glitch-text' : ''}`}>
          <div className="absolute -inset-4 opacity-20">
            <div className="text-7xl md:text-9xl font-bold tracking-tighter text-accent font-mono blur-sm">
              NEUROKLAST
            </div>
          </div>
          
          <h1 className="relative text-7xl md:text-9xl font-bold tracking-tighter mb-6 text-foreground font-mono">
            NEUROKLAST
          </h1>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-accent/50" />
            <div className="h-1 w-1 bg-accent glitch-noir-pulse" />
            <div className="h-px w-12 bg-accent/50" />
          </div>
          
          <div className="relative overflow-hidden">
            <motion.p 
              key={signalText}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground font-mono tracking-wide"
            >
              {signalText}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-12 h-px w-64 mx-auto bg-border origin-left relative glitch-noir-signal-line"
        />

        <div className="mt-8 flex gap-4 justify-center font-mono text-sm text-muted-foreground">
          <span className="glitch-noir-flicker">█</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.3s' }}>█</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.6s' }}>█</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.9s' }}>█</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '1.2s' }}>█</span>
        </div>

        <div className="mt-8 font-mono text-xs text-muted-foreground/50 flex items-center justify-center gap-3">
          <span>FREQUENCY: 136.5 Hz</span>
          <span>•</span>
          <span>BPM: 138</span>
          <span>•</span>
          <span className="glitch-noir-flicker">LIVE</span>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground font-mono text-xs">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ▼
        </motion.div>
      </div>
    </section>
  )
}
