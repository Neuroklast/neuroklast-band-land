import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'
import { validateSession } from './auth.js'
import { z } from 'zod'
import { validate } from './_schemas.js'

/**
 * Security settings API — server-persisted security configuration.
 *
 * These settings are stored in KV (Redis) under `nk-security-settings`,
 * NOT in the public band-data JSON.  This ensures sensitive security
 * configuration is never exposed to unauthenticated users.
 *
 * GET  /api/security-settings  → read current settings (admin only)
 * POST /api/security-settings  → update settings (admin only)
 */

const KV_KEY = 'nk-security-settings'

const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/** Default security settings */
const DEFAULTS = {
  honeytokensEnabled: true,
  rateLimitEnabled: true,
  robotsTrapEnabled: true,
  entropyInjectionEnabled: true,
  suspiciousUaBlockingEnabled: true,
  sessionBindingEnabled: true,
  maxAlertsStored: 500,
  tarpitMinMs: 3000,
  tarpitMaxMs: 8000,
  sessionTtlSeconds: 14400,
  threatScoringEnabled: true,
  zipBombEnabled: false,        // Default OFF — explizit aktivieren erforderlich
  alertingEnabled: false,       // Default OFF — nur wenn DISCORD_WEBHOOK_URL gesetzt
  hardBlockEnabled: true,
  autoBlockThreshold: 12,       // Score ab dem auto-geblockt wird
}

/** Zod schema for security settings */
const securitySettingsSchema = z.object({
  honeytokensEnabled: z.boolean().optional(),
  rateLimitEnabled: z.boolean().optional(),
  robotsTrapEnabled: z.boolean().optional(),
  entropyInjectionEnabled: z.boolean().optional(),
  suspiciousUaBlockingEnabled: z.boolean().optional(),
  sessionBindingEnabled: z.boolean().optional(),
  maxAlertsStored: z.number().int().min(10).max(10000).optional(),
  tarpitMinMs: z.number().int().min(0).max(30000).optional(),
  tarpitMaxMs: z.number().int().min(0).max(60000).optional(),
  sessionTtlSeconds: z.number().int().min(300).max(86400).optional(),
  threatScoringEnabled: z.boolean().optional(),
  zipBombEnabled: z.boolean().optional(),
  alertingEnabled: z.boolean().optional(),
  hardBlockEnabled: z.boolean().optional(),
  autoBlockThreshold: z.number().int().min(3).max(50).optional(),
})

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
      const stored = await kv.get(KV_KEY)
      const settings = { ...DEFAULTS, ...(stored || {}) }
      return res.json({ settings })
    }

    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' })
      }

      const parsed = validate(securitySettingsSchema, req.body)
      if (!parsed.success) return res.status(400).json({ error: parsed.error })

      // Merge with existing settings
      const stored = await kv.get(KV_KEY)
      const updated = { ...DEFAULTS, ...(stored || {}), ...parsed.data }

      await kv.set(KV_KEY, updated)
      return res.json({ success: true, settings: updated })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Security settings API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
