import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'
import { validateSession } from './auth.js'

/**
 * Canary alerts API — retrieve persisted canary document callback data.
 *
 * GET  /api/canary-alerts  → list canary callback alerts (admin only)
 *
 * Returns an array of canary callback events, each containing:
 * - token, hashedIp, openerIp, downloaderIp
 * - userAgent, acceptLanguage, event type
 * - timestamp, documentPath
 * - jsFingerprint (timezone, language, platform, screen, canvas hash, realIp)
 */

const CANARY_ALERTS_KEY = 'nk-canary-alerts'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  // Validate session first — authenticated admins bypass rate limiting
  // to prevent 429 errors when the dashboard loads multiple endpoints after login
  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    const allowed = await applyRateLimit(req, res)
    if (!allowed) return
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const raw = await kv.lrange(CANARY_ALERTS_KEY, 0, 499)
    const alerts = (raw || []).map(entry => {
      if (typeof entry === 'string') {
        try { return JSON.parse(entry) } catch { return entry }
      }
      return entry
    })

    return res.json({ alerts })
  } catch (error) {
    console.error('Canary alerts API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
