import { motion, AnimatePresence } from 'framer-motion'
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
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onLoadComplete(), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    const glitchInterval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 150)
    }, 800)

    const scanlineInterval = setInterval(() => {
      setScanlineY(prev => (prev + 5) % 100)
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
              top: `${(i * 5)}%`,
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
              delay: i * 0.05,
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
                textShadow: [
                  '0 0 20px oklch(0.55 0.22 25 / 0.5)',
                  '0 0 40px oklch(0.55 0.22 25 / 0.8)',
                  '0 0 20px oklch(0.55 0.22 25 / 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              NEUROKLAST
            </motion.div>
            
            {glitchActive && (
              <>
                <div className="absolute inset-0 text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest opacity-70" style={{
                  color: 'oklch(0.65 0.25 190)',
                  transform: 'translate(-3px, 2px)',
                  mixBlendMode: 'screen',
                }}>
                  NEUROKLAST
                </div>
                <div className="absolute inset-0 text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest opacity-70" style={{
                  color: 'oklch(0.55 0.22 25)',
                  transform: 'translate(3px, -2px)',
                  mixBlendMode: 'screen',
                }}>
                  NEUROKLAST
                </div>
              </>
            )}
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            className="text-xs sm:text-sm tracking-[0.3em] text-muted-foreground font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIALIZING SYSTEM
          </motion.div>

          <div className="relative h-1 bg-secondary/30 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                boxShadow: '0 0 20px oklch(0.55 0.22 25 / 0.8)',
              }}
              initial={{ width: '0%' }}
            />
            
            <motion.div
              className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{
                x: ['0%', '100%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>

          <motion.div
            className="text-2xl sm:text-3xl font-mono font-bold tabular-nums"
            animate={{
              color: [
                'oklch(0.55 0.22 25)',
                'oklch(0.65 0.25 25)',
                'oklch(0.55 0.22 25)',
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            {Math.min(Math.floor(progress), 100)}%
          </motion.div>

          <div className="flex justify-center gap-1 mt-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-8 bg-primary/30 rounded-full"
                animate={{
                  scaleY: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
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
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.div
          className="text-[10px] sm:text-xs font-mono text-muted-foreground/50 tracking-widest"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CYBERPUNK PROTOCOL v2.0.77
        </motion.div>
      </div>
    </motion.div>
  )
}
