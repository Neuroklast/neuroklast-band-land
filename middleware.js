import { kv } from '@vercel/kv'

/**
 * Vercel Edge Middleware — Global Circuit Breaker + IP Blocklist Gate.
 *
 * Runs on the Vercel Edge Network BEFORE any Serverless Function is invoked.
 * This protects the billing account in two ways:
 *
 * 1. **Hard-blocked IPs** are rejected instantly (403, empty body) so the
 *    expensive Serverless Function (api/denied.js etc.) never starts.
 *
 * 2. **Global Circuit Breaker** — counts ALL incoming requests in 10-second
 *    time windows.  When the count exceeds THRESHOLD (500) the system sets
 *    `nk_under_attack` in KV with a 5-minute TTL.  While that flag is set
 *    every single request is rejected (429, empty body).  After the TTL
 *    expires the flag auto-deletes and normal operation resumes.
 *
 * Edge Functions are billed by CPU cycles, not wall-clock time, so the
 * KV round-trip costs almost nothing compared to a Serverless Function.
 */

// Generate a cryptographically random salt per cold start if the environment
// variable is not configured.  This is far safer than a publicly-known
// fallback string because the generated salt cannot be pre-computed, though
// it will change on every cold start — meaning the blocklist hashes won't
// persist across restarts.  Set RATE_LIMIT_SALT to a stable secret value for
// consistent, long-lived IP blocking across deployments.
let SALT

if (process.env.RATE_LIMIT_SALT) {
  SALT = process.env.RATE_LIMIT_SALT
} else {
  const randomBytes = new Uint8Array(32)
  crypto.getRandomValues(randomBytes)
  SALT = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  console.error(
    '[SECURITY] RATE_LIMIT_SALT is not configured. ' +
    'A random salt has been generated for this cold start, but it will change on every restart. ' +
    'Set RATE_LIMIT_SALT in your environment variables for stable, consistent IP hashing.'
  )
}


/**
 * Hash an IP with SHA-256 + salt using the Web Crypto API (Edge-compatible).
 * Produces the same hex digest as the Node.js createHash in _ratelimit.js.
 */
async function hashIp(ip) {
  const data = new TextEncoder().encode(SALT + ip)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

/** Requests per 10-second window before the circuit breaker trips. */
const THRESHOLD = 500

/** How long (seconds) the circuit breaker stays open once tripped. */
const COOLDOWN_SECONDS = 300

export default async function middleware(req) {
  // Skip when KV is not configured (local development)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return
  }

  // Warn on every request in production if no stable salt is set
  if (!process.env.RATE_LIMIT_SALT && process.env.VERCEL) {
    console.error('[SECURITY] RATE_LIMIT_SALT is not configured in production. IP hashes use a per-cold-start random salt and will not persist across restarts.')
  }

  try {
    // ── 1. Circuit Breaker ──────────────────────────────────────────
    const isUnderAttack = await kv.get('nk_under_attack')
    if (isUnderAttack) {
      return new Response(null, { status: 429 })
    }

    // ── 2. Hard-Blocked IP Gate ─────────────────────────────────────
    const ip = getClientIp(req)
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
    const currentRequests = results[0]

    if (currentRequests > THRESHOLD) {
      await kv.set('nk_under_attack', true, { ex: COOLDOWN_SECONDS })
      return new Response(null, { status: 429 })
    }

    // Pass through — Serverless Function handles the rest
  } catch {
    // KV failure must never block legitimate traffic
  }
}

export const config = {
  matcher: '/:path*',
}
