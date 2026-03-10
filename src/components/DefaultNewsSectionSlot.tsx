/**
 * DefaultNewsSectionSlot — default NewsSection slot fallback.
 *
 * Delegates to the real NewsSection component, passing through all slot props.
 */

import NewsSection from '@/components/NewsSection'
import type { NewsSectionSlotProps } from '@/lib/types'

export default function DefaultNewsSectionSlot(props: NewsSectionSlotProps) {
  return (
    <NewsSection
      news={props.news}
      onNewsClick={props.onNewsClick}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      onUpdate={props.onUpdate}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultNewsSectionSlot.displayName = 'DefaultNewsSection'
