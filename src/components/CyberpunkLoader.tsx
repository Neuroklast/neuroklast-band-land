import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import logoImage from '@/assets/images/NK_BAPHOMET.png'

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
      <div className="flex flex-col items-center gap-8">
        <motion.img
          src={logoImage}
          alt="NEUROKLAST"
          className="w-32 h-32 object-contain"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1.95, 2.05, 1.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        <motion.div
          className="text-primary font-mono text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ACESSING... {progress}%
        </motion.div>
      </div>
    </motion.div>
  )
}
