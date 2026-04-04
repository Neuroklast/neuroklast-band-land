import React from 'react'
import type { HeroSlotProps } from '@/lib/types'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function Hero({ name, genres }: HeroSlotProps) {
  const { t } = useTranslation()

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Synthwave Sun */}
      <div className="sun-bg absolute" />

      {/* Overlay gradient to blend bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          className="hero-title text-6xl md:text-8xl font-black mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {name || t('hero.defaultArtist', 'ARTIST NAME')}
        </motion.h1>

        {genres && genres.length > 0 && (
          <motion.p
            className="text-xl md:text-2xl text-foreground font-mono tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ textShadow: '0 0 5px var(--primary)' }}
          >
            {genres.join(' • ')}
          </motion.p>
        )}
      </div>
    </section>
  )
}
