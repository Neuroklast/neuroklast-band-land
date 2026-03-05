import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function SteampunkBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-pattern" />
      <div className="theme-bg-vignette" />
      <div className="theme-bg-steam" />
    </div>
  )
}
SteampunkBackgroundEffects.displayName = 'SteampunkBackgroundEffects'
