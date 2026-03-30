import { motion, AnimatePresence } from 'framer-motion'
import { List, X } from '@phosphor-icons/react'
import type { NavigationSlotProps } from '@/lib/types'

interface UmbrellaNavigationProps extends NavigationSlotProps {
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

export default function Navigation({ siteName, items, onNavigate, mobileMenuOpen = false, setMobileMenuOpen }: UmbrellaNavigationProps) {
  const handleNavigation = (id: string) => {
    if (setMobileMenuOpen) setMobileMenuOpen(false)
    if (onNavigate) {
      onNavigate(id)
    } else {
      const element = document.getElementById(id)
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - 64
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="umbrella-corp-data-label">SYS://</div>
          <span className="text-xl md:text-2xl font-bold tracking-tighter text-foreground uppercase font-mono">
            {siteName}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigation(item.id)}
              className="text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-mono umbrella-corp-nav-item"
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <List className="w-6 h-6" />}
        </button>
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
                  onClick={() => handleNavigation(item.id)}
                  className="text-left text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-mono"
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
