'use client'

import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'
import { HudReadout } from '@/components/motion/HudReadout'
import { ProgressMeter } from '@/components/motion/ProgressMeter'

export function OverlayCircuitHandshake({
  durationMs = OVERLAY_REVEAL_PHASE_DELAY_MS,
}: {
  durationMs?: number
}) {
  const pct = useOverlayBootProgress(durationMs)

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-4 px-8 py-16">
      <div className="overlay-loader-circuit" aria-hidden />
      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">CIRCUIT LINK</p>
      <HudReadout
        items={[
          { label: 'SYNC', value: pct >= 100 ? 'OK' : 'PEND', hot: pct >= 100 },
          { label: 'CHAN', value: 'NK.0' },
        ]}
      />
      <ProgressMeter progress={pct / 100} className="w-32" />
      <div className="overlay-loader-boot" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}
