import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function BackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className || ''}`}>
      <div className="signal-static-bg-noise"></div>
      
      <div className="signal-static-bg-scanlines"></div>
      
      <div className="signal-static-vignette"></div>
      
      <div className="signal-static-grid"></div>
      
      <div className="signal-static-signal-interference"></div>
      
      <div className="signal-static-chromatic-aberration"></div>
    </div>
  )
}
