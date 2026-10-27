
import { describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import { assertStripeKeyEnvironment, configureNeurokoreSandboxCheckout, verifyWebhook } from '../../lib/neurokore/stripe'
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

  it('permits sandbox keys for local development and previews', () => {
    expect(() => assertStripeKeyEnvironment(test, 'preview')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, 'development')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, undefined)).not.toThrow()
  })

  it('refuses live credentials outside production', () => {
    expect(() => assertStripeKeyEnvironment(live, 'preview')).toThrow()
    expect(() => assertStripeKeyEnvironment(live, 'development')).toThrow()
    expect(() => assertStripeKeyEnvironment(live, undefined)).toThrow()
  })

  it('requires live credentials for production and rejects unrecognized keys', () => {
    expect(() => assertStripeKeyEnvironment(live, 'production')).not.toThrow()
    expect(() => assertStripeKeyEnvironment(test, 'production')).toThrow()
    expect(() => assertStripeKeyEnvironment('bad-secret', 'preview')).toThrow()
  })
})

describe('NEUROKORE Stripe Sandbox session configuration', () => {
  it('disables only unsupported test-account features, retaining the contract and product', () => {
    const params = new URLSearchParams({
      'line_items[0][price]': 'price_test_one_euro',
      'automatic_tax[enabled]': 'true',
      'consent_collection[terms_of_service]': 'required',
      'custom_text[submit][message]': 'Terms and withdrawal details',
      'metadata[plugin_order]': 'test-order',
    })
    configureNeurokoreSandboxCheckout(params)
    expect(params.get('managed_payments[enabled]')).toBe('false')
    expect(params.get('automatic_tax[enabled]')).toBe('false')
    expect(params.has('consent_collection[terms_of_service]')).toBe(false)
    expect(params.get('custom_text[submit][message]')).toContain('withdrawal')
    expect(params.get('line_items[0][price]')).toBe('price_test_one_euro')
    expect(params.get('metadata[plugin_order]')).toBe('test-order')
  })
})
