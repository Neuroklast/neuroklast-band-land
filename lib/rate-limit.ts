import { createHash, randomBytes } from 'node:crypto'
import { headers as nextHeaders } from 'next/headers'
import { createAdminClient } from '@/lib/supabaseAdmin'

/**
 * Enterprise-grade, distributed rate limiter backed by Supabase Postgres.
 *
 * - No Redis: the atomic fixed-window counter lives in `public.rate_limits`,
 *   incremented via the `consume_rate_limit` Postgres function (SECURITY DEFINER,
 *   service-role only). This is globally consistent across all serverless instances.
 * - Privacy (GDPR): the client IP is hashed with SHA-256 + `RATE_LIMIT_SALT`
 *   before use; only the hash is ever persisted. No plaintext IPs are stored.
 * - Resilience: if the Postgres call fails, this throws. Callers deny the
 *   request. A per-process memory counter would reset on every cold start.
 */

export interface RateLimitResult {
  namespace: string
  allowed: boolean
  /** Seconds until the window resets — present when disallowed. */
  retryAfter?: number
}

export interface RateLimitOptions {
  namespace: string
  /** Max allowed calls per window for a single identifier. */
  limit: number
  /** Window length in seconds. */
  windowSeconds: number
  /** Explicit client IP. When omitted, read from the request headers. */
  ip?: string
  /** Explicit headers object (Route Handlers). When omitted, uses next/headers(). */
  headers?: Headers
}

let salt: string | null = null

function resolveSalt(): string {
  if (salt) return salt
  if (process.env.RATE_LIMIT_SALT) {
    salt = process.env.RATE_LIMIT_SALT
    return salt
  }
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  if (process.env.NODE_ENV === 'production' && !isBuild) {
    throw new Error(
      '[SECURITY] RATE_LIMIT_SALT environment variable is not set. ' +
        'A unique random salt is required in production to protect IP hashes.',
    )
  }
  salt = randomBytes(32).toString('hex')
  return salt
}

function hashIp(ip: string): string {
  return createHash('sha256').update(resolveSalt() + ip).digest('hex')
}

function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || '127.0.0.1'
  return headers.get('x-real-ip') || '127.0.0.1'
}

/**
 * Atomic fixed-window counter via Supabase Postgres.
 * Throws when the RPC errors. Callers deny the request.
 */
async function consumeSupabase(
  namespace: string,
  ipHash: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('consume_rate_limit', {
    p_key: `${namespace}:${ipHash}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })

  if (error) throw error

  const payload = (data && typeof data === 'object' ? data : {}) as {
    count?: number
    reset_at?: number
  }
  if (typeof payload.count !== 'number') {
    return { namespace, allowed: false, retryAfter: windowSeconds }
  }
  const count = payload.count
  const resetAt =
    typeof payload.reset_at === 'number' && payload.reset_at > 0
      ? payload.reset_at
      : Date.now() + windowSeconds * 1000

  const allowed = count <= limit
  return {
    namespace,
    allowed,
    retryAfter: allowed ? undefined : Math.max(0, Math.ceil((resetAt - Date.now()) / 1000)),
  }
}

/**
 * Consume one rate-limit unit. Throws when Postgres cannot be consulted.
 * Callers must deny the request. A memory counter would not survive a new process.
 */
export async function consumeRequestRateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { namespace, limit, windowSeconds } = options
  const ip = options.ip ?? clientIpFrom(options.headers ?? (await nextHeaders()))
  const ipHash = hashIp(ip)
  return consumeSupabase(namespace, ipHash, limit, windowSeconds)
}

/** Convenience for callers that already have a `request` (Route Handlers). */
export async function consumeRateLimitForRequest(
  request: Request,
  options: Omit<RateLimitOptions, 'ip' | 'headers'>,
): Promise<RateLimitResult> {
  return consumeRequestRateLimit({ ...options, headers: request.headers })
}
