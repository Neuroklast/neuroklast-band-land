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
      }, 400)

      const timer2 = setTimeout(() => {
        setActive(false)
      }, 800)

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
          className="fixed inset-0 z-[100] flex flex-col pointer-events-none"
        >
          {/* Metal jaws closing */}
          <motion.div
            className="w-full bg-card flex-1 border-b-[8px] border-primary"
            initial={{ y: "-100%" }}
            animate={{ y: ["-100%", "0%", "0%", "-100%"] }}
            transition={{ duration: 0.8, times: [0, 0.4, 0.6, 1], ease: "anticipate" }}
          />
          <motion.div
            className="w-full bg-card flex-1 border-t-[8px] border-primary"
            initial={{ y: "100%" }}
            animate={{ y: ["100%", "0%", "0%", "100%"] }}
            transition={{ duration: 0.8, times: [0, 0.4, 0.6, 1], ease: "anticipate" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
