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
      }, 300)

      const timer2 = setTimeout(() => {
        setActive(false)
      }, 600)

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
        >
          {/* Cyberpunk Slide Wipe */}
          <motion.div
            className="absolute inset-0 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], transformOrigin: ["left", "left", "right", "right"] }}
            transition={{ duration: 0.6, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
