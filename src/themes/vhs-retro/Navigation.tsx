import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NavigationSlotProps } from '@/lib/types'
import './styles.css'

const NAV_HEIGHT_PX = 56

export default function VhsRetroNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [tapeCounter, setTapeCounter] = useState('00:00:00')

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000)
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
      const s = String(elapsed % 60).padStart(2, '0')
      setTapeCounter(`${h}:${m}:${s}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleNavigation = (id: string) => {
    setIsMobileMenuOpen(false)
    if (onNavigate) {
      onNavigate(id)
    } else {
      const element = document.getElementById(id)
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT_PX
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 border-b-2 border-primary/20 bg-background/95 backdrop-blur-sm font-mono"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Tracking line glitch at top of nav */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent 20%, var(--primary) 50%, transparent 80%)',
            animation: 'vhs-tracking-glitch 4s step-end infinite',
          }}
        />

        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleNavigation('hero')}
            className="text-sm md:text-base font-heading tracking-widest text-primary hover:text-accent transition-colors uppercase"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            ▶ {siteName}
          </button>

          {/* Tape counter display */}
          <div
            className="hidden md:block text-xs text-primary/40 tabular-nums tracking-wider"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            {tapeCounter}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide group"
                style={{ fontFamily: "'VT323', monospace" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="text-primary/40 mr-1">▸</span>
                {item.label}
              </motion.button>
            ))}
          </div>

          <button
            className="md:hidden text-primary text-sm font-mono tracking-wider hover:text-accent transition-colors"
            style={{ fontFamily: "'VT323', monospace" }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '■ STOP' : '▶ MENU'}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="vhs-mobile-overlay"
              className="fixed inset-0 z-40 bg-background/85 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="vhs-mobile-panel"
              className="fixed inset-x-0 top-0 z-40 bg-background border-b-2 border-primary/20 md:hidden pt-14 pb-4 font-mono"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col px-4">
                <div
                  className="text-xs text-primary/40 tabular-nums tracking-wider mb-2 px-2"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  TAPE: {tapeCounter}
                </div>
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="text-left py-3 px-2 text-sm text-muted-foreground hover:text-primary border-b border-primary/10 last:border-b-0 transition-colors tracking-wide"
                    style={{ fontFamily: "'VT323', monospace" }}
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <span className="text-primary/40 mr-2">▸</span>
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

VhsRetroNavigation.displayName = 'VhsRetroNavigation'
