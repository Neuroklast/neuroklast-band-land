import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'
import type { NavigationSlotProps } from '@/lib/types'
import './styles.css'

const NAV_HEIGHT_PX = 64

export default function ElegantNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
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
        className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-primary/10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigation('hero')}
            className="text-base md:text-lg font-heading font-semibold tracking-wide text-foreground hover:text-primary transition-colors"
          >
            {siteName}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-sm font-body text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-px bg-primary/60 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </button>
            ))}
          </div>

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground hover:text-primary"
            >
              {isMobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </Button>
          </div>
        </div>

        {/* Subtle gold line at the bottom of nav */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent pointer-events-none" />
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-panel"
              className="fixed inset-x-0 top-0 z-40 bg-background md:hidden pt-16 pb-6 border-b border-primary/15"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col px-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="text-left py-3 px-3 text-base font-body text-muted-foreground hover:text-primary border-b border-primary/10 last:border-b-0 transition-colors"
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                  >
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

ElegantNavigation.displayName = 'ElegantNavigation'
