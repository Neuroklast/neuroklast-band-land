import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function NeuroklastClassicBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-overlay" />
    </div>
  )
}
NeuroklastClassicBackgroundEffects.displayName = 'NeuroklastClassicBackgroundEffects'
