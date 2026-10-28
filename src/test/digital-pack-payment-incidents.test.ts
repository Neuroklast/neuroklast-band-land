import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  assertDigitalPackIncidentMatchesOrder,
  digitalPackRevocationStatus,
  type VerifiedDigitalPackIncident,
} from '../../lib/digital-packs/payment-incidents'
import { INCIDENT_EVENTS } from '../../lib/neurokore/payment-events'

const verified: VerifiedDigitalPackIncident = {
  orderId: '4f7728c5-cb9a-4523-bafb-3267f83585cd',
  sessionId: 'cs_test_123',
  paymentIntent: 'pi_123',
  state: 'refunded',
}

const order = {
  id: verified.orderId,
  stripe_session: verified.sessionId,
  payment_intent: verified.paymentIntent,
  status: 'paid',
}

describe('digital pack payment incident routing', () => {
  it('revokes access on full refunds and every disputed state, not partial refunds', () => {
    expect(digitalPackRevocationStatus('refunded')).toBe('refunded')
    expect(digitalPackRevocationStatus('disputed')).toBe('disputed')
    expect(digitalPackRevocationStatus('dispute_closed')).toBe('disputed')
    for (const state of ['partially_refunded', 'expired', 'failed'] as const) {
      expect(digitalPackRevocationStatus(state)).toBeNull()
    }
  })

  it('binds every incident to the verified Stripe checkout and the exact order', () => {
    expect(() => assertDigitalPackIncidentMatchesOrder(verified, order)).not.toThrow()
    for (const alternate of [
      { ...order, id: 'someone-else' },
      { ...order, stripe_session: 'cs_test_other' },
      { ...order, stripe_session: null },
      { ...order, payment_intent: 'pi_other' },
      { ...order, payment_intent: null },
    ]) {
      expect(() => assertDigitalPackIncidentMatchesOrder(verified, alternate)).toThrow()
    }
  })

  it('allows pre-fulfilment refunds to block delayed success events', () => {
    expect(() => assertDigitalPackIncidentMatchesOrder(verified, {
      ...order, status: 'pending', payment_intent: null,
    })).not.toThrow()
  })

  it('includes refund.updated and dispute updates after Stripe API verification', () => {
    for (const event of ['refund.updated', 'charge.refunded',
      'charge.dispute.created', 'charge.dispute.updated', 'charge.dispute.closed']) {
      expect(INCIDENT_EVENTS.has(event)).toBe(true)
    }
    const webhook = readFileSync('app/api/neurokore/webhook/route.ts', 'utf8')
    const handler = readFileSync('lib/digital-packs/fulfillment.ts', 'utf8')
    expect(webhook).toContain('recordDigitalPackPaymentIncident(resolved, event.livemode)')
    expect(webhook).toContain('if (resolved && resolved !== true)')
    expect(handler).toContain("['pending', 'paid', 'disputed']")
    expect(handler).toContain('assertDigitalPackIncidentMatchesOrder(incident, order)')
    expect(handler).not.toContain('event.data.object.payment_intent')
  })
})
