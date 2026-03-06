import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'

const STAGES = [
  { min: 0, max: 20, label: 'INITIALIZING NEURAL INTERFACE' },
  { min: 20, max: 40, label: 'LOADING CORE SYSTEMS' },
  { min: 40, max: 60, label: 'SYNCHRONIZING WETWARE' },
  { min: 60, max: 80, label: 'ESTABLISHING CONNECTION' },
  { min: 80, max: 100, label: 'SYSTEM READY' },
]

function getStageLabel(progress: number): string {
  for (const stage of STAGES) {
    if (progress >= stage.min && progress < stage.max) return stage.label
  }
  return STAGES[STAGES.length - 1].label
}

const lightBeamParams = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i / 20) * 100}%`,
  duration: 2 + Math.random() * 3,
  delay: Math.random() * 4,
}))

export default function ZardonicLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        let increment: number
        if (prev < 50) {
          increment = 3
        } else if (prev < 80) {
          increment = 1.5
        } else if (prev < 95) {
          increment = 0.5
        } else {
          increment = 100 - prev
        }
        return Math.min(prev + increment, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onCompleteRef.current()
      }, 800)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  const stageLabel = getStageLabel(progress)

  return (
    <motion.div
      className="full-page-noise periodic-noise-glitch fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scanline overlay */}
      <div className="scanline-effect pointer-events-none fixed inset-0" />

      {/* CRT overlay */}
      <div className="crt-overlay pointer-events-none" />

      {/* CRT vignette */}
      <div className="crt-vignette pointer-events-none" />

      {/* Falling light beams */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {lightBeamParams.map((beam, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            style={{ left: beam.left, top: '-8rem' }}
            animate={{ top: ['-8rem', '100vh'] }}
            transition={{
              duration: beam.duration,
              delay: beam.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-md">
        {/* Header */}
        <div className="data-label text-center text-primary text-lg tracking-widest">
          {'> ZARDONIC.SYS v2.077 <'}
        </div>

        {/* Progress bar container */}
        <div className="w-full">
          {/* Stage label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stageLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="data-readout text-center mb-2"
            >
              {'> '}{stageLabel}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Percentage */}
          <div className="data-readout text-right mt-1">
            {Math.floor(progress)}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

ZardonicLoadingScreen.displayName = 'ZardonicLoadingScreen'
