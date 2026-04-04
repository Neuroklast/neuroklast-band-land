import React from 'react'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className = '' }: SectionDividerSlotProps) {
  return (
    <div className={`w-full py-12 flex items-center justify-center ${className}`}>
      <div className="w-1/3 h-px bg-gradient-to-r from-transparent to-border" />
      <div className="mx-4 text-primary font-mono text-sm tracking-widest opacity-50">[ /// ]</div>
      <div className="w-1/3 h-px bg-gradient-to-l from-transparent to-border" />
    </div>
  )
}
