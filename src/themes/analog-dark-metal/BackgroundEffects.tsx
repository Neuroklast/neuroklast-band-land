import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function AnalogDarkMetalBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-grain" />
      <div className="theme-bg-fog" />
      <div className="theme-bg-vignette" />
    </div>
  )
}
AnalogDarkMetalBackgroundEffects.displayName = 'AnalogDarkMetalBackgroundEffects'
