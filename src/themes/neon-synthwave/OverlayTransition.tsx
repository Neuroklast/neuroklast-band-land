import React, { useEffect, useState } from 'react'
import type { OverlayTransitionSlotProps } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'

export default function OverlayTransition({ show, onComplete }: OverlayTransitionSlotProps) {
  const [active, setActive] = useState(false)

  // When show becomes true, animate in, then trigger onComplete midway, then animate out
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (show) {
      timer = setTimeout(() => setActive(true), 0)
    }
    return () => clearTimeout(timer)
  }, [show])

  useEffect(() => {
    if (active && show) {
      const timer1 = setTimeout(() => {
        onComplete?.()
      }, 600) // Call onComplete when fully opaque

      const timer2 = setTimeout(() => {
        setActive(false)
      }, 1200) // Remove overlay after rendering new content

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [active, show, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Top shutter */}
          <motion.div
            className="w-full bg-primary"
            initial={{ height: "0vh" }}
            animate={{ height: "50vh" }}
            exit={{ height: "0vh" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ borderBottom: '4px solid white', boxShadow: '0 0 20px var(--primary)' }}
          />
          {/* Bottom shutter */}
          <motion.div
            className="w-full bg-primary mt-auto"
            initial={{ height: "0vh" }}
            animate={{ height: "50vh" }}
            exit={{ height: "0vh" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ borderTop: '4px solid white', boxShadow: '0 0 20px var(--primary)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
