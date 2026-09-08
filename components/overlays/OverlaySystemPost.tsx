'use client'

import { motion } from 'framer-motion'
import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'

const CHECKS = [
  { id: 'MEM', addr: '0x0100' },
  { id: 'IRQ', addr: '0x0200' },
  { id: 'VID', addr: '0x0300' },
  { id: 'I/O', addr: '0x0400' },
  { id: 'FS', addr: '0x0500' },
] as const

export function OverlaySystemPost({
  durationMs = OVERLAY_REVEAL_PHASE_DELAY_MS,
}: {
  durationMs?: number
}) {
  const pct = useOverlayBootProgress(durationMs)
  const activeIndex = Math.min(CHECKS.length - 1, Math.floor(pct / 20))

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-5 px-8 py-16">
      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">SYSTEM POST</p>
      <ul className="w-48 space-y-1.5 font-mono text-[9px] uppercase tracking-widest text-primary/70">
        {CHECKS.map((check, index) => {
          const done = pct >= (index + 1) * 20
          const active = !done && index === activeIndex
          return (
            <li key={check.id} className="flex items-center gap-3">
              <span className="w-10 text-primary/40">{check.addr}</span>
              <span className="w-8">{check.id}</span>
              <span className="ml-auto tabular-nums text-primary/50">
                {done ? '[OK]' : active ? '_' : ''}
              </span>
            </li>
          )
        })}
      </ul>
      <div className="flex w-48 items-center gap-2">
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
    </div>
  )
}
