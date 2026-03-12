import { kv } from '@vercel/kv'

/**
 * Vercel Edge Middleware — Global Circuit Breaker + IP Blocklist Gate.
 *
 * Runs on the Vercel Edge Network BEFORE any Serverless Function is invoked.
 * This protects the billing account in two ways:
 *
 * 1. **Hard-blocked IPs** are rejected instantly (403, empty body) so the
 *    expensive Serverless Function (api/denied.ts etc.) never starts.
 *
 * 2. **Global Circuit Breaker** — counts ALL incoming requests in 10-second
 *    time windows.  When the count exceeds THRESHOLD (500) the system sets
 *    `nk_under_attack` in KV with a 5-minute TTL.  While that flag is set
 *    every single request is rejected (429, empty body).  After the TTL
 *    expires the flag auto-deletes and normal operation resumes.
 *
 * Edge Functions are billed by CPU cycles, not wall-clock time, so the
 * KV round-trip costs almost nothing compared to a Serverless Function.
 *
 * ## Salt configuration
 * IP hashing uses RATE_LIMIT_SALT from the environment.  If the variable is
 * not set a cryptographically random salt is generated once per cold start
 * (see `initSalt()`).  The random fallback is secure against pre-computation
 * attacks but the salt changes on each cold start, so blocklist hashes will
 * not persist across restarts.  Set a stable RATE_LIMIT_SALT in production
 * for long-lived, consistent IP blocking.  See also: api/_ratelimit.ts.
 */

// ─── Salt initialisation ──────────────────────────────────────────────────────

/**
 * Return the rate-limit salt to use for IP hashing.
 *
 * Prefers the RATE_LIMIT_SALT environment variable.  If not set, generates
 * a cryptographically random 32-byte hex string for this cold start and
 * emits a loud security warning.
 */
function initSalt(): string {
  if (process.env.RATE_LIMIT_SALT) {
    return process.env.RATE_LIMIT_SALT
  }

  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const randomSalt = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

  console.error(
    '[SECURITY] RATE_LIMIT_SALT is not configured. ' +
    'A random salt has been generated for this cold start, but it will change on every restart. ' +
    'Set RATE_LIMIT_SALT in your environment variables for stable, consistent IP hashing.'
  )

  return randomSalt
}

const SALT = initSalt()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Hash an IP with SHA-256 + SALT using the Web Crypto API (Edge-compatible).
 * Produces the same hex digest as the Node.js createHash call in
 * api/_ratelimit.ts when both share the same salt value.
 */
async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + ip)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Extract the first IP from the x-forwarded-for header, which Vercel
 * populates with the original client address.
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Requests per 10-second window before the circuit breaker trips. */
const THRESHOLD = 500

/** How long (seconds) the circuit breaker stays open once tripped. */
const COOLDOWN_SECONDS = 300

// ─── Middleware ───────────────────────────────────────────────────────────────

export default async function middleware(request: Request): Promise<Response | undefined> {
  // Skip when KV is not configured (local development)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return
  }

  // Remind operators who have not set a stable salt in production
  if (!process.env.RATE_LIMIT_SALT && process.env.VERCEL) {
    console.error(
      '[SECURITY] RATE_LIMIT_SALT is not configured in production. ' +
      'IP hashes use a per-cold-start random salt and will not persist across restarts.'
    )
  }

  try {
    // ── 1. Circuit Breaker ──────────────────────────────────────────
    const isUnderAttack = await kv.get('nk_under_attack')
    if (isUnderAttack) {
      return new Response(null, { status: 429 })
    }

    // ── 2. Hard-Blocked IP Gate ─────────────────────────────────────
    const ip = getClientIp(request)
    const hashedIp = await hashIp(ip)
    const isBlocked = await kv.get(`nk-blocked:${hashedIp}`)
    if (isBlocked) {
      return new Response(null, { status: 403 })
    }

    // ── 3. Global Rate Counter ──────────────────────────────────────
    const timeWindow = Math.floor(Date.now() / 10000)
    const globalRateKey = `nk_global_rate_${timeWindow}`

    const pipeline = kv.pipeline()
    pipeline.incr(globalRateKey)
    pipeline.expire(globalRateKey, 20)

    const results = await pipeline.exec()
    const currentRequests = results[0] as number

    if (currentRequests > THRESHOLD) {
      await kv.set('nk_under_attack', true, { ex: COOLDOWN_SECONDS })
      return new Response(null, { status: 429 })
    }

    // Pass through — the Serverless Function handles the rest
  } catch {
    // KV failure must never block legitimate traffic
  }
}

export const config = {
  matcher: '/:path*',
}
