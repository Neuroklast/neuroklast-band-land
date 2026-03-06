import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'
import type { NavigationSlotProps } from '@/lib/types'
import './styles.css'

const NAV_HEIGHT_PX = 64

export default function NeonNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
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
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--primary)]"
        style={{
          background: 'color-mix(in srgb, var(--background) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 1px 8px var(--primary), 0 0 2px var(--primary)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigation('hero')}
            className="text-base md:text-lg font-heading font-bold tracking-widest uppercase transition-all duration-300"
            style={{
              color: 'var(--primary)',
              textShadow: '0 0 8px var(--primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textShadow =
                '0 0 12px var(--primary), 0 0 25px var(--primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textShadow = '0 0 8px var(--primary)'
            }}
          >
            {siteName}
          </button>

          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="text-sm font-body tracking-wider uppercase text-muted-foreground transition-all duration-300 relative group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)'
                  e.currentTarget.style.textShadow = '0 0 8px var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = ''
                  e.currentTarget.style.textShadow = ''
                }}
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                  style={{
                    background: 'var(--primary)',
                    boxShadow: '0 0 4px var(--primary)',
                  }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: 'var(--primary)' }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </Button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              className="fixed inset-0 z-40 md:hidden"
              style={{
                background: 'color-mix(in srgb, var(--background) 70%, transparent)',
                backdropFilter: 'blur(8px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="mobile-panel"
              className="fixed inset-x-0 top-0 z-40 md:hidden pt-16 pb-6 border-b border-[var(--primary)]"
              style={{
                background: 'var(--background)',
                boxShadow: '0 4px 20px var(--primary)',
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col px-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="text-left py-3 px-2 text-base font-body tracking-wider uppercase text-muted-foreground transition-all duration-300 border-b border-[var(--border)]"
                    onClick={() => handleNavigation(item.id)}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--primary)'
                      e.currentTarget.style.textShadow = '0 0 6px var(--primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = ''
                      e.currentTarget.style.textShadow = ''
                    }}
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

NeonNavigation.displayName = 'NeonNavigation'
