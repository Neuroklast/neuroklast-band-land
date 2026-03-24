import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps, HeroButton } from '@/lib/types'

const BLOCK_CHAR = '█'
const FREQUENCY_TEXT = 'FREQUENCY: 136.5 Hz'
const BPM_TEXT = 'BPM: 138'
const DOWN_ARROW = '▼'
const LIVE_TEXT = 'LIVE'
const BULLET = '•'

const SIGNAL_STATES = [
  '[SIGNAL_DETECTED]',
  '[TRANSMISSION_ACTIVE]',
  '[CARRIER_WAVE_LOCKED]',
  '[FREQUENCY_SYNC]',
  '[NEURAL_LINK_ESTABLISHED]'
]

const DEFAULT_BUTTONS: HeroButton[] = [
  { id: 'explore', label: 'EXPLORE', action: 'scroll', scrollTarget: 'news', variant: 'outline' },
]

function handleHeroButton(btn: HeroButton, onContactModalOpen?: () => void) {
  if (btn.action === 'scroll') {
    const el = document.getElementById(btn.scrollTarget || '')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  } else if (btn.action === 'url' && btn.url) {
    window.open(btn.url, btn.openInNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer')
  } else if (btn.action === 'contact-modal') {
    onContactModalOpen?.()
  }
}

export default function Hero({ name, genres, logoUrl, titleImageUrl, heroButtons, onContactModalOpen }: HeroSlotProps) {
  const [glitchActive, setGlitchActive] = useState(false)
  const [signalText, setSignalText] = useState(SIGNAL_STATES[0])
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : DEFAULT_BUTTONS

  useEffect(() => {
    const textInterval = setInterval(() => {
      setSignalText(SIGNAL_STATES[Math.floor(Math.random() * SIGNAL_STATES.length)])
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

  const displayName = name || 'NEUROKLAST'

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
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${displayName} Logo`}
              className="h-24 md:h-36 w-auto object-contain"
              fetchPriority="high"
              loading="eager"
            />
          </motion.div>
        )}

        <div className={`relative ${glitchActive ? 'glitch-noir-glitch-text' : ''}`}>
          <div className="absolute -inset-4 opacity-20">
            <div className="text-7xl md:text-9xl font-bold tracking-tighter text-accent font-mono blur-sm">
              {titleImageUrl ? '' : displayName}
            </div>
          </div>

          {titleImageUrl ? (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img src={titleImageUrl} alt={displayName} className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto" fetchPriority="high" loading="eager" />
            </motion.div>
          ) : (
            <h1 className="relative text-7xl md:text-9xl font-bold tracking-tighter mb-6 text-foreground font-mono">
              {displayName}
            </h1>
          )}
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-accent/50" />
            <div className="h-1 w-1 bg-accent glitch-noir-pulse" />
            <div className="h-px w-12 bg-accent/50" />
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {genres.map((genre) => (
                <span key={genre} className="font-mono text-xs text-muted-foreground/70 uppercase tracking-widest border border-muted-foreground/20 px-2 py-0.5">
                  {genre}
                </span>
              ))}
            </div>
          )}
          
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
          <span className="glitch-noir-flicker">{BLOCK_CHAR}</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.3s' }}>{BLOCK_CHAR}</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.6s' }}>{BLOCK_CHAR}</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '0.9s' }}>{BLOCK_CHAR}</span>
          <span className="glitch-noir-flicker" style={{ animationDelay: '1.2s' }}>{BLOCK_CHAR}</span>
        </div>

        <div className="mt-8 font-mono text-xs text-muted-foreground/50 flex items-center justify-center gap-3">
          <span>{FREQUENCY_TEXT}</span>
          <span>{BULLET}</span>
          <span>{BPM_TEXT}</span>
          <span>{BULLET}</span>
          <span className="glitch-noir-flicker">{LIVE_TEXT}</span>
        </div>

        {buttons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 flex gap-4 justify-center flex-wrap"
          >
            {buttons.map((btn, idx) => (
              <Button
                key={btn.id}
                variant={btn.variant ?? (idx === 0 ? 'outline' : 'default')}
                onClick={() => handleHeroButton(btn, onContactModalOpen)}
                className="font-mono tracking-wider"
              >
                {btn.label}
                {btn.action === 'scroll' && <CaretDown className="ml-2" size={14} />}
              </Button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground font-mono text-xs">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {DOWN_ARROW}
        </motion.div>
      </div>
    </section>
  )
}

