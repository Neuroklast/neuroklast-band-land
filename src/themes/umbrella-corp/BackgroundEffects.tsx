import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function BackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={className} aria-hidden="true">
      <div className="umbrella-corp-grid-bg" />
      <div className="umbrella-corp-hex-overlay" />
      <div className="umbrella-corp-vignette" />
      <div className="umbrella-corp-scanlines" />
    </div>
  )
}
