import { randomBytes } from 'crypto'
import { kv } from '@vercel/kv'

// Minimal inline types so we avoid the vulnerable @vercel/node package
interface VercelRequest {
  method?: string
  body?: Record<string, unknown>
  headers?: Record<string, string | string[] | undefined>
}
interface VercelResponse {
  setHeader(key: string, value: string): this
  status(code: number): this
  json(data: unknown): this
  end(): this
}

// ─── Auth helper ──────────────────────────────────────────────────────────────

function checkAdminAuth(req: VercelRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN || process.env.VITE_ADMIN_TOKEN
  if (!adminToken) return false

  const authHeader = (req.headers?.['authorization'] as string | undefined) ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  return token === adminToken
}

// ─── Key Manager API ──────────────────────────────────────────────────────────

/**
 * GET  → List all activation keys (name + tier + created-at, NOT the key value)
 * POST → Generate a new activation key and return the key value once
 * DELETE → Revoke an existing key by value
 *
 * Only available on the primary deployment (VITE_IS_PRIMARY=true).
 * Requires Authorization: Bearer <ADMIN_TOKEN> header.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only available on primary instance
  if (process.env.VITE_IS_PRIMARY !== 'true') {
    return res.status(403).json({ error: 'Key manager only available on primary deployment' })
  }

  // Admin auth required
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // List all keys (metadata only, not the key values)
    try {
      const keys = await kv.smembers('activation-keys') as string[]
      const keyList = await Promise.all(
        keys.map(async (key: string) => {
          try {
            const meta = await kv.hgetall(`activation-key-meta:${key}`) as Record<string, unknown> | null
            return {
              name: (meta?.name as string) || '(unnamed)',
              tier: (meta?.tier as string) || 'free',
              createdAt: (meta?.createdAt as string) || null,
              // Mask the key value: show only last 4 chars
              keySuffix: key.slice(-4),
            }
          } catch {
            return { name: '(unnamed)', tier: 'free', createdAt: null, keySuffix: key.slice(-4) }
          }
        })
      )
      return res.status(200).json({ keys: keyList })
    } catch (error) {
      console.error('[admin/keys GET] KV error:', error)
      return res.status(500).json({ error: 'Failed to list keys' })
    }
  }

  if (req.method === 'POST') {
    // Generate a new activation key
    const { name = 'Unnamed Key', tier = 'free' } = req.body || {}

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required' })
    }
    if (!['free', 'pro', 'agency', 'saas'].includes(String(tier))) {
      return res.status(400).json({ error: 'Invalid tier. Must be one of: free, pro, agency, saas' })
    }

    try {
      const key = randomBytes(24).toString('hex')
      const createdAt = new Date().toISOString()

      await kv.sadd('activation-keys', key)
      await kv.hset(`activation-key-meta:${key}`, {
        name: name.trim(),
        tier: String(tier),
        createdAt,
        features: JSON.stringify([]),
      })

      return res.status(201).json({ key, name: name.trim(), tier, createdAt })
    } catch (error) {
      console.error('[admin/keys POST] KV error:', error)
      return res.status(500).json({ error: 'Failed to create key' })
    }
  }

  if (req.method === 'DELETE') {
    const { key } = req.body || {}

    if (!key || typeof key !== 'string' || !key.trim()) {
      return res.status(400).json({ error: 'key is required' })
    }

    try {
      await kv.srem('activation-keys', key.trim())
      await kv.del(`activation-key-meta:${key.trim()}`)
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('[admin/keys DELETE] KV error:', error)
      return res.status(500).json({ error: 'Failed to revoke key' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
