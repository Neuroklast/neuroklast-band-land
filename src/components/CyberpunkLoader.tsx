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
      setProgress((prev) => {
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
          className="w-48 h-48 mx-auto mb-8"
          animate={{
            filter: [
              'drop-shadow(0 0 20px oklch(0.55 0.22 25 / 0.6))',
              'drop-shadow(0 0 40px oklch(0.65 0.25 25 / 0.8))',
              'drop-shadow(0 0 20px oklch(0.55 0.22 25 / 0.6))'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        <div className="relative w-64 h-2 mx-auto bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${progress}%` }}
            animate={{
              boxShadow: [
                '0 0 10px oklch(0.55 0.22 25 / 0.5)',
                '0 0 20px oklch(0.65 0.25 25 / 0.8)',
                '0 0 10px oklch(0.55 0.22 25 / 0.5)'
              ]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </div>

        <motion.div
          className="mt-6 text-muted-foreground font-mono text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          LOADING... {progress}%
        </motion.div>
      </div>
    </motion.div>
  )
}
