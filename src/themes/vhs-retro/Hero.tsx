import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

function useVhsGlitchText(text: string, speed = 70) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return displayed
}

export default function VhsRetroHero({
  name,
  genres,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  const typedName = useVhsGlitchText(name, 80)

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 font-mono overflow-hidden">
      {/* VHS tracking lines overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div
          className="absolute left-0 right-0 h-[3px] opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'vhs-scanline-roll 4s linear infinite',
          }}
        />
        <div
          className="absolute left-0 right-0 h-[2px] opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'vhs-scanline-roll 7s linear infinite',
            animationDelay: '2s',
          }}
        />
      </div>

      {/* PLAY indicator */}
      <motion.div
        className="absolute top-6 left-6 z-30 flex items-center gap-2 font-mono text-sm text-primary/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <span className="text-base">▶</span> PLAY
      </motion.div>

      {/* Tape counter */}
      <motion.div
        className="absolute top-6 right-6 z-30 font-mono text-xs text-primary/50 tabular-nums"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ fontFamily: "'VT323', monospace" }}
      >
        00:00:01
      </motion.div>

      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-6 md:mb-10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[14rem] h-auto sm:w-[18rem] md:w-[22rem] lg:w-[26rem]"
              style={{ filter: 'saturate(0.8) contrast(1.1)' }}
            />
          </motion.div>
        )}

        <motion.div
          className="mb-4 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {titleImageUrl ? (
            <img
              src={titleImageUrl}
              alt={name}
              className="w-full max-w-xs sm:max-w-md md:max-w-2xl h-auto"
              style={{ filter: 'saturate(0.7) contrast(1.05)' }}
            />
          ) : (
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-wide text-primary"
              style={{ animation: 'vhs-color-bleed 3s ease infinite' }}
            >
              {typedName}
              <motion.span
                className="inline-block w-[0.55em] h-[1.05em] bg-primary align-middle ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
              />
            </h1>
          )}
        </motion.div>

        <motion.div
          className="text-sm text-muted-foreground mb-6 md:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ fontFamily: "'VT323', monospace", letterSpacing: '0.1em' }}
        >
          ▶ PLAY ── CH 03
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-14 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.span
              key={genre}
              className="px-3 py-1 text-xs font-mono tracking-widest text-primary border border-primary/30 uppercase"
              style={{ fontFamily: "'VT323', monospace", filter: 'saturate(0.8)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
            >
              {genre}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono text-primary border border-primary/40 hover:bg-primary/10 transition-colors tracking-wider uppercase"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            ▶ FF
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ▼
            </motion.span>
          </button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-primary/30 font-mono text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        style={{ fontFamily: "'VT323', monospace" }}
      >
        <motion.span
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ▾ TRACKING ▾
        </motion.span>
      </motion.div>
    </section>
  )
}

VhsRetroHero.displayName = 'VhsRetroHero'
