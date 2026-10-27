/** Stripe snapshot events are not guaranteed to arrive in order.
 * Only map the latest Stripe API object, never a possibly stale event payload.
 */
export type PaymentIncident = 'refunded' | 'partially_refunded' | 'disputed' | 'dispute_closed' | 'failed' | 'expired'

export function refundIncident(charge: { amount: number; amount_refunded: number }): PaymentIncident | null {
  if (!Number.isSafeInteger(charge.amount) || charge.amount <= 0 ||
      !Number.isSafeInteger(charge.amount_refunded) || charge.amount_refunded < 0 ||
      charge.amount_refunded > charge.amount) {
    throw new Error('Invalid Stripe charge amount')
  }
  if (charge.amount_refunded === 0) return null
  return charge.amount_refunded === charge.amount ? 'refunded' : 'partially_refunded'
}

/** Even a won/closed dispute needs manual licence reinstatement, not automatic unrevocation. */
export function disputeIncident(status: string): PaymentIncident {
  return ['won', 'lost', 'warning_closed', 'expired'].includes(status)
    ? 'dispute_closed'
    : 'disputed'
}

export const INCIDENT_EVENTS = new Set([
  'charge.refunded',
  'refund.updated',
  'charge.dispute.created',
  'charge.dispute.updated',
  'charge.dispute.closed',
  'checkout.session.async_payment_failed',
  'checkout.session.expired',
])

export const SUCCESS_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])
