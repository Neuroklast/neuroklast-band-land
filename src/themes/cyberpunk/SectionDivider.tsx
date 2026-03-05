import './styles.css'
import type { SectionDividerSlotProps } from '@/lib/types'

export default function CyberpunkSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`cyberpunk-divider-wrapper cyberpunk-divider-glitch w-full my-8 ${className ?? ''}`} aria-hidden="true">
      <div className="cyberpunk-divider-line cyberpunk-neon-line" />
      <div className="cyberpunk-divider-diamond cyberpunk-neon-pulse" />
      <div className="cyberpunk-divider-line cyberpunk-divider-line-reversed cyberpunk-neon-line" />
    </div>
  )
}

CyberpunkSectionDivider.displayName = 'CyberpunkSectionDivider'
