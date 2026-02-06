import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logoImage from '@/assets/images/NK_BAPHOMET.png'

interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

const hackingTexts = [
  '> INITIALIZING NEURAL INTERFACE...',
  '> LOADING CYBERNETIC MODULES...',
  '> ESTABLISHING SECURE CONNECTION...',
  '> DECRYPTING AUDIO MATRIX...',
  '> COMPILING SOUND SEQUENCES...',
  '> SYNCHRONIZING BASS FREQUENCIES...',
  '> ACTIVATING HARD TECHNO PROTOCOL...',
  '> INJECTING INDUSTRIAL WAVEFORMS...',
  '> LOADING DNB SUBROUTINES...',
  '> DARK ELECTRO SYSTEMS ONLINE...',
  '> NEURAL SYNC COMPLETE...',
  '> ACCESS GRANTED >>>'
]

export default function CyberpunkLoader({ onLoadComplete }: CyberpunkLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [glitch, setGlitch] = useState(false)
  const [hackingText, setHackingText] = useState(hackingTexts[0])
  const [matrixChars, setMatrixChars] = useState<string[]>([])

  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテト'.split('')
    const randomChars = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)])
    setMatrixChars(randomChars)

    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 50)
      }
    }, 400)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 8
        const progressIndex = Math.floor((newProgress / 100) * hackingTexts.length)
        if (progressIndex < hackingTexts.length) {
          setHackingText(hackingTexts[progressIndex])
        }
        
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onLoadComplete, 500)
          return 100
        }
        return Math.min(newProgress, 100)
      })
    }, 150)

    const matrixInterval = setInterval(() => {
      setMatrixChars(prev => {
        const newChars = [...prev]
        const randomIndex = Math.floor(Math.random() * newChars.length)
        newChars[randomIndex] = chars[Math.floor(Math.random() * chars.length)]
        return newChars
      })
    }, 100)

    return () => {
      clearInterval(interval)
      clearInterval(glitchInterval)
      clearInterval(matrixInterval)
    }
  }, [onLoadComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-10 gap-2 p-4 text-primary font-mono text-xs">
          {matrixChars.map((char, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50">
        <motion.div
          className="h-full bg-primary"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="flex flex-col items-center gap-8 relative z-10">
        <motion.img
          src={logoImage}
          alt="NEUROKLAST"
          className={`w-48 h-48 object-contain drop-shadow-[0_0_50px_rgba(220,38,38,0.6)] ${glitch ? 'glitch-effect' : ''}`}
          animate={{ 
            opacity: [0.7, 1, 0.7],
            scale: [0.98, 1.02, 0.98],
            filter: glitch ? [
              'hue-rotate(0deg) contrast(1)',
              'hue-rotate(90deg) contrast(1.3)',
              'hue-rotate(-90deg) contrast(0.8)',
              'hue-rotate(0deg) contrast(1)'
            ] : 'hue-rotate(0deg) contrast(1)'
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="relative w-80 h-3 bg-secondary/30 rounded-sm overflow-hidden border border-primary/30">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 grid grid-cols-20 gap-px">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="border-r border-background/20" />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-3 items-center">
          <motion.div
            className={`text-primary font-mono text-lg tracking-wider ${glitch ? 'glitch-text-effect' : ''}`}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ACCESSING... {Math.floor(progress)}%
          </motion.div>
          
          <motion.div
            className="text-accent/70 font-mono text-xs max-w-md text-center h-6"
            key={hackingText}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {hackingText}
          </motion.div>

          <div className="flex gap-2 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.div
          className="text-muted-foreground/50 font-mono text-xs tracking-widest"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          [NEURAL INTERFACE v2.0.47]
        </motion.div>
      </div>
    </motion.div>
  )
}
