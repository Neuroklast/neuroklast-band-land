import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

export default function ArtDecoCyberpunkLoadingScreen({
  onComplete,
}: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const increment = prev < 60 ? 2 : prev < 90 ? 1.2 : 0.6
        return Math.min(prev + increment, 100)
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Geometric corner accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-6 w-16 h-16 border-t border-l border-primary/30" />
        <div className="absolute top-6 right-6 w-16 h-16 border-t border-r border-primary/30" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-b border-l border-primary/30" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b border-r border-primary/30" />
      </div>

      <div className="flex flex-col items-center gap-8 w-full max-w-xs px-8">
        {/* Rotating geometric diamond */}
        <motion.div
          className="relative w-12 h-12"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute inset-0 rotate-45 border border-primary/50" />
          <motion.div
            className="absolute inset-2 rotate-45 border border-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        <motion.div
          className="text-sm font-heading font-bold tracking-[0.3em] uppercase text-foreground"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Loading
        </motion.div>

        {/* Art Deco divider above progress */}
        <div className="flex items-center gap-2 w-full">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
          <span className="w-1.5 h-1.5 rotate-45 border border-primary/50" />
          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-border/50 overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background:
                'linear-gradient(90deg, var(--primary), var(--accent, var(--primary)))',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>

        <motion.div
          className="text-xs font-heading text-muted-foreground tabular-nums tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {Math.floor(progress)}%
        </motion.div>
      </div>
    </motion.div>
  )
}

ArtDecoCyberpunkLoadingScreen.displayName = 'ArtDecoCyberpunkLoadingScreen'
