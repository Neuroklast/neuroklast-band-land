import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
const logoImage = ""

import type { HeroSlotProps } from '@/lib/types'
type HeroProps = HeroSlotProps;

const LISTEN_NOW_TEXT = 'Listen Now'
const TOUR_DATES_TEXT = 'Tour Dates'

export default function Hero({ name, logoUrl }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden zardonic-theme-scanline-effect">
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 zardonic-theme-noise-effect" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative mx-auto w-fit zardonic-theme-hero-logo-glitch">
            <img
              src={logoUrl || logoImage}
              alt={name || "ZARDONIC"}
              className="h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hover-chromatic-image"
            />
            <img
              src={logoUrl || logoImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hero-logo-r"
            />
            <img
              src={logoUrl || logoImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-40 md:h-56 lg:h-72 w-auto object-contain brightness-110 zardonic-theme-hero-logo-b"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mt-12 flex gap-4 justify-center flex-wrap"
        >
          <Button
            onClick={() => (() => {})()}
            size="lg"
            className="uppercase font-mono zardonic-theme-hover-glitch zardonic-theme-hover-noise relative zardonic-theme-cyber-border"
          >
            <span className="zardonic-theme-hover-chromatic">{LISTEN_NOW_TEXT}</span>
          </Button>
          <Button
            onClick={() => (() => {})()}
            size="lg"
            variant="outline"
            className="uppercase font-mono zardonic-theme-hover-glitch zardonic-theme-hover-noise relative zardonic-theme-cyber-border"
          >
            <span className="zardonic-theme-hover-chromatic">{TOUR_DATES_TEXT}</span>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
