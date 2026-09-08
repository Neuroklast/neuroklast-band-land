import type { OverlayInterior } from '@/lib/overlay-animations'
import { OverlayCircuitHandshake } from './OverlayCircuitHandshake'
import { OverlayIrisLock } from './OverlayIrisLock'
import { OverlayPacketFill } from './OverlayPacketFill'
import { OverlaySectorSweep } from './OverlaySectorSweep'
import { OverlaySystemPost } from './OverlaySystemPost'

export function OverlayBootInterior({ interior }: { interior: OverlayInterior }) {
  switch (interior) {
    case 'handshake':
      return <OverlayCircuitHandshake />
    case 'post':
      return <OverlaySystemPost />
    case 'sectorSweep':
      return <OverlaySectorSweep />
    case 'packetFill':
      return <OverlayPacketFill />
    case 'irisLock':
      return <OverlayIrisLock />
  }
}
