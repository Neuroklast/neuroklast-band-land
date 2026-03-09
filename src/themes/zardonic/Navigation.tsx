import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { List, X, Pencil } from '@phosphor-icons/react'
import { useState } from 'react'

import type { NavigationSlotProps } from '@/lib/types'
type NavigationProps = NavigationSlotProps;

export default function Navigation({ siteName, items }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)





  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border zardonic-theme-scanline-effect"
      style={{ position: 'fixed', top: 0 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground uppercase"
          whileHover={{ filter: 'drop-shadow(2px 0 0 rgba(255,0,100,0.3)) drop-shadow(-2px 0 0 rgba(0,255,255,0.3))' }}
        >
          <span>{siteName}</span>
        </motion.div>

        <div className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => window.location.hash = item.id}
              className="text-sm uppercase tracking-wide hover:text-primary transition-colors font-mono zardonic-theme-hover-chromatic zardonic-theme-hover-glitch"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">


          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-card/95 border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => () => { window.location.hash = item.id; setMobileMenuOpen(false); }}
                  className="text-left text-sm uppercase tracking-wide hover:text-primary transition-colors font-mono"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
