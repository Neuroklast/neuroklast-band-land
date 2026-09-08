'use client'

import { motion } from 'framer-motion'
import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'

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
      <div className="flex w-32 items-center gap-2">
        <div className="h-0.5 flex-1 overflow-hidden bg-primary/20">
          <motion.div
            className="h-full origin-left bg-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: durationMs / 1000, ease: 'linear' }}
          />
        </div>
        <span className="font-mono text-[9px] tabular-nums text-primary/50">{pct}%</span>
      </div>
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
