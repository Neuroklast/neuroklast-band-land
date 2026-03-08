import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

export default function CyberpunkHero({
  name,
  genres,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
      {/* Holographic grid overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/0.04_0%,transparent_60%)]" />

        {/* Decorative HUD lines */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.rect
            x="300"
            y="200"
            width="600"
            height="400"
            rx="2"
            stroke="var(--primary)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2.5, delay: 0.3 }}
          />
          <motion.line
            x1="0"
            y1="400"
            x2="1200"
            y2="400"
            stroke="var(--primary)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 }}
            transition={{ duration: 2, delay: 0.6 }}
          />
          <motion.line
            x1="600"
            y1="0"
            x2="600"
            y2="800"
            stroke="var(--primary)"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 2, delay: 0.9 }}
          />
        </svg>

        {/* HUD corner brackets */}
        {[
          { top: '12%', left: '6%', rotate: 0 },
          { top: '12%', left: '94%', rotate: 90 },
          { top: '88%', left: '6%', rotate: 270 },
          { top: '88%', left: '94%', rotate: 180 },
        ].map((pos, i) => (
          <motion.div
            key={`hud-bracket-${i}`}
            className="absolute hidden lg:block"
            style={{ top: pos.top, left: pos.left }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.2, 0.4] }}
            transition={{ duration: 4, delay: i * 0.3, repeat: Infinity }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{ transform: `rotate(${pos.rotate}deg)` }}
            >
              <path
                d="M 0 12 L 0 0 L 12 0"
                stroke="var(--primary)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </motion.div>
        ))}

        {/* HUD info panels */}
        <div className="absolute top-8 left-8 hidden lg:block">
          <div className="p-3 bg-black/30 backdrop-blur-sm border border-primary/20">
            <div className="font-mono text-[9px] text-primary/70 space-y-1">
              <div>SYS://CYBERPUNK.UI</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary cyberpunk-neon-pulse rounded-full" />
                <span>CONNECTED</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 hidden lg:block">
          <div className="p-3 bg-black/30 backdrop-blur-sm border border-primary/20">
            <div className="font-mono text-[9px] text-primary/70 text-right space-y-1">
              <div>HOLO::ACTIVE</div>
              <div>GRID::ONLINE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-8 md:mb-12 cyberpunk-hologram-flicker"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[18rem] h-auto sm:w-[22rem] md:w-[26rem] lg:w-[30rem] drop-shadow-[0_0_20px_var(--primary)]"
            />
          </motion.div>
        )}

        <motion.div
          className="mb-4 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          {titleImageUrl ? (
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl h-auto drop-shadow-[0_0_30px_var(--primary)]"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-heading font-bold tracking-tight text-foreground cyberpunk-neon-text cyberpunk-rgb-split">
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
                className="border-primary/40 text-primary/90 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-mono tracking-[0.1em] uppercase hover:border-primary/70 hover:shadow-[0_0_8px_var(--primary)] transition-all touch-manipulation"
              >
                {genre}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Button
            onClick={scrollToNext}
            variant="outline"
            className="group border-primary/50 text-foreground/90 hover:bg-primary/5 hover:border-primary hover:shadow-[0_0_15px_var(--primary)] active:bg-primary/10 active:scale-95 px-8 py-6 md:px-10 md:py-7 text-sm md:text-base font-mono tracking-[0.1em] transition-all touch-manipulation"
          >
            JACK_IN
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CaretDown className="ml-2" size={16} />
            </motion.div>
          </Button>
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

CyberpunkHero.displayName = 'CyberpunkHero'
