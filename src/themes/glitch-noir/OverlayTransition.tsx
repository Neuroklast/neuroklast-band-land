import React, { useEffect, useState } from 'react'
import type { OverlayTransitionSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function OverlayTransition({ show, onComplete }: OverlayTransitionSlotProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let timer1: NodeJS.Timeout

    if (show) {
      // Defer setActive to avoid state update during render
      timer1 = setTimeout(() => setActive(true), 0)
    }

    return () => clearTimeout(timer1)
  }, [show])

  useEffect(() => {
    let timer1: NodeJS.Timeout
    let timer2: NodeJS.Timeout

    if (active && show) {
      timer1 = setTimeout(() => {
        onComplete?.()
      }, 400) // Call onComplete mid-transition

      timer2 = setTimeout(() => {
        setActive(false)
      }, 800) // End transition
    }

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [active, show, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Noise/Glitch flash */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              x: [0, -10, 10, -5, 0],
              filter: ['invert(0%)', 'invert(100%)', 'invert(0%)']
            }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
