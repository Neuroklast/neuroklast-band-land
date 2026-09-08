'use client'

import { motion } from 'framer-motion'
import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'

export function OverlayIrisLock({
  durationMs = OVERLAY_REVEAL_PHASE_DELAY_MS,
}: {
  durationMs?: number
}) {
  const pct = useOverlayBootProgress(durationMs)
  const activeTick = Math.min(11, Math.floor((pct / 100) * 12))
  const fStop = (2.8 - 1.4 * (pct / 100)).toFixed(1)

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-4 px-8 py-16">
      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">IRIS LOCK</p>
      <div className="relative size-16">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={`tick-${index}`}
            className="absolute left-1/2 top-1/2 h-1.5 w-px bg-primary"
            style={{
              opacity: index === activeTick ? 0.9 : 0.25,
              transform: `translate(-50%, -50%) rotate(${index * 30}deg) translateY(-26px)`,
            }}
          />
        ))}
        {Array.from({ length: 6 }, (_, index) => (
          <motion.span
            key={`blade-${index}`}
            className="absolute left-1/2 top-1/2 h-0.5 w-7 origin-left bg-primary"
            initial={{ scaleX: 0, rotate: index * 60, x: 0, y: '-50%' }}
            animate={{ scaleX: 1, rotate: index * 60, x: 0, y: '-50%' }}
            transition={{ delay: index * 0.07, duration: 0.22, ease: 'easeOut' }}
          />
        ))}
      </div>
      <div className="flex w-28 items-center justify-between font-mono text-[9px] uppercase tracking-widest text-primary/50">
        <span>F {fStop}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}
