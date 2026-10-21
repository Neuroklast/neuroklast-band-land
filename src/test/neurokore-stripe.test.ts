
import { describe, expect, it } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyWebhook } from '../../lib/neurokore/stripe'
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
