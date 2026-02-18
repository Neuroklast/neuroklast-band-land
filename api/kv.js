import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'

// Check if KV is properly configured
const isKVConfigured = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// Constant-time string comparison to prevent timing attacks on hash comparison.
// Always compares the full length of the longer string to avoid leaking length.
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const len = Math.max(a.length, b.length)
  let result = a.length ^ b.length
  for (let i = 0; i < len; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return result === 0
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting — blocks brute-force and DoS attacks (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // Check if KV is configured
  if (!isKVConfigured()) {
    console.error('KV not configured: Missing KV_REST_API_URL or KV_REST_API_TOKEN environment variables')
    return res.status(503).json({ 
      error: 'Service unavailable',
      message: 'KV storage is not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.'
    })
  }

  try {
    if (req.method === 'GET') {
      const { key } = req.query
      if (!key || typeof key !== 'string') return res.status(400).json({ error: 'key is required' })

      // Validate key length and characters
      if (key.length > 200) return res.status(400).json({ error: 'key is too long' })
      if (/[\n\r\0]/.test(key)) return res.status(400).json({ error: 'key contains invalid characters' })

      // Block access to sensitive keys to prevent credential leakage
      const lowerKey = key.toLowerCase()
      if (lowerKey === 'admin-password-hash' || lowerKey.includes('token') || lowerKey.includes('secret')) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const value = await kv.get(key)
      return res.json({ value: value ?? null })
    }

    if (req.method === 'POST') {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' })
      }

      const { key, value } = req.body
      if (!key || typeof key !== 'string') return res.status(400).json({ error: 'key is required' })
      if (value === undefined) return res.status(400).json({ error: 'value is required' })

      // Validate key length and characters to prevent injection into Redis keyspace
      if (key.length > 200) return res.status(400).json({ error: 'key is too long' })
      if (/[\n\r\0]/.test(key)) return res.status(400).json({ error: 'key contains invalid characters' })

      // Block writes to internal keys used by analytics or system functions
      const lowerKey = key.toLowerCase()
      if (lowerKey.startsWith('nk-analytics') || lowerKey.startsWith('nk-heatmap') || lowerKey.startsWith('img-cache:')) {
        return res.status(403).json({ error: 'Forbidden: reserved key prefix' })
      }

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
    // Provide more detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('KV API error details:', {
      message: errorMessage,
      key: req.body?.key,
      method: req.method,
      hasToken: !!req.headers['x-admin-token']
    })
    
    // Check if it's a KV-specific configuration error from @vercel/kv
    // Common errors include missing environment variables or connection issues
    const isKVConfigError = error instanceof Error && (
      errorMessage.toLowerCase().includes('kv_rest_api_url') ||
      errorMessage.toLowerCase().includes('kv_rest_api_token') ||
      errorMessage.toLowerCase().includes('vercel kv') ||
      errorMessage.toLowerCase().includes('missing credentials')
    )
    
    if (isKVConfigError) {
      return res.status(503).json({ 
        error: 'Service unavailable',
        message: 'KV storage configuration error. Please check environment variables.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      })
    }
    
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}
