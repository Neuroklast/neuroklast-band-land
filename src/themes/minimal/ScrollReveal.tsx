import { motion } from 'framer-motion'
import type { ScrollRevealSlotProps } from '@/lib/types'

/**
 * Minimal theme scroll reveal — simple fade-in with no vertical movement.
 */
export default function MinimalScrollReveal({ children, delay = 0, className }: ScrollRevealSlotProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
