import DefaultOverlayModalSlot from '@/components/DefaultOverlayModalSlot'
import type { OverlayModalSlotProps } from '@/lib/types'

export default function OverlayModal(props: OverlayModalSlotProps) {
  return (
    <div className="zardonic-overlay-modal">
      <DefaultOverlayModalSlot {...props} />
    </div>
  )
}
