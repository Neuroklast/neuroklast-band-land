/**
 * DefaultContactSectionSlot — default ContactSection slot fallback.
 *
 * Delegates to the real ContactSection component, passing through all slot props.
 */

import ContactSection from '@/components/ContactSection'
import type { ContactSectionSlotProps } from '@/lib/types'

export default function DefaultContactSectionSlot(props: ContactSectionSlotProps) {
  return (
    <ContactSection
      contactSettings={props.contactSettings}
      sectionLabels={props.sectionLabels}
      editMode={props.editMode}
      onUpdate={props.onUpdate}
      onLabelChange={props.onLabelChange}
    />
  )
}

DefaultContactSectionSlot.displayName = 'DefaultContactSection'
