import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function ArtDecoCyberpunkBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-pattern" />
      <div className="theme-bg-neon-glow" />
      <div className="theme-bg-vignette" />
    </div>
  )
}
ArtDecoCyberpunkBackgroundEffects.displayName = 'ArtDecoCyberpunkBackgroundEffects'
