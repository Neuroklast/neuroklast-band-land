import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

export default function ElegantLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
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
      <div className="flex flex-col items-center gap-8 w-full max-w-xs px-8">
        <motion.div
          className="text-lg font-heading font-semibold tracking-wide text-foreground"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Loading
        </motion.div>

        {/* Ornamental divider above progress */}
        <div className="flex items-center gap-2 w-full">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/30" />
          <span className="text-primary/50 text-[10px]">✦</span>
          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/30" />
        </div>

        {/* Golden progress bar */}
        <div className="w-full h-px bg-border overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, var(--primary), var(--accent, var(--primary)))',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          />
        </div>

        <motion.div
          className="text-xs font-body text-muted-foreground tabular-nums tracking-widest"
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

ElegantLoadingScreen.displayName = 'ElegantLoadingScreen'
