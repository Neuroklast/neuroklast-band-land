import React from 'react'
import type { CardSlotProps } from '@/lib/types'

export default function Card({ children, className = '' }: CardSlotProps) {
  return (
    <div className={`p-6 border border-border bg-card shadow-lg hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-shadow duration-300 relative overflow-hidden group ${className}`}>
      {/* Accent Top Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-primary opacity-50" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-primary opacity-50" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-primary opacity-50" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-primary opacity-50" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
