import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface CardProps {
  children: ReactNode
}

export default function Card({ children }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-accent/5 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2" />
      
      <div className="relative bg-card border border-border p-6 transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 overflow-hidden">
        <div className="glitch-noir-noise-subtle" />
        
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-accent/10 to-transparent" />
          {isHovered && (
            <>
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent skew-x-12"
              />
            </>
          )}
        </div>

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-50" />
        
        <div className="relative z-10">
          {children}
        </div>

        <div className="absolute top-2 right-2 w-2 h-2 bg-accent glitch-noir-pulse" />
        <div className="absolute top-2 left-2 w-1 h-1 bg-muted-foreground/30" />
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-muted-foreground/30" />
        
        <div className="absolute bottom-2 left-2 text-muted-foreground font-mono text-xs opacity-20 flex items-center gap-1">
          <span className="glitch-noir-flicker">█</span>
          <span>{'[DATA]'}</span>
        </div>
      </div>
    </motion.div>
  )
}
