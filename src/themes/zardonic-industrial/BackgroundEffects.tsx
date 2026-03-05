import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'
export default function ZardonicBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`theme-bg ${className ?? ''}`} aria-hidden="true">
      <div className="theme-bg-noise" />
      <div className="theme-bg-scanlines" />
      <div className="theme-bg-vignette" />
    </div>
  )
}
ZardonicBackgroundEffects.displayName = 'ZardonicBackgroundEffects'
