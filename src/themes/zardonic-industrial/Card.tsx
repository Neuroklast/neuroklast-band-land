import React from 'react'
import type { CardSlotProps } from '@/lib/types'

export default function Card({ children, className = '' }: CardSlotProps) {
  return (
    <div className={`p-6 border border-border bg-card/80 backdrop-blur-md relative overflow-hidden group ${className}`}>
      {/* Industrial Screws / Corner Dots */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
      <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-primary/40 rounded-full" />
      <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-primary/40 rounded-full" />

      {/* Cyberpunk Glitch Line on Hover */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100" />

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
