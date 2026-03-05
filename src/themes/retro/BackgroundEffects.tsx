import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function RetroBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-scanlines" />
      <div className="theme-crt-curve" />
      <div className="theme-phosphor-glow" />
    </div>
  )
}
RetroBackgroundEffects.displayName = 'RetroBackgroundEffects'
