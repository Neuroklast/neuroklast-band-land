import './styles.css'
import type { CardSlotProps } from '@/lib/types'

export default function CyberpunkCard({ children, className }: CardSlotProps) {
  return (
    <div className={`cyberpunk-card cyberpunk-hologram-flicker relative p-[1px] ${className ?? ''}`}>
      {/* Animated gradient border */}
      <div className="cyberpunk-gradient-border absolute inset-0 rounded-sm" aria-hidden="true" />
      {/* Glass panel */}
      <div className="relative bg-card/60 backdrop-blur-xl border border-white/5 rounded-sm m-[1px] p-4 overflow-hidden">
        {/* Corner accent gradients */}
        <div className="cyberpunk-corner-tl" aria-hidden="true" />
        <div className="cyberpunk-corner-tl-v" aria-hidden="true" />
        <div className="cyberpunk-corner-br" aria-hidden="true" />
        <div className="cyberpunk-corner-br-v" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}

CyberpunkCard.displayName = 'CyberpunkCard'
