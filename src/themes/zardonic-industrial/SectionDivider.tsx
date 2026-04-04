import React from 'react'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className = '' }: SectionDividerSlotProps) {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center relative ${className}`}>
      {/* Industrial Warning Strip */}
      <div className="w-full max-w-5xl h-4 mb-2 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(var(--primary),0.2)_10px,rgba(var(--primary),0.2)_20px)] border-y border-primary/30" />
      <div className="text-xs font-mono tracking-[0.3em] text-primary/70 bg-background px-4 z-10 -mt-5">
        {"HAZARD ZONE /// KEEP CLEAR"}
      </div>
    </div>
  )
}
