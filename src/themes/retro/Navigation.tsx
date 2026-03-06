import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NavigationSlotProps } from '@/lib/types'
import './styles.css'

const NAV_HEIGHT_PX = 56

export default function RetroNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        className="fixed top-0 left-0 right-0 z-50 border-b border-primary/30 bg-background/90 backdrop-blur-sm font-mono"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => handleNavigation('hero')}
            className="text-sm md:text-base font-heading tracking-widest text-primary hover:text-accent transition-colors uppercase"
          >
            {'>'} {siteName}_
          </button>

          <div className="hidden md:flex items-center gap-6">
            {items.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors tracking-wide group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="text-primary/50 mr-1">{'>'}</span>
                {item.label}
              </motion.button>
            ))}
          </div>

          <button
            className="md:hidden text-primary text-sm font-mono tracking-wider hover:text-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '[X]' : '[=]'}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="retro-mobile-overlay"
              className="fixed inset-0 z-40 bg-background/80 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="retro-mobile-panel"
              className="fixed inset-x-0 top-0 z-40 bg-background border-b border-primary/30 md:hidden pt-14 pb-4 font-mono"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col px-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="text-left py-3 px-2 text-sm text-muted-foreground hover:text-primary border-b border-primary/10 last:border-b-0 transition-colors tracking-wide"
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
                    <span className="text-primary/50 mr-2">{'>'}</span>
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

RetroNavigation.displayName = 'RetroNavigation'
