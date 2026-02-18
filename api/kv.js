import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'
import { isHoneytoken, triggerHoneytokenAlarm, isMarkedAttacker, injectEntropyHeaders } from './_honeytokens.js'
import { kvGetQuerySchema, kvPostSchema, validate } from './_schemas.js'
import { validateSession } from './auth.js'

// Check if KV is properly configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Allow-list of keys that may be read without admin authentication.
 * All other keys require a valid session cookie.
 * This prevents accidental leakage of sensitive data stored under
 * arbitrary key names (e.g. stripe_api_key, db_password, etc.).
 */
const ALLOWED_PUBLIC_READ_KEYS = new Set([
  'band-data',
])

// Constant-time string comparison to prevent timing attacks on hash comparison.
// Always compares the full length of the longer string to avoid leaking length.
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const len = Math.max(a.length, b.length)
  let result = a.length ^ b.length
  for (let i = 0; i < len; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return result === 0
}

/** Suspicious User-Agent patterns used by hacking/fuzzing tools */
const SUSPICIOUS_UA_PATTERNS = [/wfuzz/i, /nikto/i, /sqlmap/i, /dirbuster/i, /gobuster/i, /ffuf/i]

function isSuspiciousUA(req) {
  const ua = req.headers['user-agent'] || ''
  return SUSPICIOUS_UA_PATTERNS.some(p => p.test(ua))
}

/** Artificial delay for tarpit — slows down automated tools */
function tarpitDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Wfuzz / hacking tool detection — mock and tarpit
  if (isSuspiciousUA(req)) {
    await tarpitDelay(3000 + Math.random() * 2000)
    return res.status(403).json({
      error: 'NOOB_DETECTED',
      tip: 'Next time, try changing your User-Agent before hacking a band.',
    })
  }

  // Rate limiting — blocks brute-force and DoS attacks (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // Entropy injection counter-measure: inject noise headers for flagged attacker IPs
  if (await isMarkedAttacker(req)) {
    injectEntropyHeaders(res)
  }

  // Check if KV is configured
  if (!isKVConfigured()) {
    console.error('KV not configured: Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables')
    return res.status(503).json({ 
      error: 'Service unavailable',
      message: 'KV storage is not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.'
    })
  }

  try {
    if (req.method === 'GET') {
      // Zod validation
      const parsed = validate(kvGetQuerySchema, req.query)
      if (!parsed.success) return res.status(400).json({ error: parsed.error })
      const { key } = parsed.data

      // Honeytoken detection — silent alarm on GET.
      // Return the same response as a normal key-not-found to avoid revealing
      // which keys are traps (an attacker could fingerprint 403 vs 200).
      if (isHoneytoken(key)) {
        await triggerHoneytokenAlarm(req, key)
        return res.json({ value: null })
      }

      // Allow-list: only explicitly listed keys are publicly readable.
      // All other keys require a valid session to prevent leakage
      // of sensitive data stored under arbitrary key names.
      if (!ALLOWED_PUBLIC_READ_KEYS.has(key)) {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(403).json({ error: 'Forbidden' })
        }
      }

      const value = await kv.get(key)
      return res.json({ value: value ?? null })
    }

    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' })
      }

      // Zod validation
      const parsed = validate(kvPostSchema, req.body)
      if (!parsed.success) return res.status(400).json({ error: parsed.error })
      const { key, value } = parsed.data

      // Honeytoken detection — silent alarm on POST.
      // Return same error as reserved key prefix to avoid revealing traps.
      if (isHoneytoken(key)) {
        await triggerHoneytokenAlarm(req, key)
        return res.status(403).json({ error: 'Forbidden: reserved key prefix' })
      }

      // Block writes to internal keys used by analytics or system functions
      const lowerKey = key.toLowerCase()
      if (lowerKey.startsWith('nk-analytics') || lowerKey.startsWith('nk-heatmap') || lowerKey.startsWith('img-cache:')) {
        return res.status(403).json({ error: 'Forbidden: reserved key prefix' })
      }

      // Block direct writes to admin-password-hash — only allowed through /api/auth
      if (key === 'admin-password-hash') {
        return res.status(403).json({ error: 'Forbidden: use /api/auth to manage passwords' })
      }

      // All other writes require a valid session
      const sessionValid = await validateSession(req)
      if (!sessionValid) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      await kv.set(key, value)
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('KV API error:', error)
    // Provide more detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('KV API error details:', {
      message: errorMessage,
      key: req.body?.key,
      method: req.method
    })
    
    // Check if it's a KV-specific configuration error from @vercel/kv
    // Common errors include missing environment variables or connection issues
    const isKVConfigError = error instanceof Error && (
      errorMessage.toLowerCase().includes('kv_rest_api_url') ||
      errorMessage.toLowerCase().includes('kv_rest_api_token') ||
      errorMessage.toLowerCase().includes('vercel kv') ||
      errorMessage.toLowerCase().includes('missing credentials')
    )
    
    if (isKVConfigError) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'KV storage configuration error. Please check environment variables.'
      })
    }
    
    return res.status(500).json({ 
      error: 'Internal server error'
    })
  }
}
