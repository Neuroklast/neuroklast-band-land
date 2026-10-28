import type { PaymentIncident } from '@/lib/neurokore/payment-events'

/**
 * Stripe API-resolved payment incident. Never construct this from the event's
 * untrusted object metadata or a browser request.
 */
export interface VerifiedDigitalPackIncident {
  orderId: string
  sessionId: string
  paymentIntent: string | null
  state: PaymentIncident
}

/** A partial refund leaves access intact. Closed disputes remain on hold
 * until a human resolves their entitlement; they are never reopened on a
 * stale or out-of-order Stripe event.
 */
export function digitalPackRevocationStatus(
  state: PaymentIncident,
): 'refunded' | 'disputed' | null {
  if (state === 'refunded') return 'refunded'
  if (state === 'disputed' || state === 'dispute_closed') return 'disputed'
  return null
}

export function assertDigitalPackIncidentMatchesOrder(
  incident: VerifiedDigitalPackIncident,
  order: {
    id: string
    stripe_session: string | null
    payment_intent: string | null
    status: string
  },
): void {
  if (order.id !== incident.orderId ||
      !order.stripe_session ||
      order.stripe_session !== incident.sessionId ||
      (order.payment_intent !== null && order.payment_intent !== incident.paymentIntent) ||
      (order.status === 'paid' && (order.payment_intent === null || incident.paymentIntent === null))) {
    throw new Error('Verified Stripe incident does not match digital pack order')
  }
}
