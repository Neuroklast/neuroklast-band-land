import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function NeonBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-grid" />
      <div className="theme-bg-gradient" />
    </div>
  )
}
NeonBackgroundEffects.displayName = 'NeonBackgroundEffects'
