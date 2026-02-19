import { kv } from '@vercel/kv'
import { scrypt, randomBytes, createHash, timingSafeEqual as cryptoTimingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { applyRateLimit, getClientIp } from './_ratelimit.js'
import { authLoginSchema, authSetupSchema, authChangePasswordSchema, authLoginTotpSchema, totpSetupSchema, totpVerifySchema, validate } from './_schemas.js'
import * as OTPAuth from 'otpauth'

const scryptAsync = promisify(scrypt)

const SESSION_TTL = 14400 // 4 hours (reduced from 24h to limit session hijacking window)
const COOKIE_NAME = 'nk-session'
const TOTP_ISSUER = 'NEUROKLAST Admin'
const TOTP_KEY = 'admin-totp-secret'

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
  // TODO: Remove legacy SHA-256 path after all passwords have been migrated to scrypt.
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

/**
 * Derive a client fingerprint from User-Agent and IP prefix.
 * Uses /24 subnet for IPv4 (first 3 octets) or /48 for IPv6 (first 3 groups).
 * Used to bind sessions to the originating client and detect session hijacking.
 */
function getClientFingerprint(req) {
  const ua = req.headers['user-agent'] || ''
  const ip = getClientIp(req)
  let ipPrefix
  if (ip.includes(':')) {
    // IPv6: use first 3 groups (/48 prefix)
    ipPrefix = ip.split(':').slice(0, 3).join(':')
  } else {
    // IPv4: use first 3 octets (/24 prefix)
    ipPrefix = ip.split('.').slice(0, 3).join('.')
  }
  return createHash('sha256').update(`${ua}|${ipPrefix}`).digest('hex')
}

/** Validate that the request has a valid session. Returns true/false. */
export async function validateSession(req) {
  const token = getSessionFromCookie(req)
  if (!token) return false
  const sessionData = await kv.get(`session:${token}`)
  if (!sessionData) return false
  // Validate client binding — reject if User-Agent or IP subnet changed
  if (sessionData.fingerprint) {
    const currentFingerprint = getClientFingerprint(req)
    if (sessionData.fingerprint !== currentFingerprint) return false
  }
  return true
}

async function createSession(req, res) {
  const token = randomBytes(32).toString('hex')
  const fingerprint = getClientFingerprint(req)
  await kv.set(`session:${token}`, { created: Date.now(), fingerprint }, { ex: SESSION_TTL })
  setSessionCookie(res, token)
  return token
}

/**
 * Invalidate all existing sessions by scanning and deleting session:* keys.
 * Called after a password change to force re-authentication.
 */
async function invalidateAllSessions() {
  try {
    let cursor = 0
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: 'session:*', count: 100 })
      cursor = nextCursor
      if (keys.length > 0) {
        await Promise.all(keys.map(key => kv.del(key)))
      }
    } while (cursor !== 0)
  } catch (err) {
    console.error('Failed to invalidate sessions:', err)
  }
}

/**
 * Generate a new TOTP secret and return the provisioning URI for QR code enrollment.
 */
function generateTotpSecret() {
  const secret = new OTPAuth.Secret({ size: 20 })
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_ISSUER,
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  })
  return { secret: secret.base32, uri: totp.toString() }
}

/**
 * Verify a TOTP code against the stored secret.
 * Allows ±1 period window (30 s each side) to handle clock skew.
 */
function verifyTotpCode(secret, code) {
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_ISSUER,
    label: 'admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  })
  // delta === null means invalid; otherwise returns the time step offset
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}

/**
 * Validate the admin setup token.
 * If ADMIN_SETUP_TOKEN is set, the request must include a matching setupToken.
 */
function validateSetupToken(setupToken) {
  const requiredToken = process.env.ADMIN_SETUP_TOKEN
  if (!requiredToken) return true // No token configured — allow setup (backward-compatible)
  if (!setupToken || typeof setupToken !== 'string') return false
  const a = Buffer.from(requiredToken, 'utf8')
  const b = Buffer.from(setupToken, 'utf8')
  if (a.length !== b.length) return false
  return cryptoTimingSafeEqual(a, b)
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
      const totpSecret = await kv.get(TOTP_KEY)
      return res.json({
        authenticated,
        needsSetup: !storedHash,
        totpEnabled: !!totpSecret,
        setupTokenRequired: !!process.env.ADMIN_SETUP_TOKEN,
      })
    }

    // POST — login, setup, change password, or TOTP management
    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' })
      }

      const { action, newPassword } = req.body

      // --- Setup flow: { password, action: 'setup', setupToken? } ---
      if (action === 'setup') {
        const parsed = validate(authSetupSchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        // Validate setup token if ADMIN_SETUP_TOKEN is configured
        if (!validateSetupToken(req.body.setupToken)) {
          return res.status(403).json({ error: 'Invalid setup token' })
        }

        const existingHash = await kv.get('admin-password-hash')
        if (existingHash) {
          return res.status(409).json({ error: 'Password already configured' })
        }

        const hashed = await hashPassword(parsed.data.password)
        await kv.set('admin-password-hash', hashed)
        await createSession(req, res)
        return res.json({ success: true })
      }

      // --- TOTP enrollment: { action: 'totp-setup' } ---
      if (action === 'totp-setup') {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const existingTotp = await kv.get(TOTP_KEY)
        if (existingTotp) {
          return res.status(409).json({ error: 'TOTP is already configured. Disable it first to re-enroll.' })
        }

        const { secret, uri } = generateTotpSecret()
        // Store the pending secret temporarily (5 min TTL) until confirmed
        await kv.set('admin-totp-pending', secret, { ex: 300 })
        return res.json({ success: true, totpUri: uri, totpSecret: secret })
      }

      // --- TOTP confirm enrollment: { action: 'totp-verify', code } ---
      if (action === 'totp-verify') {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const parsed = validate(totpVerifySchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        const pendingSecret = await kv.get('admin-totp-pending')
        if (!pendingSecret) {
          return res.status(400).json({ error: 'No pending TOTP enrollment. Start setup first.' })
        }

        if (!verifyTotpCode(pendingSecret, parsed.data.code)) {
          return res.status(403).json({ error: 'Invalid TOTP code. Please try again.' })
        }

        // Persist the secret and remove the pending key
        const pipe = kv.pipeline()
        pipe.set(TOTP_KEY, pendingSecret)
        pipe.del('admin-totp-pending')
        await pipe.exec()

        return res.json({ success: true, message: 'TOTP 2FA has been enabled.' })
      }

      // --- TOTP disable: { action: 'totp-disable', password, code } ---
      if (action === 'totp-disable') {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const parsed = validate(totpSetupSchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        // Require password to disable TOTP (prevents session-hijacking TOTP removal)
        const storedHash = await kv.get('admin-password-hash')
        if (!storedHash) return res.status(400).json({ error: 'No password set' })

        const valid = await verifyPassword(parsed.data.password, storedHash)
        if (!valid) return res.status(403).json({ error: 'Invalid password' })

        // Require a valid TOTP code to confirm the owner has the authenticator
        const totpSecret = await kv.get(TOTP_KEY)
        if (!totpSecret) return res.status(400).json({ error: 'TOTP is not enabled' })

        if (!verifyTotpCode(totpSecret, parsed.data.code)) {
          return res.status(403).json({ error: 'Invalid TOTP code' })
        }

        await kv.del(TOTP_KEY)
        return res.json({ success: true, message: 'TOTP 2FA has been disabled.' })
      }

      // --- Change password flow: { currentPassword, newPassword } ---
      if (newPassword) {
        const sessionValid = await validateSession(req)
        if (!sessionValid) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        const storedHash = await kv.get('admin-password-hash')
        if (!storedHash) {
          return res.status(400).json({ error: 'No password set' })
        }

        // currentPassword is always required to prevent session-hijacking password changes
        const parsed = validate(authChangePasswordSchema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        const valid = await verifyPassword(parsed.data.currentPassword, storedHash)
        if (!valid) {
          return res.status(403).json({ error: 'Current password is incorrect' })
        }

        // Validate newPassword constraints
        if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 200) {
          return res.status(400).json({ error: 'New password must be 8-200 characters' })
        }

        const hashed = await hashPassword(newPassword)
        await kv.set('admin-password-hash', hashed)

        // Invalidate all existing sessions after password change
        await invalidateAllSessions()

        // Create a fresh session for the current user
        await createSession(req, res)
        return res.json({ success: true })
      }

      // --- Login flow: { password, totpCode? } ---
      if (req.body.password && !action) {
        const totpSecret = await kv.get(TOTP_KEY)

        // If TOTP is enabled, use the extended login schema
        const schema = totpSecret ? authLoginTotpSchema : authLoginSchema
        const parsed = validate(schema, req.body)
        if (!parsed.success) return res.status(400).json({ error: parsed.error })

        const storedHash = await kv.get('admin-password-hash')
        if (!storedHash) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const valid = await verifyPassword(parsed.data.password, storedHash)
        if (!valid) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        // If TOTP is enabled, verify the code
        if (totpSecret) {
          if (!parsed.data.totpCode) {
            return res.status(403).json({ error: 'TOTP code required', totpRequired: true })
          }
          if (!verifyTotpCode(totpSecret, parsed.data.totpCode)) {
            return res.status(403).json({ error: 'Invalid TOTP code', totpRequired: true })
          }
        }

        // Migration: rehash legacy SHA-256 to scrypt on successful login
        if (!storedHash.startsWith('scrypt:')) {
          const rehashed = await hashPassword(parsed.data.password)
          await kv.set('admin-password-hash', rehashed)
        }

        await createSession(req, res)
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
