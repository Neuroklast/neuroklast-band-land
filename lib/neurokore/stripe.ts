
import { createHmac, timingSafeEqual } from 'node:crypto'
export function verifyWebhook(raw: string, header: string, secret: string, now = Date.now()) {
  const parts = header.split(',').map(part => part.trim().split('='))
  const timestamp = parts.find(([key]) => key === 't')?.[1]
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300)
    throw new Error('Stale webhook')
  const expected = createHmac('sha256', secret).update(timestamp + '.' + raw).digest()
  const ok = parts.some(([key, value]) => key === 'v1' && /^[a-f0-9]{64}$/.test(value || '') &&
    timingSafeEqual(expected, Buffer.from(value, 'hex')))
  if (!ok) throw new Error('Invalid webhook')
}
export async function stripe(path: string, secret: string, params?: URLSearchParams, idempotencyKey?: string): Promise<unknown> {
  const response = await fetch('https://api.stripe.com/v1/' + path, {
    method: params ? 'POST' : 'GET', cache: 'no-store', signal: AbortSignal.timeout(15000),
    headers: { Authorization: 'Bearer ' + secret, 'Stripe-Version': '2025-02-24.acacia',
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: params?.toString(),
  })
  if (!response.ok) throw new Error('Payment service unavailable')
  return response.json()
}
