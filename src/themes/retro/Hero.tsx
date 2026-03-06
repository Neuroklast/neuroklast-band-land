import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { HeroSlotProps } from '@/lib/types'
import './styles.css'

function useTypewriter(text: string, speed = 80) {
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

export default function RetroHero({
  name,
  genres,
  editMode,
  onEdit,
  logoUrl,
  titleImageUrl,
}: HeroSlotProps) {
  const typedName = useTypewriter(name, 90)

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20 font-mono">
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {logoUrl && (
          <motion.div
            className="flex justify-center mb-6 md:mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src={logoUrl}
              alt={`${name} Logo`}
              className="w-[14rem] h-auto sm:w-[18rem] md:w-[22rem] lg:w-[26rem]"
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
            />
          ) : (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-wide text-primary">
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
        >
          {'>'} SYSTEM ONLINE
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
              className="px-3 py-1 text-xs font-mono tracking-widest text-primary border border-primary/40 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
            >
              [{genre}]
            </motion.span>
          ))}
          {editMode && onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs font-mono tracking-widest text-primary border border-primary/40 uppercase hover:bg-primary/10 transition-colors ml-2"
            >
              [EDIT]
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono text-primary border border-primary/50 hover:bg-primary/10 transition-colors tracking-wider uppercase"
          >
            {'>'} EXPLORE_
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
      >
        <motion.span
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ▾ SCROLL ▾
        </motion.span>
      </motion.div>
    </section>
  )
}

RetroHero.displayName = 'RetroHero'
