'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { List, X } from '@phosphor-icons/react'
import type { NavigationSlotProps } from '@/lib/types'
import { useLenisContext } from '@/contexts/LenisContext'
import { useLocale } from '@/contexts/LocaleContext'
import './styles.css'

const NAV_HEIGHT_PX = 64
const GLITCH_PROBABILITY = 0.95
const GLITCH_DURATION_MS = 300
const GLITCH_INTERVAL_MS = 3000

export default function NeuroklastClassicNavigation({
  items,
  siteName,
  onNavigate,
  morseHandlers,
}: NavigationSlotProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const { lenis } = useLenisContext()
  const { t } = useLocale()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) return
    const interval = setInterval(() => {
      if (Math.random() > GLITCH_PROBABILITY) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), GLITCH_DURATION_MS)
      }
    }, GLITCH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!isMobileMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    lenis?.stop()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      lenis?.start()
      document.removeEventListener('keydown', onKey)
    }
  }, [isMobileMenuOpen, lenis])

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
        className="fixed top-0 left-0 right-0 bg-background/85 border-b border-primary/15"
        style={{ zIndex: 'var(--z-nav)', paddingTop: 'env(safe-area-inset-top)' }}
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
        aria-label={t('aria.mainNav')}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => handleNavigation('hero')}
            onPointerDown={morseHandlers?.onPointerDown}
            onPointerUp={morseHandlers?.onPointerUp}
            className={`flex min-h-[44px] items-center touch-manipulation ${glitch ? 'opacity-70 translate-x-px' : ''}`}
            style={{ transition: glitch ? 'none' : 'opacity 0.2s' }}
            aria-label={siteName || 'NEUROKLAST'}
          >
            <img
              src="/brand/nk-logo-red-bold.png"
              alt=""
              className="h-7 w-auto sm:h-8"
            />
          </button>

          <div className="hidden md:flex flex-wrap items-center justify-end gap-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="nk-os-nav min-h-[44px]"
              >
                <span className="nk-os-nav__tick">&gt;:</span>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="nk-os-btn text-primary min-h-[44px] min-w-[44px]"
              aria-label={isMobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
              aria-expanded={isMobileMenuOpen}
              aria-controls="nk-mobile-nav"
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
              key="nk-mobile-overlay"
              className="fixed inset-0 md:hidden bg-background/95"
              style={{ zIndex: 'var(--z-nav)' }}
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              key="nk-mobile-panel"
              id="nk-mobile-nav"
              role="navigation"
              aria-label={t('aria.mobileNav')}
              className="fixed inset-x-0 top-0 md:hidden pt-16 pb-8 border-b border-primary/20 bg-background"
              style={{ zIndex: 'var(--z-nav)', paddingTop: 'calc(var(--nk-nav-h) + env(safe-area-inset-top))' }}
                initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              <div className="flex flex-col gap-1 px-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    className="nk-os-row w-full text-left py-4 px-4 min-h-[44px] touch-manipulation font-mono text-base tracking-[0.08em] uppercase"
                    onClick={() => handleNavigation(item.id)}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : index * 0.05 }}
                  >
                    <span className="relative z-[1]">
                      <span className="nk-os-nav__tick">&gt;:</span> {item.label}
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

NeuroklastClassicNavigation.displayName = 'NeuroklastClassicNavigation'
