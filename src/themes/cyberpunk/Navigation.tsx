import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'
import type { NavigationSlotProps } from '@/lib/types'
import './styles.css'

const NAV_HEIGHT_PX = 64

export default function CyberpunkNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
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
        className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-md border-b border-primary/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Top neon line */}
        <div className="absolute top-0 left-0 right-0 h-px cyberpunk-neon-line bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          {/* Site name with HUD prefix */}
          <button
            onClick={() => handleNavigation('hero')}
            className="text-base md:text-lg font-mono tracking-[0.08em] text-foreground hover:text-primary transition-colors touch-manipulation cyberpunk-rgb-split"
          >
            <span className="text-primary/60">&gt;</span>{' '}
            {(siteName || 'Home').toUpperCase()}
          </button>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-xs font-mono tracking-[0.08em] text-muted-foreground hover:text-primary transition-colors relative group uppercase"
              >
                <span className="text-primary/40">&gt;:</span> {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary shadow-[0_0_4px_var(--primary)] transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Mobile menu toggle */}
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
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-panel"
              className="fixed inset-x-0 top-0 z-40 bg-background md:hidden pt-16 pb-8 border-b border-primary/20"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col gap-1 px-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="text-left py-4 px-4 border-b border-primary/10 touch-manipulation font-mono text-base tracking-[0.08em] hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98] transition-all relative overflow-hidden group uppercase"
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-150" />
                    <span className="relative z-10">
                      <span className="text-primary/50">&gt;:</span> {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

CyberpunkNavigation.displayName = 'CyberpunkNavigation'
