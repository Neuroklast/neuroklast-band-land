/**
 * DefaultSocialSectionSlot — default SocialSection slot fallback.
 *
 * Delegates to the real SocialSection component, passing through all slot props.
 */

import SocialSection from '@/components/SocialSection'
import type { SocialSectionSlotProps } from '@/lib/types'

export default function DefaultSocialSectionSlot(props: SocialSectionSlotProps) {
  return (
    <SocialSection
      socialLinks={props.socialLinks}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      fontSizes={props.fontSizes}
      onUpdate={props.onUpdate}
      onFontSizeChange={props.onFontSizeChange}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultSocialSectionSlot.displayName = 'DefaultSocialSection'
