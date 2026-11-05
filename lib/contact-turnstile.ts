/**
 * Validate Cloudflare Turnstile on the server before any persistence or mail.
 * The client widget alone does not stop direct submissions to Server Actions.
 */
export async function verifyContactTurnstile(formData: FormData): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!secret && !siteKey) return true // Optional until both keys are provisioned.
  if (!secret || !siteKey) return false // Never silently downgrade a partial setup.

  const token = formData.get('cf-turnstile-response')
  if (typeof token !== 'string' || token.length < 1 || token.length > 2048) return false

  const hosts = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? 'neuroklast.net,www.neuroklast.net')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(7000),
      cache: 'no-store',
    })
    if (!response.ok) return false
    const result: unknown = await response.json()
    if (typeof result !== 'object' || result === null) return false
    const verdict = result as { success?: unknown; action?: unknown; hostname?: unknown }
    return verdict.success === true &&
      verdict.action === 'contact' &&
      typeof verdict.hostname === 'string' &&
      hosts.includes(verdict.hostname.toLowerCase())
  } catch {
    return false
  }
}
