import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CaretDown } from '@phosphor-icons/react'
import logoPng from '@/assets/images/NK_BAPHOMET.png'

interface HeroProps {
  name: string
  genres: string[]
}

export default function Hero({ name, genres }: HeroProps) {
  const scrollToGigs = () => {
    const element = document.getElementById('gigs')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.55_0.22_25/0.05)_0%,transparent_70%)]" />
        
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <motion.line
            x1="0"
            y1="400"
            x2="1200"
            y2="400"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="2"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          <motion.line
            x1="600"
            y1="0"
            x2="600"
            y2="200"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="2"
            opacity="0.3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
          <motion.circle
            cx="600"
            cy="400"
            r="250"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="1"
            opacity="0.1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, type: 'spring', stiffness: 100 }}
        >
          <img 
            src={logoPng} 
            alt="NEUROKLAST Logo" 
            className="w-40 h-auto md:w-56 lg:w-72 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]"
          />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {name}
        </motion.h1>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          {(genres || []).map((genre, index) => (
            <motion.div
              key={genre}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
            >
              <Badge
                variant="outline"
                className="border-primary/50 text-primary px-5 py-2 text-xs font-medium tracking-widest hover:bg-primary/10 transition-colors"
              >
                {genre}
              </Badge>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <Button
            onClick={scrollToGigs}
            variant="outline"
            className="group border-primary/50 text-foreground hover:bg-primary/10 hover:border-primary px-8 py-6 text-sm tracking-wider"
          >
            EXPLORE
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CaretDown className="ml-2" size={16} />
            </motion.div>
          </Button>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-primary/50"
        >
          <CaretDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  )
}
