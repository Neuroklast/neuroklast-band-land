import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function CyberpunkBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-circuit" />
      <div className="theme-bg-noise" />
    </div>
  )
}
CyberpunkBackgroundEffects.displayName = 'CyberpunkBackgroundEffects'
