import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function AnalogDarkMetalBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-brushed-metal" />
      <div className="theme-bg-grain" />
      <div className="theme-bg-spotlight" />
      <div className="theme-bg-oscilloscope" />
      <div className="theme-bg-vignette" />
    </div>
  )
}
AnalogDarkMetalBackgroundEffects.displayName = 'AnalogDarkMetalBackgroundEffects'
