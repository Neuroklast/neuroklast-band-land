import React from 'react'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function BackgroundEffects({ className = '' }: BackgroundEffectsSlotProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-background ${className}`}>
      {/* Synthwave Horizon Grid */}
      <div className="synth-grid-bg" />

      {/* Scanlines Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 6px 100%',
          zIndex: 999
        }}
      />
    </div>
  )
}
