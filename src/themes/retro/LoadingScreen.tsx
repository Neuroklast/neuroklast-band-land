import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

const BOOT_LINES = [
  'BIOS v2.04 ... OK',
  'Memory test: 640K .............. OK',
  'Initializing audio subsystem ...',
  'Loading frequency modules ......',
  'Mounting /dev/sound0 ........... OK',
  'Synth engine calibration .......',
  'Signal chain verified ..........',
  'Connecting to NEUROKLAST net ...',
]

export default function RetroLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
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
        const increment = prev < 50 ? 3 : prev < 85 ? 2 : 1
        return Math.min(prev + increment, 100)
      })
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const lineIndex = Math.floor((progress / 100) * BOOT_LINES.length)
    setVisibleLines(Math.min(lineIndex + 1, BOOT_LINES.length))
  }, [progress])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => onCompleteRef.current(), 600)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background font-mono"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-lg px-6 space-y-4">
        <motion.div
          className="text-primary text-sm md:text-base tracking-widest uppercase mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {'>'} NEUROKLAST BOOT SEQUENCE v1.0
        </motion.div>

        <div className="space-y-1 text-xs md:text-sm min-h-[12rem]">
          {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
            <motion.div
              key={index}
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-primary/50">{'>'} </span>
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
            >
              {'>'} SYSTEM READY_
            </motion.div>
          )}
        </div>

        <div className="pt-2 space-y-2">
          <div className="w-full h-1 bg-secondary border border-primary/20 overflow-hidden">
            <motion.div
              className="h-full bg-primary/80"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground/70 tabular-nums tracking-wider">
            <span>LOADING</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

RetroLoadingScreen.displayName = 'RetroLoadingScreen'
