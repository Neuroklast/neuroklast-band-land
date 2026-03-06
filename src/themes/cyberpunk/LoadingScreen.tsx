import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

const STAGES = [
  { min: 0, max: 20, label: 'ESTABLISHING NEURAL LINK' },
  { min: 20, max: 40, label: 'LOADING HOLOGRAPHIC UI' },
  { min: 40, max: 60, label: 'SYNCING DATA STREAMS' },
  { min: 60, max: 80, label: 'INITIALIZING GRID' },
  { min: 80, max: 100, label: 'SYSTEM ONLINE' },
]

function getStageLabel(progress: number): string {
  for (const stage of STAGES) {
    if (progress >= stage.min && progress < stage.max) return stage.label
  }
  return STAGES[STAGES.length - 1].label
}

const dataStreamChars = '01アイウエオカキクケコ█▓▒░'

function generateDataLine(length: number): string {
  return Array.from(
    { length },
    () => dataStreamChars[Math.floor(Math.random() * dataStreamChars.length)]
  ).join('')
}

export default function CyberpunkLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [dataLines, setDataLines] = useState<string[]>([])
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        const increment = prev < 50 ? 2.5 : prev < 80 ? 1.5 : prev < 95 ? 0.8 : 100 - prev
        return Math.min(prev + increment, 100)
      })
    }, 45)
    return () => clearInterval(interval)
  }, [])

  // Data stream effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDataLines((prev) => {
        const next = [...prev, generateDataLine(30)]
        return next.length > 6 ? next.slice(-6) : next
      })
    }, 300)
    return () => clearInterval(interval)
  }, [])

  // Trigger onComplete at 100%
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  const stageLabel = getStageLabel(progress)

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Data stream background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {dataLines.map((line, i) => (
          <motion.div
            key={`${i}-${line}`}
            className="font-mono text-[10px] text-primary/60 whitespace-nowrap cyberpunk-data-stream"
            style={{ position: 'absolute', top: `${15 + i * 12}%`, left: '5%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.3 }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-md">
        {/* Header */}
        <motion.div
          className="text-center font-mono text-primary text-sm md:text-base tracking-[0.15em] cyberpunk-neon-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {'> CYBERPUNK.SYS <'}
        </motion.div>

        {/* Stage label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stageLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-xs text-primary/80 tracking-wider text-center"
          >
            {'> '}{stageLabel}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full">
          <div className="w-full h-1 bg-secondary/50 overflow-hidden relative">
            <motion.div
              className="h-full bg-primary cyberpunk-neon-line"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            {/* Holographic shimmer on progress bar */}
            <motion.div
              className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ left: ['-2rem', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Percentage */}
          <div className="flex justify-between items-center mt-2">
            <div className="font-mono text-[10px] text-primary/50 tracking-wider">
              PROGRESS
            </div>
            <div className="font-mono text-xs text-primary/90 tabular-nums tracking-wider">
              {Math.floor(progress)}%
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg max-h-64 pointer-events-none">
          <div className="cyberpunk-corner-tl" />
          <div className="cyberpunk-corner-tl-v" />
          <div className="cyberpunk-corner-br" />
          <div className="cyberpunk-corner-br-v" />
        </div>
      </div>
    </motion.div>
  )
}

CyberpunkLoadingScreen.displayName = 'CyberpunkLoadingScreen'
