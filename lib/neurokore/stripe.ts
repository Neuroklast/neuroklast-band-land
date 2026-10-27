
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
/** A preview must never charge a live key, and production must never run on sandbox credentials. */
export function assertStripeKeyEnvironment(
  secret: string,
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): void {
  const live = /^(sk|rk)_live_/.test(secret)
  const test = /^(sk|rk)_test_/.test(secret)
  if (!live && !test) throw new Error('Invalid Stripe API key mode')
  if (vercelEnv === 'production' ? !live : !test) {
    throw new Error('Stripe key mode does not match deployment environment')
  }
}
/**
 * Sandbox-only checkout compatibility for an unconfigured Stripe test account:
 * - Managed Payments defaults on and rejects our contract links in custom_text.
 * - Stripe TOS collection needs a Stripe-hosted public terms URL.
 * - Automatic tax requires a product/default tax code and registrations.
 *
 * The website still requires explicit acknowledgement of terms before checkout.
 * Never apply these sandbox exceptions to a production sale.
 */
export function configureNeurokoreSandboxCheckout(params: URLSearchParams): void {
  params.set('managed_payments[enabled]', 'false')
  params.set('automatic_tax[enabled]', 'false')
  params.delete('consent_collection[terms_of_service]')
}

export async function stripe(
  path: string, secret: string, params?: URLSearchParams, idempotencyKey?: string,
  apiVersion = '2025-02-24.acacia',
): Promise<unknown> {
  assertStripeKeyEnvironment(secret)
  const response = await fetch('https://api.stripe.com/v1/' + path, {
    method: params ? 'POST' : 'GET', cache: 'no-store', signal: AbortSignal.timeout(15000),
    headers: { Authorization: 'Bearer ' + secret, 'Stripe-Version': apiVersion,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
    body: params?.toString(),
  })
  if (!response.ok) throw new Error('Payment service unavailable')
  return response.json()
}
