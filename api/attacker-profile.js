import { applyRateLimit } from './_ratelimit.js'
import { validateSession } from './auth.js'
import { getProfile, getAllProfiles, deleteProfile, analyzeUserAgents } from './_attacker-profile.js'
import { z } from 'zod'
import { validate } from './_schemas.js'

/**
 * Attacker Profile API — detailed per-attacker analytics
 *
 * GET  /api/attacker-profile?hashedIp=xxx  → Get single attacker profile
 * GET  /api/attacker-profile?limit=50&offset=0 → Get all attacker profiles (paginated)
 * DELETE /api/attacker-profile?hashedIp=xxx → Delete attacker profile
 */

const isKVConfigured = () => !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

const getProfileSchema = z.object({
  hashedIp: z.string().min(8).max(64).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0)
})

const deleteProfileSchema = z.object({
  hashedIp: z.string().min(8).max(64)
})

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

  if (!isKVConfigured()) return res.status(503).json({ error: 'Service unavailable' })

  try {
    if (req.method === 'GET') {
      const parsed = validate(getProfileSchema, req.query)
      if (!parsed.success) return res.status(400).json({ error: parsed.error })

      const { hashedIp, limit, offset } = parsed.data

      if (hashedIp) {
        // Get single profile
        const profile = await getProfile(hashedIp)
        if (!profile) {
          return res.status(404).json({ error: 'Profile not found' })
        }

        // Add User-Agent analysis
        const uaAnalysis = analyzeUserAgents(profile)

        return res.json({
          profile: {
            ...profile,
            userAgentAnalysis: uaAnalysis
          }
        })
      } else {
        // Get all profiles with pagination
        const result = await getAllProfiles(limit, offset)
        return res.json(result)
      }
    }

    if (req.method === 'DELETE') {
      const parsed = validate(deleteProfileSchema, req.query)
      if (!parsed.success) return res.status(400).json({ error: parsed.error })

      const { hashedIp } = parsed.data
      const success = await deleteProfile(hashedIp)

      if (!success) {
        return res.status(500).json({ error: 'Failed to delete profile' })
      }

      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Attacker Profile API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
