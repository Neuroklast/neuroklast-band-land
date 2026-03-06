import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

const VHS_LINES = [
  'INSERTING TAPE .............',
  'HEAD ALIGNMENT ............ OK',
  'TRACKING ADJUST ...........',
  'LOADING AUDIO STREAM ......',
  'COLOR CALIBRATION .........',
  'SIGNAL LOCK ............... OK',
  'PLAYBACK READY ............',
]

export default function VhsRetroLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
  const [progress, setProgress] = useState(0)
  const [visibleLines, setVisibleLines] = useState(0)
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
        const increment = prev < 40 ? 3 : prev < 75 ? 2 : 1
        return Math.min(prev + increment, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const lineIndex = Math.floor((progress / 100) * VHS_LINES.length)
    setVisibleLines(Math.min(lineIndex + 1, VHS_LINES.length))
  }, [progress])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background font-mono overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* VHS tracking lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[3px] opacity-25"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'vhs-scanline-roll 3s linear infinite',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
          }}
        />
      </div>

      <div className="w-full max-w-lg px-6 space-y-4 relative z-10">
        <motion.div
          className="text-primary text-sm md:text-base tracking-widest uppercase mb-6 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ fontFamily: "'VT323', monospace" }}
        >
          <span>▶</span> VHS LOADING
          <motion.span
            className="text-primary/60"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            ●
          </motion.span>
        </motion.div>

        <div className="space-y-1 text-xs md:text-sm min-h-[10rem]" style={{ fontFamily: "'VT323', monospace" }}>
          {VHS_LINES.slice(0, visibleLines).map((line, index) => (
            <motion.div
              key={index}
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-primary/40">▸ </span>
              {line}
              {index === visibleLines - 1 && progress < 100 && (
                <motion.span
                  className="inline-block w-2 h-3.5 bg-primary ml-1 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                />
              )}
            </motion.div>
          ))}

          {progress >= 100 && (
            <motion.div
              className="text-primary mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ animation: 'vhs-color-bleed 2s ease infinite' }}
            >
              ▶ PLAY
            </motion.div>
          )}
        </div>

        <div className="pt-2 space-y-2">
          <div className="w-full h-1.5 bg-secondary border border-primary/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary/70"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div
            className="flex justify-between text-xs text-muted-foreground/70 tabular-nums tracking-wider"
            style={{ fontFamily: "'VT323', monospace" }}
          >
            <span>LOADING...</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

VhsRetroLoadingScreen.displayName = 'VhsRetroLoadingScreen'
