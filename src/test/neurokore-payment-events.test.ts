import { describe, expect, it } from 'vitest'
import { INCIDENT_EVENTS, SUCCESS_EVENTS, refundIncident, disputeIncident } from '../../lib/neurokore/payment-events'

describe('Stripe payment incident reconciliation', () => {
  it('classifies partial and full refunds using the latest charge totals', () => {
    expect(refundIncident({ amount: 5900, amount_refunded: 0 })).toBeNull()
    expect(refundIncident({ amount: 5900, amount_refunded: 1000 })).toBe('partially_refunded')
    expect(refundIncident({ amount: 5900, amount_refunded: 5900 })).toBe('refunded')
  })
  it('rejects invalid, contradictory, fractional or negative Stripe amounts', () => {
    for (const [amount, amount_refunded] of [[0, 0], [5900, -1], [5900, 5901], [5900.5, 10]]) {
      expect(() => refundIncident({ amount, amount_refunded })).toThrow()
    }
  })
  it('holds open disputes and retains review requirement after closing', () => {
    expect(disputeIncident('needs_response')).toBe('disputed')
    expect(disputeIncident('warning_needs_response')).toBe('disputed')
    expect(disputeIncident('lost')).toBe('dispute_closed')
    expect(disputeIncident('won')).toBe('dispute_closed')
  })
  it('receives only the payment events the webhook handles', () => {
    expect(SUCCESS_EVENTS.has('checkout.session.completed')).toBe(true)
    expect(SUCCESS_EVENTS.has('checkout.session.async_payment_succeeded')).toBe(true)
    for (const name of ['charge.refunded', 'refund.updated','charge.dispute.created',
      'charge.dispute.updated','charge.dispute.closed','checkout.session.async_payment_failed',
      'checkout.session.expired']) {
      expect(INCIDENT_EVENTS.has(name)).toBe(true)
    }
    expect(INCIDENT_EVENTS.has('customer.updated')).toBe(false)
    expect(INCIDENT_EVENTS.has('payment_intent.payment_failed')).toBe(false)
  })
})
