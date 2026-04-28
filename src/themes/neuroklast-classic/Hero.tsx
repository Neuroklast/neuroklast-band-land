import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps, HeroButton } from '@/lib/types'
import './styles.css'

const FREQ_TEXT = 'FREQ::432Hz'
const MODE_CRIMSON_TEXT = 'MODE::CRIMSON'
const SIGNAL_ACTIVE_TEXT = 'SIGNAL::ACTIVE'

const DEFAULT_BUTTONS: HeroButton[] = [
  { id: 'initialize', label: 'INITIALIZE', action: 'scroll', scrollTarget: 'news', variant: 'outline' },
]

function handleHeroButton(btn: HeroButton, onContactModalOpen?: () => void) {
  if (btn.action === 'scroll') {
    const el = document.getElementById(btn.scrollTarget || '')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
    }
  } else if (btn.action === 'url' && btn.url) {
    window.open(btn.url, btn.openInNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer')
  } else if (btn.action === 'contact-modal') {
    onContactModalOpen?.()
  }
}

export default function NeuroklastClassicHero({
  name,
  genres,
  logoUrl,
  titleImageUrl,
  heroButtons,
  onContactModalOpen,
}: HeroSlotProps) {
  const buttons = heroButtons && heroButtons.length > 0 ? heroButtons : DEFAULT_BUTTONS

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
      {/* Radial crimson glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--primary)/0.05_0%,transparent_55%)]" />

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

        {/* HUD corner brackets */}
        {[
          { top: '10%', left: '5%', rotate: 0 },
          { top: '10%', left: '95%', rotate: 90 },
          { top: '90%', left: '5%', rotate: 270 },
          { top: '90%', left: '95%', rotate: 180 },
        ].map((pos, i) => (
          <motion.div
            key={`nk-bracket-${i}`}
            className="absolute hidden lg:block"
            style={{ top: pos.top, left: pos.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.2, 0.5] }}
            transition={{ duration: 4, delay: i * 0.4, repeat: Infinity }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{ transform: `rotate(${pos.rotate}deg)` }}
            >
              <path d="M 0 10 L 0 0 L 10 0" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
            </svg>
          </motion.div>
        ))}

        {/* HUD system readout — top-left */}
        <div className="absolute top-8 left-8 hidden lg:block">
          <div className="p-3 bg-black/40 backdrop-blur-sm border border-primary/20">
            <div className="font-mono text-[9px] text-primary/70 space-y-1">
              <div>SYS://NEUROKLAST.CORE</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 bg-primary rounded-full"
                  style={{ animation: 'nk-hud-pulse 2s ease infinite' }}
                />
                <span>ONLINE</span>
              </div>
              <div className="text-primary/40">{FREQ_TEXT}</div>
            </div>
          </div>
        </div>

        {/* HUD system readout — bottom-right */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <div className="p-3 bg-black/40 backdrop-blur-sm border border-primary/20">
            <div className="font-mono text-[9px] text-primary/70 text-right space-y-1">
              <div>{MODE_CRIMSON_TEXT}</div>
              <div>{SIGNAL_ACTIVE_TEXT}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-8 md:mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            {/*
              ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen,
              nicht auf dem <img> selbst. Nur so folgt der Glow der transparenten
              Silhouette des Bildes. Der Wrapper darf außerdem KEIN overflow:hidden haben.
            */}
            <div style={{ filter: 'drop-shadow(0 0 20px var(--primary))' }}>
              <div className="relative isolate block w-fit mx-auto">
                <img src={logoUrl} fetchPriority="high" loading="eager"
                  alt={`${name} Logo`}
                  className="w-[18rem] h-auto sm:w-[22rem] md:w-[26rem] lg:w-[30rem] relative z-10"
                />
                <div className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 mix-blend-color" style={{ backgroundColor: 'var(--primary)', opacity: 'var(--hero-image-tint, 0)', maskImage: `url(${logoUrl})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: `url(${logoUrl})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="mb-4 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {titleImageUrl ? (
            /*
              ALPHA-KANAL-GLOW: filter: drop-shadow() MUSS auf dem Wrapper-<div> sitzen,
              nicht auf dem <img> selbst. Nur so folgt der Glow der transparenten
              Silhouette des Bildes. Der Wrapper darf außerdem KEIN overflow:hidden haben.
            */
            <div
              style={{
                filter:
                  'drop-shadow(0 0 30px var(--primary)) drop-shadow(2px 0 0 color-mix(in oklch, var(--primary) 70%, transparent)) drop-shadow(-2px 0 0 color-mix(in oklch, var(--primary) 70%, transparent))',
              }}
            >
              <div className="relative isolate block w-full">
                <img src={titleImageUrl} fetchPriority="high" loading="eager"
                  alt={name}
                  className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl h-auto relative z-10"
                />
                <div className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 mix-blend-color" style={{ backgroundColor: 'var(--primary)', opacity: 'var(--hero-image-tint, 0)', maskImage: `url(${titleImageUrl})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: `url(${titleImageUrl})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
              </div>
            </div>
          ) : (
            <h1
              className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight text-foreground"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: '0 0 30px var(--primary), 0 0 60px color-mix(in oklch, var(--primary) 30%, transparent)',
              }}
            >
              {name}
            </h1>
          )}
        </motion.div>

        {/* Genre badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-14 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.06 }}
            >
              <Badge
                variant="outline"
                className="border-primary/40 text-primary/90 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-mono tracking-[0.12em] uppercase hover:border-primary/70 hover:shadow-[0_0_8px_var(--primary)] transition-all touch-manipulation"
              >
                {genre}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex gap-3 flex-wrap justify-center"
        >
          {buttons.map((btn, idx) => (
            <Button
              key={btn.id}
              onClick={() => handleHeroButton(btn, onContactModalOpen)}
              variant={btn.variant ?? (idx === 0 ? 'outline' : 'default')}
              className="group border-primary/50 text-foreground/90 hover:bg-primary/5 hover:border-primary hover:shadow-[0_0_15px_var(--primary)] active:bg-primary/10 active:scale-95 px-8 py-6 md:px-10 md:py-7 text-sm md:text-base font-mono tracking-[0.12em] transition-all touch-manipulation"
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

