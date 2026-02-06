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
          setTimeout(() => onLoadComplete(), 300)
          return 100
        }
        return prev + 2
      })
    }, 30)

    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 100)
    }, 800)

    const scanlineInterval = setInterval(() => {
      setScanlineY((prev) => (prev + 5) % 100)
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
          style={{
            top: `${scanlineY}%`,
            height: '20%',
            filter: 'blur(2px)',
          }}
        />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
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
        </div>

        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            style={{
              top: `${i * 5}%`,
              left: 0,
              right: 0,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: [0, 1, 1, 0],
              opacity: [0, 0.3, 0.3, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.5 }}
          className={glitchActive ? 'glitch-effect' : ''}
        >
          <div className="mb-8 relative">
            <motion.div
              className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest"
              animate={{
                textShadow: glitchActive
                  ? [
                      '0 0 10px oklch(0.55 0.22 25)',
                      '0 0 30px oklch(0.65 0.25 25)',
                      '0 0 10px oklch(0.55 0.22 25)',
                    ]
                  : '0 0 20px oklch(0.55 0.22 25 / 0.5)',
              }}
              transition={{ duration: 0.1 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                NEUROKLAST
              </span>
            </motion.div>
            <div className="mt-2 text-sm tracking-[0.3em] text-muted-foreground uppercase">
              INITIALIZING SYSTEM
            </div>
          </div>

          <div className="relative w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
              style={{ width: `${progress}%` }}
              animate={{
                boxShadow: [
                  '0 0 10px oklch(0.55 0.22 25 / 0.5)',
                  '0 0 20px oklch(0.55 0.22 25 / 0.8)',
                  '0 0 10px oklch(0.55 0.22 25 / 0.5)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>LOADING: {progress}%</span>
            </div>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-4 bg-primary/30"
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                    backgroundColor: [
                      'oklch(0.55 0.22 25 / 0.3)',
                      'oklch(0.55 0.22 25)',
                      'oklch(0.55 0.22 25 / 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
