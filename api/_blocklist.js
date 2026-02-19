import { kv } from '@vercel/kv'
import { getClientIp, hashIp } from './_ratelimit.js'

export const BLOCK_PREFIX = 'nk-blocked:'
export const BLOCK_INDEX_KEY = 'nk-blocked-index'
export const BLOCK_TTL = 604800 // 7 Tage default

export async function blockIp(hashedIp, reason = 'manual', ttlSeconds = BLOCK_TTL) {
  const entry = { hashedIp, reason, blockedAt: new Date().toISOString(), autoBlocked: false }
  await kv.set(`${BLOCK_PREFIX}${hashedIp}`, entry, { ex: ttlSeconds })
  // Keep an index of all blocked IPs for the admin UI
  await kv.sadd(BLOCK_INDEX_KEY, hashedIp)
  console.error('[HARD BLOCK SET]', JSON.stringify(entry))
}

export async function unblockIp(hashedIp) {
  await kv.del(`${BLOCK_PREFIX}${hashedIp}`)
  await kv.srem(BLOCK_INDEX_KEY, hashedIp)
  console.error('[HARD BLOCK REMOVED]', JSON.stringify({ hashedIp }))
}

export async function isHardBlocked(req) {
  try {
    const ip = getClientIp(req)
    const hashedIp = hashIp(ip)
    const entry = await kv.get(`${BLOCK_PREFIX}${hashedIp}`)
    return !!entry
  } catch {
    return false
  }
}

export async function getAllBlockedIps() {
  try {
    const hashes = await kv.smembers(BLOCK_INDEX_KEY) || []
    const entries = []
    for (const hash of hashes) {
      const entry = await kv.get(`${BLOCK_PREFIX}${hash}`)
      if (entry) {
        entries.push(typeof entry === 'string' ? JSON.parse(entry) : entry)
      } else {
        // Entry expired, clean up index
        await kv.srem(BLOCK_INDEX_KEY, hash)
      }
    }
    return entries
  } catch {
    return []
  }
}
