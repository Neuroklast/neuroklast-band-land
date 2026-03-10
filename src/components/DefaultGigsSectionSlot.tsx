/**
 * DefaultGigsSectionSlot — default GigsSection slot fallback.
 *
 * Delegates to the real GigsSection component, passing through all slot props.
 */

import GigsSection from '@/components/GigsSection'
import type { GigsSectionSlotProps } from '@/lib/types'

export default function DefaultGigsSectionSlot(props: GigsSectionSlotProps) {
  return (
    <GigsSection
      gigs={props.gigs}
      onGigClick={props.onGigClick}
      sectionLabels={props.sectionLabels}
      dataLoaded={props.dataLoaded}
      editMode={props.editMode}
      fontSizes={props.fontSizes}
      onUpdate={props.onUpdate}
      onFontSizeChange={props.onFontSizeChange}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultGigsSectionSlot.displayName = 'DefaultGigsSection'
