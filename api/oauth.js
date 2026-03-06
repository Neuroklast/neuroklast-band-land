import { kv } from '@vercel/kv'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { applyRateLimit, getClientIp } from './_ratelimit.js'
import { validateSession } from './auth.js'

const isKVConfigured = () => !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

// ---------------------------------------------------------------------------
// Token Encryption (AES-256-GCM)
// ---------------------------------------------------------------------------

const OAUTH_LOGS_KEY = 'oauth:logs'
const MAX_LOG_ENTRIES = 100
const STATE_TTL = 300 // 5 minutes

export function getEncryptionKey() {
  const key = process.env.OAUTH_ENCRYPTION_KEY
  if (!key) throw new Error('OAUTH_ENCRYPTION_KEY is not configured')
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== 32) throw new Error('OAUTH_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  return buf
}

export function encryptToken(data) {
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const json = JSON.stringify(data)
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptToken(encrypted) {
  const key = getEncryptionKey()
  const buf = Buffer.from(encrypted, 'base64')
  const iv = buf.subarray(0, 12)
  const authTag = buf.subarray(12, 28)
  const ciphertext = buf.subarray(28)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(decrypted.toString('utf8'))
}

// ---------------------------------------------------------------------------
// Auth Logging
// ---------------------------------------------------------------------------

export async function appendOAuthLog(entry) {
  try {
    const logs = (await kv.get(OAUTH_LOGS_KEY)) || []
    const trimmed = [...logs, entry].slice(-MAX_LOG_ENTRIES)
    await kv.set(OAUTH_LOGS_KEY, trimmed)
  } catch (err) {
    console.error('Failed to write OAuth log:', err)
  }
}

// ---------------------------------------------------------------------------
// Provider Configuration
// ---------------------------------------------------------------------------

export const PROVIDERS = {
  spotify: {
    name: 'Spotify',
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    profileUrl: 'https://api.spotify.com/v1/me',
    scope: 'user-read-private user-read-email playlist-read-private',
    clientId: () => process.env.SPOTIFY_CLIENT_ID,
    clientSecret: () => process.env.SPOTIFY_CLIENT_SECRET,
  },
  'google-drive': {
    name: 'Google Drive',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'https://www.googleapis.com/auth/drive.readonly email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
  },
}

export function getCallbackUrl(req, provider) {
  const appUrl = process.env.OAUTH_APP_URL || process.env.SITE_URL
  if (!appUrl) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      return `http://localhost:5173/api/oauth?action=callback&provider=${provider}`
    }
    throw new Error('OAUTH_APP_URL or SITE_URL must be configured for OAuth')
  }
  return `${appUrl}/api/oauth?action=callback&provider=${provider}`
}

// ---------------------------------------------------------------------------
// Token Exchange
// ---------------------------------------------------------------------------

export async function exchangeCode(provider, code, redirectUri) {
  const cfg = PROVIDERS[provider]
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: cfg.clientId(),
    client_secret: cfg.clientSecret(),
  })
  const res = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }
  return res.json()
}

export async function fetchProfile(provider, accessToken) {
  const cfg = PROVIDERS[provider]
  const res = await fetch(cfg.profileUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  return res.json()
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!isKVConfigured()) {
    return res.status(503).json({ error: 'Service unavailable', message: 'KV storage is not configured.' })
  }

  const query = req.query || {}
  const body = req.body || {}

  const action = req.method === 'GET' ? query.action : body.action
  const provider = req.method === 'GET' ? query.provider : body.provider

  // --- GET: status ---
  if (req.method === 'GET' && action === 'status') {
    const sessionValid = await validateSession(req)
    if (!sessionValid) return res.status(401).json({ error: 'Authentication required' })

    const providerKeys = Object.keys(PROVIDERS)
    const [statusEntries, logs] = await Promise.all([
      Promise.all(
        providerKeys.map(async (key) => {
          try {
            const encrypted = await kv.get(`oauth:token:${key}`)
            if (encrypted) {
              const token = decryptToken(encrypted)
              return [
                key,
                {
                  connected: true,
                  displayName: token.displayName || null,
                  email: token.email || null,
                  connectedAt: token.connectedAt || null,
                },
              ]
            }
            return [key, { connected: false }]
          } catch (err) {
            console.error(`Failed to fetch/decrypt OAuth token for provider '${key}':`, err)
            return [key, { connected: false }]
          }
        }),
      ),
      kv.get(OAUTH_LOGS_KEY),
    ])

    const statuses = Object.fromEntries(statusEntries)
    return res.json({ statuses, logs: logs || [] })
  }

  // --- GET: authorize ---
  if (req.method === 'GET' && action === 'authorize') {
    const sessionValid = await validateSession(req)
    if (!sessionValid) return res.status(401).json({ error: 'Authentication required' })

    if (!provider || !PROVIDERS[provider]) {
      return res.status(400).json({ error: 'Invalid provider' })
    }
    const cfg = PROVIDERS[provider]
    if (!cfg.clientId()) {
      return res.status(503).json({
        error: `${cfg.name} OAuth is not configured. Set SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.`,
      })
    }

    const state = randomBytes(16).toString('hex')
    await kv.set(`oauth:state:${state}`, { provider, ip: getClientIp(req) }, { ex: STATE_TTL })

    const redirectUri = getCallbackUrl(req, provider)
    const params = new URLSearchParams({
      client_id: cfg.clientId(),
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: cfg.scope,
      state,
    })
    if (provider === 'google-drive') {
      params.set('access_type', 'offline')
      params.set('prompt', 'consent')
    }
    return res.json({ authUrl: `${cfg.authUrl}?${params.toString()}` })
  }

  // --- GET: callback ---
  if (req.method === 'GET' && action === 'callback') {
    const { code, state, error: oauthError } = query
    const postMessageOrigin = process.env.OAUTH_APP_URL || process.env.SITE_URL || '*'

    if (oauthError) {
      await appendOAuthLog({
        timestamp: new Date().toISOString(),
        provider,
        action: 'connect',
        success: false,
        reason: oauthError,
      })
      return res.status(400).send(
        `<html><body><script>window.opener?.postMessage({type:'oauth-callback',success:false,error:${JSON.stringify(oauthError)}},${JSON.stringify(postMessageOrigin)});window.close()</script><p>Connection failed: ${oauthError}. You can close this window.</p></body></html>`,
      )
    }

    if (!state || !code) {
      return res.status(400).send('<html><body><p>Invalid callback parameters.</p></body></html>')
    }

    const storedState = await kv.get(`oauth:state:${state}`)
    if (!storedState || storedState.provider !== provider) {
      await appendOAuthLog({
        timestamp: new Date().toISOString(),
        provider,
        action: 'connect',
        success: false,
        reason: 'invalid_state',
      })
      return res.status(403).send('<html><body><p>Invalid or expired state. Please try again.</p></body></html>')
    }
    await kv.del(`oauth:state:${state}`)

    try {
      const redirectUri = getCallbackUrl(req, provider)
      const tokenData = await exchangeCode(provider, code, redirectUri)
      const profile = await fetchProfile(provider, tokenData.access_token)

      const tokenRecord = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : null,
        displayName: profile?.display_name || profile?.name || null,
        email: profile?.email || null,
        connectedAt: new Date().toISOString(),
        provider,
      }

      const encrypted = encryptToken(tokenRecord)
      await kv.set(`oauth:token:${provider}`, encrypted)

      await appendOAuthLog({
        timestamp: new Date().toISOString(),
        provider,
        action: 'connect',
        success: true,
        displayName: tokenRecord.displayName,
        email: tokenRecord.email,
      })

      const cfg = PROVIDERS[provider]
      const displayName = tokenRecord.displayName || tokenRecord.email || cfg.name
      return res.status(200).send(
        `<html><body><script>window.opener?.postMessage({type:'oauth-callback',success:true,provider:${JSON.stringify(provider)},displayName:${JSON.stringify(displayName)}},${JSON.stringify(postMessageOrigin)});window.close()</script><p>Connected to ${cfg.name} as ${displayName}. You can close this window.</p></body></html>`,
      )
    } catch (err) {
      console.error('OAuth callback error:', err)
      await appendOAuthLog({
        timestamp: new Date().toISOString(),
        provider,
        action: 'connect',
        success: false,
        reason: err.message,
      })
      return res.status(500).send(
        `<html><body><script>window.opener?.postMessage({type:'oauth-callback',success:false,error:'connection_failed'},${JSON.stringify(postMessageOrigin)});window.close()</script><p>OAuth connection failed. Please try again.</p></body></html>`,
      )
    }
  }

  // --- POST: disconnect ---
  if (req.method === 'POST') {
    const allowed = await applyRateLimit(req, res)
    if (!allowed) return

    const sessionValid = await validateSession(req)
    if (!sessionValid) return res.status(401).json({ error: 'Authentication required' })

    if (action !== 'disconnect') return res.status(400).json({ error: 'Invalid action' })
    if (!provider || !PROVIDERS[provider]) return res.status(400).json({ error: 'Invalid provider' })

    await kv.del(`oauth:token:${provider}`)
    await appendOAuthLog({
      timestamp: new Date().toISOString(),
      provider,
      action: 'disconnect',
      success: true,
      ip: getClientIp(req),
    })

    return res.json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
