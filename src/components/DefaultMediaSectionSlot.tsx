/**
 * DefaultMediaSectionSlot — default MediaSection slot fallback.
 *
 * Delegates to the real MediaSection component, passing through all slot props.
 */

import MediaSection from '@/components/MediaSection'
import type { MediaSectionSlotProps } from '@/lib/types'

export default function DefaultMediaSectionSlot(props: MediaSectionSlotProps) {
  return (
    <MediaSection
      mediaFiles={props.mediaFiles}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      onUpdate={props.onUpdate}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultMediaSectionSlot.displayName = 'DefaultMediaSection'
