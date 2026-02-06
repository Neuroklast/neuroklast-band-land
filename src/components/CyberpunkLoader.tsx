import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

export default function CyberpunkLoader({ onLoadComplete }: CyberpunkLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const [scanlineY, setScanlineY] = useState(0)

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onLoadComplete(), 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 100)
    }, 1000)

    const scanlineInterval = setInterval(() => {
      setScanlineY((prev) => (prev + 1) % 100)
    }, 20)

    return () => {
      clearInterval(progressInterval)
      clearInterval(glitchInterval)
      clearInterval(scanlineInterval)
    }
  }, [onLoadComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute h-1 w-full bg-primary/20 blur-sm"
          style={{
            top: `${scanlineY}%`,
            transition: 'top 0.02s linear'
          }}
        />

        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-primary"
              style={{
                top: `${i * 12.5}%`,
                width: '100%'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: 1,
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <motion.div
          className="text-6xl sm:text-8xl font-bold text-primary mb-12 text-center"
          animate={{
            textShadow: glitchActive
              ? [
                  '5px 0 10px oklch(0.55 0.22 25), -5px 0 10px oklch(0.65 0.25 190)',
                  '-5px 0 10px oklch(0.55 0.22 25), 5px 0 10px oklch(0.65 0.25 190)',
                  '0 0 20px oklch(0.55 0.22 25)'
                ]
              : '0 0 20px oklch(0.55 0.22 25)'
          }}
          transition={{ duration: 0.3 }}
        >
          NEUROKLAST
        </motion.div>

        <div className="w-64 sm:w-80 mx-auto">
          <div className="relative h-2 bg-card border border-border overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progress}%` }}
              animate={{
                boxShadow: glitchActive
                  ? '0 0 20px oklch(0.55 0.22 25)'
                  : '0 0 10px oklch(0.55 0.22 25 / 0.5)'
              }}
            />
          </div>

          <motion.div 
            className="mt-4 text-sm tracking-wider text-muted-foreground font-mono"
            animate={{
              opacity: glitchActive ? [1, 0.3, 1] : 1
            }}
          >
            LOADING {progress}%
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
