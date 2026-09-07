'use client'

import type { OverlayModalSlotProps } from '@/lib/types'

export default function OverlayModal({ children }: OverlayModalSlotProps) {
  return <div className="neuroklast-classic-overlay-modal">{children}</div>
}
