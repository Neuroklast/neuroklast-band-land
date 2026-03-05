import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function VhsRetroBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <>
      <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
        <div className="theme-bg-scanlines" />
        <div className="theme-bg-roll" />
      </div>
      <div className="theme-bg-rec" aria-hidden="true">
        <div className="theme-bg-rec-dot" />
        <span>REC</span>
      </div>
    </>
  )
}
VhsRetroBackgroundEffects.displayName = 'VhsRetroBackgroundEffects'
