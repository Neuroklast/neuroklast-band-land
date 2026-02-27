import { kv } from '@vercel/kv'
import { validateSession } from './auth.js'

const KV_KEY = 'newsletter-subscribers'

/**
 * Newsletter subscriber management API (admin only).
 *
 * GET  — list all locally stored subscribers
 * POST — manually add a subscriber
 *
 * Note: subscribers who signed up via Mailchimp/Brevo are stored in those
 * services.  This endpoint manages a local KV mirror that can be used
 * when no external provider is configured.
 */

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(503).json({ error: 'KV storage not configured' })
  }

  const sessionValid = await validateSession(req)
  if (!sessionValid) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    if (req.method === 'GET') {
      const subscribers = (await kv.get(KV_KEY)) || []
      return res.status(200).json({ subscribers })
    }

    if (req.method === 'DELETE') {
      const { email } = req.body || {}
      if (!email) {
        return res.status(400).json({ error: 'Email is required' })
      }
      const subscribers = (await kv.get(KV_KEY)) || []
      const filtered = subscribers.filter((s) => s.email !== email)
      await kv.set(KV_KEY, filtered)
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', 'GET, DELETE, OPTIONS')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Subscribers API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
