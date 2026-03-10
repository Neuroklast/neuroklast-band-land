import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from '@phosphor-icons/react'

import type { HeroSlotProps } from '@/lib/types'
type HeroProps = HeroSlotProps;

export default function Hero({ name, genres }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return
      const scrolled = window.scrollY
      const parallaxSpeed = 0.5
      heroRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div ref={heroRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
            >
              <h1 className="text-7xl md:text-9xl font-bold tracking-[0.3em] text-foreground spark-theme-bioshock-glow">
                {name}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative inline-block"
            >
              <div className="spark-theme-deco-line-wrapper">
                <span className="spark-theme-deco-line" />
                <p className="text-xl md:text-2xl tracking-[0.2em] text-muted-foreground px-8">
                  {genres[0]}
                </p>
                <span className="spark-theme-deco-line" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="pt-8"
          >
            <button
              onClick={() => {}}
              className="group relative px-12 py-4 bg-transparent border-2 border-foreground text-foreground tracking-[0.15em] text-sm font-medium overflow-hidden spark-theme-art-deco-button"
            >
              <span className="relative z-10">{"EXPLORE COLLECTION"}</span>
              <div className="absolute inset-0 bg-foreground transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 text-background transition-opacity duration-300">
                {"EXPLORE COLLECTION"}
              </span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8, repeat: Infinity, repeatType: "reverse" }}
            className="pt-16"
          >
            <ArrowDown size={32} weight="thin" className="text-muted-foreground mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
