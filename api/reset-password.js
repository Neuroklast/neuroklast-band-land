import { kv } from '@vercel/kv'
import { randomBytes } from 'node:crypto'
import { timingSafeEqual } from './kv.js'
import { applyRateLimit } from './_ratelimit.js'
import { resetPasswordSchema, confirmResetPasswordSchema, validate } from './_schemas.js'

// Check if KV is properly configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

const RESET_TOKEN_TTL = 600 // 10 minutes
const RESET_TOKEN_KEY = 'admin-reset-token'

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

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body is required' })
  }

  // --- Confirm reset flow: { token, newPasswordHash } ---
  if (req.body.token) {
    const parsed = validate(confirmResetPasswordSchema, req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error })
    const { token, newPasswordHash } = parsed.data

    try {
      const storedToken = await kv.get(RESET_TOKEN_KEY)
      if (!storedToken || !timingSafeEqual(token, storedToken)) {
        return res.status(400).json({ error: 'Invalid or expired reset token' })
      }

      // Set new password hash and delete the reset token atomically via pipeline
      const pipe = kv.pipeline()
      pipe.set('admin-password-hash', newPasswordHash)
      pipe.del(RESET_TOKEN_KEY)
      await pipe.exec()

      return res.json({ success: true, message: 'Password has been reset successfully.' })
    } catch (error) {
      console.error('Password reset confirm error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // --- Request reset flow: { email } ---
  const resetEmail = process.env.ADMIN_RESET_EMAIL
  if (!resetEmail) {
    return res.status(503).json({ error: 'Password reset is not configured' })
  }

  // Zod validation — ensures email is a valid email format
  const parsed = validate(resetPasswordSchema, req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error })
  const { email } = parsed.data

  // Use timing-safe comparison to prevent email enumeration via timing
  const emailMatch = timingSafeEqual(email.trim().toLowerCase(), resetEmail.trim().toLowerCase())
  if (!emailMatch) {
    // Return same success message to prevent email enumeration
    return res.json({ success: true, message: 'If the email matches, a reset link has been generated.' })
  }

  try {
    // Generate a secure random reset token instead of deleting the password hash.
    // The password hash remains intact — no race condition window.
    const token = randomBytes(32).toString('hex')
    await kv.set(RESET_TOKEN_KEY, token, { ex: RESET_TOKEN_TTL })

    // In production, this token should be sent via email to the admin.
    // For now, log it server-side so it can be retrieved from Vercel logs.
    console.log(`[SECURITY] Password reset token generated (expires in ${RESET_TOKEN_TTL}s)`)

    return res.json({ success: true, message: 'If the email matches, a reset link has been generated.' })
  } catch (error) {
    console.error('Password reset error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
