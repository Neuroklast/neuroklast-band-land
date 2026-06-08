import React from 'react'
import type { SectionDividerSlotProps } from '@/lib/types'
import { motion } from 'framer-motion'

export default function SectionDivider({ className = '' }: SectionDividerSlotProps) {
  return (
    <div className={`w-full py-16 flex justify-center items-center overflow-hidden ${className}`}>
      <motion.div
        className="h-[2px] w-full max-w-4xl relative"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          boxShadow: '0 0 15px var(--primary)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" style={{ boxShadow: '0 0 20px var(--primary)' }} />
      </motion.div>
    </div>
  )
}
