'use client'

import { motion } from 'framer-motion'
import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'

const FLASH_AT = [20, 50, 80] as const

export function OverlaySectorSweep({
  durationMs = OVERLAY_REVEAL_PHASE_DELAY_MS,
}: {
  durationMs?: number
}) {
  const pct = useOverlayBootProgress(durationMs)
  const sector = Math.round((pct / 100) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-4 px-8 py-16">
      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">SECTOR SWEEP</p>
      <div
        className="relative h-24 w-40 overflow-hidden border border-primary/30 text-primary/25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, transparent 0 7px, currentColor 7px 8px), repeating-linear-gradient(to bottom, transparent 0 7px, currentColor 7px 8px)',
        }}
      >
        <motion.div
          className="absolute inset-y-0 w-0.5 bg-primary"
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{ duration: durationMs / 1000, ease: 'linear' }}
        />
        {FLASH_AT.map((at, index) => (
          <div
            key={at}
            className="absolute h-1.5 w-2 border border-primary/50"
            style={{
              top: 8 + index * 22,
              left: 12 + index * 36,
              opacity: pct >= at ? 0.9 : 0.15,
            }}
          />
        ))}
      </div>
      <div className="flex w-40 items-center justify-between font-mono text-[9px] uppercase tracking-widest text-primary/50">
        <span>SEC {sector}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}
