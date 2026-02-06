import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logoImage from '@/assets/images/neuroklast-logo.png'

interface CyberpunkLoaderProps {
  onLoadComplete: () => void
}

export default function CyberpunkLoader({ onLoadComplete }: CyberpunkLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onLoadComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(interval)
  }, [onLoadComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <motion.img
          src={logoImage}
          alt="NEUROKLAST"
          className="w-[80vw] max-w-4xl mx-auto mb-12"
          animate={{
            filter: [
              'drop-shadow(0 0 20px oklch(0.55 0.22 25 / 0.6))',
              'drop-shadow(0 0 40px oklch(0.55 0.22 25 / 0.8))',
              'drop-shadow(0 0 20px oklch(0.55 0.22 25 / 0.6))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="w-80 mx-auto">
          <div className="h-1 bg-card border border-border overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${progress}%` }}
              animate={{
                boxShadow: '0 0 20px oklch(0.55 0.22 25 / 0.7)'
              }}
            />
          </div>
          
          <div className="mt-4 text-sm font-mono text-muted-foreground tracking-wider">
            LOADING SYSTEM {progress}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}
