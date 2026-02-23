import { handleCanaryCallback } from './_canary-documents.js'

/**
 * Canary callback endpoint — receives "phone home" signals from
 * canary documents opened by attackers.
 *
 * GET  /api/canary-callback?t=<token>&e=img  → tracking pixel callback
 * POST /api/canary-callback?t=<token>&e=js   → JavaScript fingerprint data
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return handleCanaryCallback(req, res)
}
