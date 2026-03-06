import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { LoadingScreenSlotProps } from '@/lib/types'
import './styles.css'

export default function NeonLoadingScreen({ onComplete }: LoadingScreenSlotProps) {
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'var(--background)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-sm px-8">
        <motion.div
          className="text-2xl font-heading font-bold tracking-[0.3em] uppercase"
          style={{
            color: 'var(--primary)',
            textShadow: '0 0 10px var(--primary), 0 0 30px var(--primary)',
          }}
          animate={{
            textShadow: [
              '0 0 10px var(--primary), 0 0 30px var(--primary)',
              '0 0 15px var(--primary), 0 0 50px var(--primary), 0 0 80px var(--accent)',
              '0 0 10px var(--primary), 0 0 30px var(--primary)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Loading
        </motion.div>

        <div className="w-full relative">
          <div
            className="w-full h-[2px] overflow-hidden"
            style={{
              background: 'var(--border)',
              boxShadow: '0 0 2px var(--border)',
            }}
          >
            <motion.div
              className="h-full relative"
              style={{
                background: 'var(--primary)',
                boxShadow:
                  '0 0 8px var(--primary), 0 0 20px var(--primary), 0 0 40px var(--accent)',
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div
            className="absolute -top-px -bottom-px left-0 right-0 pointer-events-none"
            style={{
              border: '1px solid var(--primary)',
              boxShadow: '0 0 4px var(--primary)',
              opacity: 0.3,
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <motion.span
            className="text-sm font-mono tabular-nums tracking-widest"
            style={{ color: 'var(--primary)' }}
            animate={{
              textShadow: [
                '0 0 4px var(--primary)',
                '0 0 8px var(--primary)',
                '0 0 4px var(--primary)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {Math.floor(progress)}%
          </motion.span>
          <span
            className="text-xs font-mono tracking-wider uppercase"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {progress < 100 ? 'Initializing' : 'Complete'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

NeonLoadingScreen.displayName = 'NeonLoadingScreen'
