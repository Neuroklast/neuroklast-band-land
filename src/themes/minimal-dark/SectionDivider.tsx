import { motion } from 'framer-motion'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className = '' }: SectionDividerSlotProps) {
  return (
    <div className={`w-full max-w-6xl mx-auto px-6 py-12 flex items-center justify-center relative overflow-hidden ${className}`}>
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full h-px bg-border relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-background px-4">
          <span className="text-accent text-xs">◆</span>
          <span className="text-muted-foreground text-xs">◆</span>
          <span className="text-accent text-xs">◆</span>
        </div>
      </motion.div>
    </div>
  )
}
