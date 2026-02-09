import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

/** Number of scan lines to render */
const LINE_COUNT = 12

/** Three different animation patterns for overlay transitions */
const patterns = [
  // Pattern 0: Horizontal scan lines that converge to center
  {
    lineStyle: (i: number, total: number) => ({
      position: 'absolute' as const,
      left: 0,
      right: 0,
      height: '1px',
      top: `${(i / total) * 100}%`,
      background: 'oklch(0.50 0.22 25)',
      boxShadow: '0 0 6px oklch(0.50 0.22 25 / 0.6)',
    }),
    animate: (i: number, total: number) => ({
      scaleX: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
      top: [`${(i / total) * 100}%`, `${(i / total) * 100}%`, '50%', '50%'],
    }),
    transition: (i: number) => ({
      duration: 0.4,
      delay: i * 0.015,
      ease: 'easeInOut' as const,
    }),
  },
  // Pattern 1: Vertical bars that expand outward
  {
    lineStyle: (i: number, total: number) => ({
      position: 'absolute' as const,
      top: 0,
      bottom: 0,
      width: '1px',
      left: `${(i / total) * 100}%`,
      background: 'oklch(0.50 0.22 25)',
      boxShadow: '0 0 4px oklch(0.50 0.22 25 / 0.5)',
    }),
    animate: (_i: number) => ({
      scaleY: [0, 1, 1, 0],
      opacity: [0, 0.8, 0.8, 0],
    }),
    transition: (i: number) => ({
      duration: 0.35,
      delay: i * 0.02,
      ease: 'easeOut' as const,
    }),
  },
  // Pattern 2: Corner brackets that assemble into a frame
  {
    lineStyle: (i: number, total: number) => {
      const side = i % 4
      const segment = Math.floor(i / 4)
      const segTotal = Math.ceil(total / 4)
      const pct = segment / segTotal
      const styles: Record<string, string | number> = {
        position: 'absolute',
        background: 'oklch(0.50 0.22 25)',
        boxShadow: '0 0 6px oklch(0.50 0.22 25 / 0.5)',
      }
      if (side === 0) { // top
        Object.assign(styles, { top: 0, left: `${pct * 100}%`, width: `${100 / segTotal}%`, height: '1px' })
      } else if (side === 1) { // right
        Object.assign(styles, { right: 0, top: `${pct * 100}%`, width: '1px', height: `${100 / segTotal}%` })
      } else if (side === 2) { // bottom
        Object.assign(styles, { bottom: 0, right: `${pct * 100}%`, width: `${100 / segTotal}%`, height: '1px' })
      } else { // left
        Object.assign(styles, { left: 0, bottom: `${pct * 100}%`, width: '1px', height: `${100 / segTotal}%` })
      }
      return styles as React.CSSProperties
    },
    animate: () => ({
      scaleX: [0, 1],
      scaleY: [0, 1],
      opacity: [0, 1, 1, 0],
    }),
    transition: (i: number) => ({
      duration: 0.4,
      delay: i * 0.02,
      ease: 'easeOut' as const,
    }),
  },
]

interface OverlayTransitionProps {
  /** Whether the overlay is visible */
  show: boolean
  /** Callback when the entry animation is complete */
  onComplete?: () => void
}

/** Total duration of the transition effect in milliseconds */
const TRANSITION_DURATION_MS = 500

/**
 * Lightweight cyberpunk scan-line transition played when an overlay opens.
 * Randomly selects one of three visual patterns on each mount.
 */
export default function OverlayTransition({ show, onComplete }: OverlayTransitionProps) {
  const [patternIdx] = useState(() => Math.floor(Math.random() * patterns.length))
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timeout = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, TRANSITION_DURATION_MS)
      return () => clearTimeout(timeout)
    }
  }, [show, onComplete])

  const pattern = patterns[patternIdx]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[99999] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {Array.from({ length: LINE_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              style={pattern.lineStyle(i, LINE_COUNT)}
              animate={pattern.animate(i, LINE_COUNT)}
              transition={pattern.transition(i)}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Hook that provides a trigger function and the transition element */
export function useOverlayTransition() {
  const [active, setActive] = useState(false)

  const trigger = useCallback(() => {
    setActive(true)
  }, [])

  const handleComplete = useCallback(() => {
    setActive(false)
  }, [])

  const element = <OverlayTransition show={active} onComplete={handleComplete} />

  return { trigger, element }
}
