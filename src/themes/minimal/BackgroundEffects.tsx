import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function MinimalBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return <div className={`theme-bg fixed inset-0 -z-10 ${className ?? ''}`} />
}
MinimalBackgroundEffects.displayName = 'MinimalBackgroundEffects'
