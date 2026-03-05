import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function ElegantBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return <div className={`theme-bg ${className ?? ''}`} aria-hidden="true" />
}
ElegantBackgroundEffects.displayName = 'ElegantBackgroundEffects'
