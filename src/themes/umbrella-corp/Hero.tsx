import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { HeroSlotProps } from '@/lib/types'

const LISTEN_NOW_TEXT = 'Listen Now'
const TOUR_DATES_TEXT = 'Tour Dates'

export default function Hero({ name, logoUrl }: HeroSlotProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="umbrella-corp-biohazard-ring absolute" />
        <div className="umbrella-corp-biohazard-ring-inner absolute" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center px-4"
      >
        {logoUrl ? (
          <motion.div
            className="mb-8 relative mx-auto w-fit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={logoUrl}
              alt={name || 'Artist'}
              className="h-40 md:h-56 lg:h-72 w-auto object-contain"
            />
          </motion.div>
        ) : (
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground uppercase mb-8 umbrella-corp-glow-text"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {name}
          </motion.h1>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex gap-4 justify-center flex-wrap"
        >
          <Button
            size="lg"
            className="uppercase font-mono tracking-wider umbrella-corp-card"
          >
            {LISTEN_NOW_TEXT}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="uppercase font-mono tracking-wider umbrella-corp-card"
          >
            {TOUR_DATES_TEXT}
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
