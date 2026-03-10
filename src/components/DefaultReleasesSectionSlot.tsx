/**
 * DefaultReleasesSectionSlot — default ReleasesSection slot fallback.
 *
 * Delegates to the real ReleasesSection component, passing through all slot props.
 */

import ReleasesSection from '@/components/ReleasesSection'
import type { ReleasesSectionSlotProps } from '@/lib/types'

export default function DefaultReleasesSectionSlot(props: ReleasesSectionSlotProps) {
  return (
    <ReleasesSection
      releases={props.releases}
      onReleaseClick={props.onReleaseClick}
      sectionLabels={props.sectionLabels}
      dataLoaded={props.dataLoaded}
      editMode={props.editMode}
      fontSizes={props.fontSizes}
      siteName={props.siteName}
      onUpdate={props.onUpdate}
      onFontSizeChange={props.onFontSizeChange}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultReleasesSectionSlot.displayName = 'DefaultReleasesSection'
