import { kv } from '@vercel/kv'

// Constant-time string comparison to prevent timing attacks on hash comparison
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      const { key } = req.query
      if (!key) return res.status(400).json({ error: 'key is required' })

      const value = await kv.get(key)
      return res.json({ value: value ?? null })
    }

    if (req.method === 'POST') {
      const { key, value } = req.body
      if (!key) return res.status(400).json({ error: 'key is required' })

      const token = req.headers['x-admin-token'] || ''

      if (key === 'admin-password-hash') {
        // Allow setting password if none exists (initial setup)
        // Require auth to change an existing password
        const existingHash = await kv.get('admin-password-hash')
        if (existingHash && !timingSafeEqual(token, existingHash)) {
          return res.status(403).json({ error: 'Unauthorized' })
        }
      } else {
        // All other writes require a valid admin token
        const adminHash = await kv.get('admin-password-hash')
        if (adminHash && !timingSafeEqual(token, adminHash)) {
          return res.status(403).json({ error: 'Unauthorized' })
        }
      }

      await kv.set(key, value)
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('KV API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
