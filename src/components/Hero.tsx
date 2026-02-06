import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import logoPng from '@/assets/images/NK_BAPHOMET.png'

interface HeroProps {
  name: string
  genres: string[]
}

export default function Hero({ name, genres }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full" viewBox="0 0 1200 800">
          <motion.line
            x1="0"
            y1="400"
            x2="1200"
            y2="400"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          />
          <motion.line
            x1="600"
            y1="0"
            x2="600"
            y2="200"
            stroke="oklch(0.55 0.22 25)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <img 
            src={logoPng} 
            alt="NEUROKLAST Logo" 
            className="w-48 h-auto md:w-64 lg:w-80"
          />
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {name}
        </motion.h1>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {genres.map((genre, index) => (
            <Badge
              key={genre}
              variant="outline"
              className="border-primary text-primary px-4 py-1.5 text-xs font-medium tracking-wider"
            >
              {genre}
            </Badge>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
