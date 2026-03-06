import './styles.css'
import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function ZardonicBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <>
      <div className={`zardonic-crt-overlay ${className ?? ''}`} aria-hidden="true" />
      <div className="zardonic-crt-vignette" aria-hidden="true" />
      <div className="zardonic-crt-scan-line" aria-hidden="true" />
      <div className="zardonic-full-page-noise" aria-hidden="true" />
    </>
  )
}

ZardonicBackgroundEffects.displayName = 'ZardonicBackgroundEffects'
