import type { BackgroundEffectsSlotProps } from '@/lib/types'

export default function BackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={className}>
      <div className="neuroklast-theme-crt-overlay" />
      <div className="neuroklast-theme-crt-vignette" />
      <div className="neuroklast-theme-full-page-noise neuroklast-theme-periodic-noise-glitch" />
      <div className="neuroklast-theme-circuit-bg-wrapper">
        <div className="neuroklast-theme-circuit-line" style={{ top: '20%', left: '10%', width: '100px', height: '2px' }} />
        <div className="neuroklast-theme-circuit-line" style={{ top: '40%', right: '15%', width: '2px', height: '80px' }} />
        <div className="neuroklast-theme-circuit-line" style={{ bottom: '30%', left: '25%', width: '120px', height: '2px' }} />
        <div className="neuroklast-theme-circuit-node" style={{ top: '20%', left: '110px' }} />
        <div className="neuroklast-theme-circuit-node" style={{ top: '40%', right: '15%' }} />
        <div className="neuroklast-theme-circuit-node" style={{ bottom: '30%', left: '145px' }} />
      </div>
    </div>
  )
}
