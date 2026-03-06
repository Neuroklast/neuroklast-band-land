import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

export default function MinimalLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
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
        const increment = prev < 60 ? 2.5 : prev < 90 ? 1.5 : 0.8
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
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-xs px-8">
        <div className="text-lg font-heading font-semibold tracking-tight text-foreground">
          Loading
        </div>

        <div className="w-full h-px bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-foreground/60"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="text-xs text-muted-foreground tabular-nums">
          {Math.floor(progress)}%
        </div>
      </div>
    </motion.div>
  )
}

MinimalLoadingScreen.displayName = 'MinimalLoadingScreen'
