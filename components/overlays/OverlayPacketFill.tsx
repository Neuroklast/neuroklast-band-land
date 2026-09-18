'use client'

import { motion } from 'framer-motion'
import { OVERLAY_REVEAL_PHASE_DELAY_MS } from '@/lib/config'
import { useOverlayBootProgress } from '@/hooks/use-overlay-boot-progress'
import { HudReadout } from '@/components/motion/HudReadout'
import { ProgressMeter } from '@/components/motion/ProgressMeter'

const BAR_HEIGHTS = [40, 70, 55, 100, 45, 80, 60, 35]
const TARGET = 4096

export function OverlayPacketFill({
  durationMs = OVERLAY_REVEAL_PHASE_DELAY_MS,
}: {
  durationMs?: number
}) {
  const pct = useOverlayBootProgress(durationMs)
  const rx = Math.round((pct / 100) * TARGET)
  const tx = Math.round((Math.max(0, pct - 8) / 92) * TARGET)

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-4 px-8 py-16">
      <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">PACKET FILL</p>
      <div className="flex h-12 items-end gap-1">
        {BAR_HEIGHTS.map((height, index) => (
          <motion.span
            key={index}
            className="w-1 origin-bottom bg-primary"
            style={{ height: `${height}%` }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
          />
        ))}
      </div>
      <HudReadout
        items={[
          { label: 'RX', value: String(rx).padStart(4, '0') },
          { label: 'TX', value: String(tx).padStart(4, '0') },
        ]}
      />
      <ProgressMeter progress={pct / 100} className="w-32" />
    </div>
  )
}
