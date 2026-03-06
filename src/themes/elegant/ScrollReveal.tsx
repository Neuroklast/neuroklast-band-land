import { motion } from 'framer-motion'
import type { ScrollRevealSlotProps } from '@/lib/types'

/**
 * Elegant theme scroll reveal — soft opacity fade, no vertical slide.
 */
export default function ElegantScrollReveal({ children, delay = 0, className }: ScrollRevealSlotProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
