/**
 * DefaultFooterSlot — default Footer slot fallback.
 *
 * Delegates to the real Footer component, passing through all slot props.
 */

import Footer from '@/components/Footer'
import type { FooterSlotProps } from '@/lib/types'

export default function DefaultFooterSlot(props: FooterSlotProps) {
  return (
    <Footer
      socialLinks={props.socialLinks ?? {}}
      genres={props.genres}
      label={props.label}
      siteName={props.siteName}
      onAdminLogin={props.onAdminLogin}
      onImpressum={props.onImpressum}
      onDatenschutz={props.onDatenschutz}
    />
  )
}

DefaultFooterSlot.displayName = 'DefaultFooter'
