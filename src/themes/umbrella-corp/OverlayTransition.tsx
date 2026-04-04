import React, { useEffect, useState } from 'react'
import type { OverlayTransitionSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function OverlayTransition({ show, onComplete }: OverlayTransitionSlotProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (show) {
      setActive(true)
      const timer1 = setTimeout(() => {
        onComplete?.()
      }, 500)

      const timer2 = setTimeout(() => {
        setActive(false)
      }, 1000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Hexagon Wipe Effect */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-1 opacity-80 mix-blend-screen">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-primary/50"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: (i % 10) * 0.05 + Math.floor(i / 10) * 0.02
                }}
              />
            ))}
          </div>
          <motion.div
            className="absolute inset-0 bg-background/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
