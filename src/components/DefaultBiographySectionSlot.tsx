/**
 * DefaultBiographySectionSlot — default BiographySection slot fallback.
 *
 * Delegates to the real BiographySection component, passing through all slot props.
 */

import BiographySection from '@/components/BiographySection'
import type { BiographySectionSlotProps } from '@/lib/types'

export default function DefaultBiographySectionSlot(props: BiographySectionSlotProps) {
  return (
    <BiographySection
      biography={props.biography}
      onMemberClick={props.onMemberClick}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      fontSizes={props.fontSizes}
      siteName={props.siteName}
      onUpdate={props.onUpdate}
      onFontSizeChange={props.onFontSizeChange}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultBiographySectionSlot.displayName = 'DefaultBiographySection'
