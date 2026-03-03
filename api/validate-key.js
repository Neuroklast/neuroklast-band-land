import { kv } from '@vercel/kv'

/**
 * Central Activation Key validation endpoint.
 *
 * POST /api/validate-key
 * Body: { key: string }
 *
 * Response: { valid: boolean, tier?: string, features?: string[] }
 *
 * CORS is intentionally open so that forks deployed on their own Vercel
 * instances can call back to the original project's API to validate keys
 * stored in the central KV store.
 */
export default async function handler(req, res) {
  // CORS — allow any origin so that authorized forks can validate their keys
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { key } = req.body || {}
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ valid: false, error: 'Missing activation key' })
  }

  const trimmedKey = key.trim()

  try {
    // Check if the key exists in the activation-keys set
    const isValid = await kv.sismember('activation-keys', trimmedKey)

    if (!isValid) {
      return res.status(200).json({ valid: false })
    }

    // Look up optional license tier metadata stored as a hash
    // Key format: activation-key-meta:<key>  →  { tier, features[] }
    let tier = 'free'
    let features = []
    try {
      const meta = await kv.hgetall(`activation-key-meta:${trimmedKey}`)
      if (meta) {
        if (meta.tier) tier = meta.tier
        if (meta.features) {
          features = typeof meta.features === 'string'
            ? JSON.parse(meta.features)
            : meta.features
        }
      }
    } catch {
      // Meta lookup is best-effort — a valid key without metadata gets free tier
    }

    return res.status(200).json({ valid: true, tier, features })
  } catch (err) {
    console.error('validate-key: KV error', err)
    return res.status(500).json({ valid: false, error: 'Validation service unavailable' })
  }
}
