import { kv } from '@vercel/kv'
import { randomBytes } from 'node:crypto'
import { getClientIp, hashIp } from './_ratelimit.js'

/**
 * Honeytokens — decoy records planted in the database.
 *
 * These keys/values look like real credentials or backup data.  They are
 * never accessed by legitimate application code.  Any read or write to a
 * honeytoken key is treated as an intrusion indicator and triggers a
 * silent alarm (logged + persisted to KV for the admin dashboard).
 *
 * The alarm is *silent* — the API returns a plausible-looking error so the
 * attacker doesn't know they've been detected.
 */

/** Keys that serve as honeytokens.  Must never be used by real code. */
export const HONEYTOKEN_KEYS = [
  'admin_backup',
  'admin-backup-hash',
  'db-credentials',
  'api-master-key',
  'backup-admin-password',
]

/** Check whether a given key is a honeytoken */
export function isHoneytoken(key) {
  if (typeof key !== 'string') return false
  return HONEYTOKEN_KEYS.includes(key.toLowerCase())
}

/**
 * Record a honeytoken access event.
 *
 * Writes a timestamped entry to `nk-honeytoken-alerts` in KV so the admin
 * can review intrusion attempts.  Also logs to stderr for server-side
 * monitoring (e.g. Vercel log drain → SIEM).
 */
export async function triggerHoneytokenAlarm(req, key) {
  const ip = getClientIp(req)
  const hashedIp = hashIp(ip)
  const entry = {
    key,
    method: req.method,
    hashedIp,
    userAgent: (req.headers['user-agent'] || '').slice(0, 200),
    timestamp: new Date().toISOString(),
  }

  // Silent alarm — log to stderr (picked up by Vercel log drains / SIEM)
  console.error('[HONEYTOKEN ALERT]', JSON.stringify(entry))

  // Persist to KV for the admin dashboard (fire-and-forget, capped list)
  try {
    await kv.lpush('nk-honeytoken-alerts', JSON.stringify(entry))
    await kv.ltrim('nk-honeytoken-alerts', 0, 499) // keep last 500 alerts
  } catch {
    // Persistence failure must not block the response
  }

  // Mark this IP as an attacker for entropy injection
  await markAttacker(hashedIp)
}

/** KV prefix and TTL for flagged attacker IPs */
const FLAGGED_PREFIX = 'nk-flagged:'
const FLAGGED_TTL = 86400 // 24 hours

/**
 * Mark an IP hash as a known attacker in KV.
 * Flagged IPs receive entropy-injected responses to confuse scanners.
 */
export async function markAttacker(hashedIp) {
  try {
    await kv.set(`${FLAGGED_PREFIX}${hashedIp}`, true, { ex: FLAGGED_TTL })
  } catch {
    // Marking failure must not block the response
  }
}

/**
 * Check whether the request originates from an IP previously flagged as an attacker.
 */
export async function isMarkedAttacker(req) {
  try {
    const ip = getClientIp(req)
    const hashedIp = hashIp(ip)
    const flagged = await kv.get(`${FLAGGED_PREFIX}${hashedIp}`)
    return !!flagged
  } catch {
    return false
  }
}

/**
 * Entropy Injection counter-measure against automated scanners.
 *
 * Injects a large number of random custom headers into the response to
 * confuse automated scanners and fuzzing tools that rely on clean,
 * predictable HTTP headers.  Each header contains cryptographically
 * random hex data so the output cannot be predicted or filtered easily.
 */
export function injectEntropyHeaders(res, count = 200) {
  for (let i = 0; i < count; i++) {
    const idx = String(i).padStart(3, '0')
    res.setHeader(`X-Neural-Noise-${idx}`, randomBytes(16).toString('hex'))
  }
}

/**
 * Seed honeytoken records into KV.
 *
 * Called once at deploy / startup.  The values look like real hashes so an
 * attacker who dumps the DB won't immediately recognize them as decoys.
 */
export async function seedHoneytokens() {
  const decoyValues = {
    'admin_backup': 'b2a4f8e1c3d5a7b9e0f2c4d6a8b0e1f3c5d7a9b1e3f5c7d9a1b3e5f7c9d1a3',
    'admin-backup-hash': '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    'db-credentials': '{"host":"internal-db.prod","user":"root","pass":"s3cret-fake"}',
    'api-master-key': 'sk_live_fake_4eC39HqLyjWDarjtT1zdp7dc',
    'backup-admin-password': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  }

  for (const [key, value] of Object.entries(decoyValues)) {
    try {
      // Only seed if the key doesn't already exist (don't overwrite on every call)
      const existing = await kv.get(key)
      if (existing == null) {
        await kv.set(key, value)
      }
    } catch {
      // Seeding failure is non-critical
    }
  }
}
