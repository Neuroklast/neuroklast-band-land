import { kv } from '@vercel/kv'
import { Ratelimit } from '@upstash/ratelimit'
import { createHash } from 'node:crypto'

/**
 * GDPR-compliant rate limiting utility.
 *
 * - Uses @upstash/ratelimit with Vercel KV (Redis) as the backing store.
 * - IP addresses are hashed with SHA-256 + a secret salt before being used
 *   as identifiers, so no personal data (IP) is stored in plaintext.
 * - Rate limit state is ephemeral — entries expire automatically after the
 *   sliding window period (10 s default).
 *
 * The salt is read from the RATE_LIMIT_SALT environment variable. If absent,
 * a hardcoded fallback is used so the system still works in development.
 */

const SALT = process.env.RATE_LIMIT_SALT || 'nk-default-rate-limit-salt-change-me'

/**
 * Hash an IP address with SHA-256 + salt so it can be used as a rate-limit
 * key without storing PII.
 */
export function hashIp(ip) {
  return createHash('sha256').update(SALT + ip).digest('hex')
}

/**
 * Extract the client IP from a Vercel serverless request.
 * Vercel sets `x-forwarded-for`; we take the first address in the chain.
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return '127.0.0.1'
}

// Check if KV is properly configured (needed for rate limiter)
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Pre-configured rate limiter instance.
 * Sliding window: 5 requests per 10 seconds per (hashed) IP.
 *
 * Only created when KV is configured; otherwise applyRateLimit() is a no-op
 * so local development without KV still works.
 */
let ratelimit = null

function getRatelimit() {
  if (ratelimit) return ratelimit
  if (!isKVConfigured()) return null
  ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(5, '10 s'),
    prefix: 'nk-rl',
  })
  return ratelimit
}

/**
 * Apply rate limiting to a request.
 *
 * Returns `true` if the request is allowed, `false` + sends a 429 response
 * if the limit has been exceeded.
 *
 * Usage inside a Vercel handler:
 *
 *   const allowed = await applyRateLimit(req, res)
 *   if (!allowed) return   // 429 already sent
 *   // … handle request normally
 */
export async function applyRateLimit(req, res) {
  const rl = getRatelimit()
  if (!rl) return true // KV not configured — allow (dev mode)

  const ip = getClientIp(req)
  const identifier = hashIp(ip)

  try {
    const { success } = await rl.limit(identifier)
    if (!success) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again in a few seconds.',
      })
      return false
    }
    return true
  } catch (err) {
    // If rate limiting itself fails (e.g. KV outage), allow the request
    // through rather than blocking all traffic.
    console.warn('Rate limit check failed, allowing request:', err)
    return true
  }
}
