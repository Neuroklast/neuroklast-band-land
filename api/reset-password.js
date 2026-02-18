import { kv } from '@vercel/kv'
import { timingSafeEqual } from './kv.js'
import { applyRateLimit } from './_ratelimit.js'
import { resetPasswordSchema, validate } from './_schemas.js'

// Check if KV is properly configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting — blocks brute-force password reset attempts (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isKVConfigured()) {
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'KV storage is not configured.',
    })
  }

  const resetEmail = process.env.ADMIN_RESET_EMAIL
  if (!resetEmail) {
    return res.status(503).json({ error: 'Password reset is not configured' })
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body is required' })
  }

  // Zod validation — ensures email is a valid email format
  const parsed = validate(resetPasswordSchema, req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error })
  const { email } = parsed.data

  // Use timing-safe comparison to prevent email enumeration via timing
  const emailMatch = timingSafeEqual(email.trim().toLowerCase(), resetEmail.trim().toLowerCase())
  if (!emailMatch) {
    // Return same success message to prevent email enumeration
    return res.json({ success: true, message: 'If the email matches, the password has been reset.' })
  }

  try {
    // Delete the admin password hash, allowing a new password to be set via the setup flow
    await kv.del('admin-password-hash')
    return res.json({ success: true, message: 'If the email matches, the password has been reset.' })
  } catch (error) {
    console.error('Password reset error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
