import { kv } from '@vercel/kv'
import { scrypt, randomBytes, createHash, timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { applyRateLimit } from './_ratelimit.js'
import { authLoginSchema, authSetupSchema, authChangePasswordSchema, validate } from './_schemas.js'

const scryptAsync = promisify(scrypt)

const SESSION_TTL = 86400 // 24 hours
const COOKIE_NAME = 'nk-session'

const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Hash a password with scrypt + random salt.
 * Format: scrypt:<salt_hex>:<derived_key_hex>
 */
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, 64)
  return `scrypt:${salt}:${derived.toString('hex')}`
}

/**
 * Verify a password against a stored hash.
 * Supports both scrypt (new) and legacy SHA-256 formats.
 */
async function verifyPassword(password, stored) {
  if (!stored.startsWith('scrypt:')) {
    // Legacy SHA-256 format
    const hash = createHash('sha256').update(password).digest('hex')
    const a = Buffer.from(hash, 'utf8')
    const b = Buffer.from(stored, 'utf8')
    if (a.length !== b.length) return false
    return cryptoTimingSafeEqual(a, b)
  }

  const [, salt, key] = stored.split(':')
  const derived = await scryptAsync(password, salt, 64)
  const storedKey = Buffer.from(key, 'hex')
  if (derived.length !== storedKey.length) return false
  return cryptoTimingSafeEqual(derived, storedKey)
}

function setSessionCookie(res, token) {
  const isLocal = process.env.NODE_ENV !== 'production' && !process.env.VERCEL
  const secure = isLocal ? '' : ' Secure;'
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=${SESSION_TTL}`)
}

function clearSessionCookie(res) {
  const isLocal = process.env.NODE_ENV !== 'production' && !process.env.VERCEL
  const secure = isLocal ? '' : ' Secure;'
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=0`)
}

/** Extract session token from the nk-session cookie */
export function getSessionFromCookie(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(/(?:^|;\s*)nk-session=([^;]*)/)
  return match ? match[1] : null
}

/** Validate that the request has a valid session. Returns true/false. */
export async function validateSession(req) {
  const token = getSessionFromCookie(req)
  if (!token) return false
  const sessionData = await kv.get(`session:${token}`)
  return !!sessionData
}

async function createSession(res) {
  const token = randomBytes(32).toString('hex')
  await kv.set(`session:${token}`, { created: Date.now() }, { ex: SESSION_TTL })
  setSessionCookie(res, token)
  return token
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  if (!isKVConfigured()) {
    return res.status(503).json({ error: 'Service unavailable', message: 'KV storage is not configured.' })
  }

  try {
    // GET — check auth status
    if (req.method === 'GET') {
      const authenticated = await validateSession(req)
      const storedHash = await kv.get('admin-password-hash')
      return res.json({
        authenticated,
        needsSetup: !storedHash,
      })
    }

    // POST — login, setup, or change password
    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' })
      }

      const { action, newPassword } = req.body

      // --- Setup flow: { password, action: 'setup' } ---
      if (action === 'setup') {
        const parsed = validate(authSetupSchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        const existingHash = await kv.get('admin-password-hash')
        if (existingHash) {
          return res.status(409).json({ error: 'Password already configured' })
        }

        const hashed = await hashPassword(parsed.data.password)
        await kv.set('admin-password-hash', hashed)
        await createSession(res)
        return res.json({ success: true })
      }

      // --- Change password flow: { currentPassword, newPassword } or session + { newPassword } ---
      if (newPassword) {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const storedHash = await kv.get('admin-password-hash')
        if (!storedHash) {
          return res.status(400).json({ error: 'No password set' })
        }

        // If currentPassword is provided, validate it for defense-in-depth
        if (req.body.currentPassword) {
          const parsed = validate(authChangePasswordSchema, req.body)
          if (!parsed.success) return res.status(400).json({ error: parsed.error })

          const valid = await verifyPassword(parsed.data.currentPassword, storedHash)
          if (!valid) {
            return res.status(403).json({ error: 'Current password is incorrect' })
          }
        }

        // Validate newPassword constraints
        if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
          return res.status(400).json({ error: 'New password must be 8-200 characters' })
        }

        const hashed = await hashPassword(newPassword)
        await kv.set('admin-password-hash', hashed)
        return res.json({ success: true })
      }

      // --- Login flow: { password } ---
      if (req.body.password) {
        const parsed = validate(authLoginSchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        const storedHash = await kv.get('admin-password-hash')
        if (!storedHash) {
          return res.status(401).json({ error: 'No password configured' })
        }

        const valid = await verifyPassword(parsed.data.password, storedHash)
        if (!valid) {
          return res.status(401).json({ error: 'Invalid password' })
        }

        // Migration: rehash legacy SHA-256 to scrypt on successful login
        if (!storedHash.startsWith('scrypt:')) {
          const rehashed = await hashPassword(parsed.data.password)
          await kv.set('admin-password-hash', rehashed)
        }

        await createSession(res)
        return res.json({ success: true })
      }

      return res.status(400).json({ error: 'Invalid request' })
    }

    // DELETE — logout
    if (req.method === 'DELETE') {
      const token = getSessionFromCookie(req)
      if (token) {
        await kv.del(`session:${token}`)
      }
      clearSessionCookie(res)
      return res.json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Auth API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
