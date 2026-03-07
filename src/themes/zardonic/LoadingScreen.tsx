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

const BOOT_MESSAGE_INTERVAL_MS = 600
const GLITCH_PROBABILITY = 0.5
const SCAN_LINE_START_OFFSET = 15
const SCAN_LINE_SPACING = 14

const lightBeamParams = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i / 20) * 100}%`,
  duration: 2 + (i % 5) * 0.6,
  delay: (i * 0.3) % 4,
}))

const scanLineParams = Array.from({ length: 6 }, (_, i) => ({
  top: `${SCAN_LINE_START_OFFSET + i * SCAN_LINE_SPACING}%`,
  duration: 3 + i * 0.5,
  delay: i * 0.7,
}))

const BOOT_MESSAGES = [
  'NEURAL_CORE: LOADING',
  'SYNC: ESTABLISHING',
  'FREQ: 140-180 BPM',
  'MATRIX: CALIBRATING',
  'HARDWIRE: ACTIVE',
]

const GLITCH_CHARS = '01アイウエオNEUROKLAST'

export default function ZardonicLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [bootMessages, setBootMessages] = useState<string[]>([])
  const [glitchedLabel, setGlitchedLabel] = useState('')
  const [isGlitching, setIsGlitching] = useState(false)
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

  // Boot message sequence
  useEffect(() => {
    let idx = 0
    const add = () => {
      if (idx < BOOT_MESSAGES.length) {
        const msg = BOOT_MESSAGES[idx++]
        setBootMessages((prev) => [...prev.slice(-4), msg])
        setTimeout(add, BOOT_MESSAGE_INTERVAL_MS)
      }
    }
    const t = setTimeout(add, 400)
    return () => clearTimeout(t)
  }, [])

  const stageLabel = getStageLabel(progress)

  // Glitch text for stage label
  useEffect(() => {
    setIsGlitching(true)
    let frame = 0
    const frames = 6
    const id = setInterval(() => {
      frame++
      if (frame < frames) {
        setGlitchedLabel(
          stageLabel
            .split('')
            .map((ch) =>
              ch === ' ' ? ' ' : Math.random() > GLITCH_PROBABILITY ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch
            )
            .join('')
        )
      } else {
        setGlitchedLabel(stageLabel)
        setIsGlitching(false)
        clearInterval(id)
      }
    }, 40)
    return () => clearInterval(id)
  }, [stageLabel])

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

      {/* Horizontal sweep scan lines */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {scanLineParams.map((line, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-primary/20"
            style={{ top: line.top, left: 0, right: 0 }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: line.duration,
              delay: line.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* HUD corner decorations */}
      <div className="pointer-events-none fixed inset-0">
        {/* top-left */}
        <motion.div
          className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
        {/* top-right */}
        <motion.div
          className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
        {/* bottom-left */}
        <motion.div
          className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        />
        {/* bottom-right */}
        <motion.div
          className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-primary/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
      </div>

      {/* Boot messages — bottom-left */}
      <div className="pointer-events-none fixed bottom-16 left-8 flex flex-col gap-1">
        <AnimatePresence>
          {bootMessages.map((msg, i) => (
            <motion.div
              key={`boot-${i}-${msg}`}
              className="data-readout text-primary/60 text-[10px]"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 0.7, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {'> '}{msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-8 w-full max-w-md">
        {/* Central geometric sigil — two concentric rotating squares + crosshair */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <motion.div
            className="absolute w-16 h-16 border-2 border-primary/70"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-10 h-10 border border-primary/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          {/* crosshair */}
          <motion.div
            className="absolute w-px h-6 bg-primary/60"
            animate={{ scaleY: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-6 h-px bg-primary/60"
            animate={{ scaleX: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Header */}
        <div className="data-label text-center text-primary text-lg tracking-widest">
          {'> ZARDONIC.SYS v2.077 <'}
        </div>

        {/* Progress bar container */}
        <div className="w-full">
          {/* Stage label with glitch animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stageLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="data-readout text-center mb-2"
            >
              {'> '}{isGlitching ? glitchedLabel : stageLabel}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar with shimmer */}
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-primary relative overflow-hidden"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            >
              <motion.div
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
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
