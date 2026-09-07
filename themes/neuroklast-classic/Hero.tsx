'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps, HeroButton } from '@/lib/types'
import { CrtGlitchMark } from './CrtGlitchMark'
import { useLenisContext } from '@/contexts/LenisContext'
import './styles.css'

const DEFAULT_BUTTONS: HeroButton[] = [
  { id: 'initialize', label: 'INITIALIZE', action: 'scroll', scrollTarget: 'news', variant: 'outline' },
]

export default function NeuroklastClassicHero({
  name,
  tagline,
  genres,
  logoUrl,
  titleImageUrl,
  heroButtons,
  onContactModalOpen,
}: HeroSlotProps) {
  const { scrollTo } = useLenisContext()
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : DEFAULT_BUTTONS

  function handleHeroButton(btn: HeroButton) {
    if (btn.action === 'scroll') {
      const target = btn.scrollTarget
      if (target) scrollTo(`#${target}`, { offset: -64 })
      else scrollTo(typeof window !== 'undefined' ? window.innerHeight : 0)
    } else if (btn.action === 'url' && btn.url) {
      window.open(btn.url, btn.openInNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer')
    } else if (btn.action === 'contact-modal') {
      onContactModalOpen?.()
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center px-4 pt-24 md:pt-28 pb-20">
      {/* HUD decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.rect
            x="250"
            y="180"
            width="700"
            height="440"
            rx="1"
            stroke="var(--primary)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.25 }}
            transition={{ duration: 3, delay: 0.3 }}
          />
          <motion.line
            x1="0"
            y1="400"
            x2="1200"
            y2="400"
            stroke="var(--primary)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.12 }}
            transition={{ duration: 2.5, delay: 0.6 }}
          />
          <motion.line
            x1="600"
            y1="0"
            x2="600"
            y2="800"
            stroke="var(--primary)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.08 }}
            transition={{ duration: 2.5, delay: 0.9 }}
          />
        </svg>

      </div>

      <div className="relative z-10 mt-auto mb-[7vh] md:mb-[5vh] text-center w-full max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          className="mb-5 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {titleImageUrl ? (
            <CrtGlitchMark
              src={titleImageUrl}
              alt={name}
              variant="word"
              imgClassName="w-[min(92vw,72rem)] h-auto"
            />
          ) : (
            <div className="nk-crt-mark nk-crt-mark--word">
              <h1
                className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {name}
              </h1>
            </div>
          )}
        </motion.div>

        {tagline ? (
          <motion.p
            className="mb-6 max-w-3xl px-4 text-center font-mono text-xs uppercase tracking-[0.22em] text-foreground/85 md:mb-8 md:text-sm lg:text-base lg:tracking-[0.28em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {tagline}
          </motion.p>
        ) : null}

        {(genres || []).length > 0 ? (
          <motion.div
            className="mb-8 flex flex-wrap items-center justify-center gap-2 px-2 md:mb-10 md:gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            {(genres || []).map((genre, index) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.06 }}
              >
                <span className="nk-os-chip">{genre}</span>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {buttons.map((btn, idx) => (
            <Button
              key={btn.id}
              onClick={() => handleHeroButton(btn)}
                  variant={btn.variant ?? (idx === 0 ? 'outline' : 'default')}
                  className={`nk-os-btn ${idx === 0 ? 'nk-os-btn--fill' : ''} px-8 py-6 md:px-10 md:py-7 text-sm md:text-base touch-manipulation`}
            >
              {btn.label}
              {btn.action === 'scroll' && (
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <CaretDown className="ml-2" size={16} />
                </motion.div>
              )}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-primary/30"
        >
          <CaretDown size={18} className="md:hidden" />
          <CaretDown size={20} className="hidden md:block" />
        </motion.div>
      </motion.div>
    </section>
  )
}

NeuroklastClassicHero.displayName = 'NeuroklastClassicHero'

