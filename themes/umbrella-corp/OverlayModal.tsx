'use client'

import type { OverlayModalSlotProps } from '@/lib/types'

export default function OverlayModal({ children }: OverlayModalSlotProps) {
  return <div className="umbrella-corp-overlay-modal">{children}</div>
}
