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
    }, 30)

    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 800)

    const scanlineInterval = setInterval(() => {
      setScanlineY((prev) => (prev >= 100 ? 0 : prev + 2))
    }, 50)

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
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"
          style={{
            top: `${scanlineY}%`,
          }}
        />

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              oklch(0.55 0.22 25 / 0.1) 2px,
              oklch(0.55 0.22 25 / 0.1) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              oklch(0.55 0.22 25 / 0.1) 2px,
              oklch(0.55 0.22 25 / 0.1) 4px
            )
          `
        }} />

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-primary"
            style={{
              top: `${i * 12.5}%`,
              right: 0,
              width: '100%'
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 1, 0],
              opacity: [0, 0.3, 0.3, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center"
        animate={{ 
          scale: glitchActive ? [1, 1.02, 0.98, 1] : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-8">
          <motion.div
            className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest"
            animate={{
              textShadow: glitchActive
                ? [
                    '5px 0 10px oklch(0.55 0.22 25), -5px 0 10px oklch(0.65 0.25 190)',
                    '-5px 0 10px oklch(0.65 0.25 190), 5px 0 10px oklch(0.55 0.22 25)',
                    '0 0 30px oklch(0.55 0.22 25)'
                  ]
                : '0 0 20px oklch(0.55 0.22 25 / 0.5)'
            }}
            transition={{ duration: 0.3 }}
          >
            NEUROKLAST
          </motion.div>
        </div>

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
      </motion.div>
    </motion.div>
  )
}
