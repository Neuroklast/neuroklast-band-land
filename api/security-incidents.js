import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'
import { validateSession } from './auth.js'

/**
 * Security incidents API — returns honeytoken alerts and access violations.
 *
 * GET /api/security-incidents
 *   Requires admin session. Returns the last 500 security events
 *   (honeytoken triggers, robots.txt violations, etc.) from KV.
 *
 * DELETE /api/security-incidents
 *   Requires admin session. Clears all stored security incidents.
 */

const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // All operations require admin authentication
  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!isKVConfigured()) {
    return res.status(503).json({ error: 'Service unavailable', message: 'KV storage is not configured.' })
  }

  try {
    if (req.method === 'GET') {
      // Fetch up to 500 security incidents from the capped list
      const raw = await kv.lrange('nk-honeytoken-alerts', 0, 499)
      const incidents = (raw || []).map((entry) => {
        if (typeof entry === 'string') {
          try { return JSON.parse(entry) } catch { return entry }
        }
        return entry
      })
      return res.json({ incidents })
    }

    if (req.method === 'DELETE') {
      await kv.del('nk-honeytoken-alerts')
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Security incidents API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
