import React, { useEffect, useState } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import { motion } from 'framer-motion'

export default function LoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += Math.random() * 15
      if (current >= 100) {
        clearInterval(interval)
        setProgress(100)
        setTimeout(() => {
          onComplete?.()
        }, 500)
      } else {
        setProgress(current)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h2 className="font-heading text-4xl mb-8 text-primary uppercase tracking-[0.2em] animate-pulse" style={{ textShadow: 'var(--neon-glow)' }}>
          INSERT COIN
        </h2>

        <div className="w-64 h-4 border-2 border-primary p-1 relative">
          <div
            className="h-full bg-primary"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              boxShadow: '0 0 10px var(--primary)'
            }}
          />
        </div>

        <p className="mt-4 font-mono text-sm text-mutedForeground">
          LOADING SYSTEM... {Math.round(progress)}%
        </p>
      </div>
    </motion.div>
  )
}
