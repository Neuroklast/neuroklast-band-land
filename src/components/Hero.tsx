import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import logoPng from '@/assets/images/NK_BAPHOMET.png'
import titlePng from '@/assets/images/titel.png'

interface HeroProps {
  name: string
  genres: string[]
}

export default function Hero({ name, genres }: HeroProps) {
  const [glitchLogo, setGlitchLogo] = useState(false)
  const [glitchTitle, setGlitchTitle] = useState(false)

  useEffect(() => {
    const logoInterval = setInterval(() => {
      if (Math.random() > 0.75) {
        setGlitchLogo(true)
        setTimeout(() => setGlitchLogo(false), 300)
      }
    }, 5000)

    const titleInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchTitle(true)
        setTimeout(() => setGlitchTitle(false), 300)
      }
    }, 6000)

    return () => {
      clearInterval(logoInterval)
      clearInterval(titleInterval)
    }
  }, [])

  const scrollToGigs = () => {
    const element = document.getElementById('gigs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 py-16 md:py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.50_0.22_25/0.03)_0%,transparent_60%)]" />
        
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <motion.polygon
            points="600,250 750,450 600,550 450,450"
            stroke="oklch(0.50 0.22 25)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 3, delay: 0.5 }}
          />
          <motion.circle
            cx="600"
            cy="400"
            r="200"
            stroke="oklch(0.50 0.22 25)"
            strokeWidth="0.5"
            opacity="0.2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1 }}
          />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          className="flex justify-center mb-8 md:mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <img 
            src={logoPng} 
            alt="NEUROKLAST Logo" 
            className={`w-[20rem] h-auto sm:w-[24rem] md:w-[28rem] lg:w-[32rem] xl:w-[36rem] ${glitchLogo ? 'red-glitch-element' : ''}`}
            style={{ filter: 'drop-shadow(0 0 30px oklch(0.50 0.22 25 / 0.2))' }}
          />
        </motion.div>

        <motion.div
          className="mb-4 md:mb-6 flex justify-center w-full px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img 
            src={titlePng} 
            alt="NEUROKLAST" 
            className={`w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl h-auto ${glitchTitle ? 'red-glitch-element' : ''}`}
          />
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10 md:mb-14 px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
            >
              <Badge
                variant="outline"
                className="border-primary/40 text-primary/80 px-3 py-1 md:px-4 md:py-1.5 text-[9px] md:text-[10px] font-mono tracking-[0.08em] hover:bg-primary/5 hover:border-primary/60 transition-colors touch-manipulation"
              >
                {genre}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Button
            onClick={scrollToGigs}
            variant="outline"
            className="group border-primary/40 text-foreground/80 hover:bg-primary/5 hover:border-primary/60 hover:text-foreground active:bg-primary/10 active:scale-95 active:border-primary px-8 py-6 md:px-10 md:py-7 text-sm md:text-base font-mono tracking-[0.08em] transition-all touch-manipulation shadow-lg shadow-primary/5 hover:shadow-primary/10 active:shadow-primary/20"
          >
            ENTER
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CaretDown className="ml-2" size={16} />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-primary/30"
        >
          <CaretDown size={18} className="md:hidden" />
          <CaretDown size={20} className="hidden md:block" />
        </motion.div>
      </motion.div>
    </section>
  )
}
