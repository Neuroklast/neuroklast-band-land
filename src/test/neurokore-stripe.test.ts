
import { describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import { assertStripeKeyEnvironment, verifyWebhook } from '../../lib/neurokore/stripe'
describe('Stripe webhook trust boundary', () => {
  const raw = '{"type":"checkout.session.completed"}'
  const timestamp = 1900000000
  const secret = 'test-only-secret'
  const sig = createHmac('sha256', secret).update(timestamp + '.' + raw).digest('hex')
  const header = 't=' + timestamp + ',v1=' + sig
  it('accepts authentic raw bytes and rotated signatures', () => {
    expect(() => verifyWebhook(raw, header, secret, timestamp * 1000)).not.toThrow()
    expect(() => verifyWebhook(raw, header + ',v1=' + '0'.repeat(64), secret, timestamp * 1000)).not.toThrow()
  })
  it('rejects tampering, forged signatures, stale and future deliveries', () => {
    expect(() => verifyWebhook(raw + ' ', header, secret, timestamp * 1000)).toThrow()
    expect(() => verifyWebhook(raw, header, 'wrong', timestamp * 1000)).toThrow()
    expect(() => verifyWebhook(raw, header, secret, (timestamp + 301) * 1000)).toThrow()
    expect(() => verifyWebhook(raw, header, secret, (timestamp - 301) * 1000)).toThrow()
    expect(() => verifyWebhook(raw, 't=x,v1=00', secret, timestamp * 1000)).toThrow()
  })
})

describe('Stripe live/sandbox isolation', () => {
  const live = 'sk_live_dummy'
  const test = 'sk_test_dummy'

  it('accepts test keys locally and in preview but rejects live keys', () => {
    expect(() => assertStripeKeyEnvironment(test, 'preview')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, 'development')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, undefined)).not.toThrow()
    expect(() => assertStripeKeyEnvironment(live, 'preview')).toThrow()
    expect(() => assertStripeKeyEnvironment(live, 'development')).toThrow()
    expect(() => assertStripeKeyEnvironment(live, undefined)).toThrow()
  })

  it('requires live keys in production and rejects invalid formats', () => {
    expect(() => assertStripeKeyEnvironment(live, 'production')).not.toThrow()
    expect(() => assertStripeKeyEnvironment('rk_live_dummy', 'production')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, 'production')).toThrow()
    expect(() => assertStripeKeyEnvironment('sk_invalid', 'preview')).toThrow()
  })
})
