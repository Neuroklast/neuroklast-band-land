/**
 * DefaultPartnersSectionSlot — default PartnersSection slot fallback.
 *
 * Delegates to the real PartnersAndFriendsSection component, passing through all slot props.
 */

import PartnersAndFriendsSection from '@/components/PartnersAndFriendsSection'
import type { PartnersSectionSlotProps } from '@/lib/types'

export default function DefaultPartnersSectionSlot(props: PartnersSectionSlotProps) {
  return (
    <PartnersAndFriendsSection
      friends={props.friends}
      onFriendClick={props.onFriendClick}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      onUpdate={props.onUpdate}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultPartnersSectionSlot.displayName = 'DefaultPartnersSection'
