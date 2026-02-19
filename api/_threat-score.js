import { kv } from '@vercel/kv'
import { getClientIp, hashIp } from './_ratelimit.js'

const THREAT_SCORE_PREFIX = 'nk-threat:'
const THREAT_SCORE_TTL = 3600 // 1 hour
const BLOCK_PREFIX = 'nk-blocked:'
const BLOCK_TTL = 604800 // 7 days

export const THREAT_LEVELS = {
  CLEAN: 0,
  WARN: 3,
  TARPIT: 7,
  BLOCK: 12,
}

export const THREAT_REASONS = {
  ROBOTS_VIOLATION: { reason: 'robots_violation', points: 3 },
  HONEYTOKEN_ACCESS: { reason: 'honeytoken_access', points: 5 },
  SUSPICIOUS_UA: { reason: 'suspicious_ua', points: 4 },
  MISSING_BROWSER_HEADERS: { reason: 'missing_browser_headers', points: 2 },
  GENERIC_ACCEPT: { reason: 'generic_accept', points: 1 },
  RATE_LIMIT_EXCEEDED: { reason: 'rate_limit_exceeded', points: 2 },
}

export function classifyThreatLevel(score) {
  if (score >= THREAT_LEVELS.BLOCK) return 'BLOCK'
  if (score >= THREAT_LEVELS.TARPIT) return 'TARPIT'
  if (score >= THREAT_LEVELS.WARN) return 'WARN'
  return 'CLEAN'
}

export async function incrementThreatScore(hashedIp, reason, points) {
  try {
    const key = `${THREAT_SCORE_PREFIX}${hashedIp}`
    const score = await kv.incrby(key, points)
    await kv.expire(key, THREAT_SCORE_TTL)
    const level = classifyThreatLevel(score)

    // Auto-escalate to hard block if threshold exceeded
    if (level === 'BLOCK') {
      await kv.set(`${BLOCK_PREFIX}${hashedIp}`, {
        reason,
        score,
        blockedAt: new Date().toISOString(),
        autoBlocked: true,
      }, { ex: BLOCK_TTL })
      console.error('[AUTO BLOCK]', JSON.stringify({ hashedIp, reason, score }))
    }

    return { score, level, reason }
  } catch {
    return { score: 0, level: 'CLEAN', reason }
  }
}

export async function getThreatScore(hashedIp) {
  try {
    const score = await kv.get(`${THREAT_SCORE_PREFIX}${hashedIp}`) || 0
    return { score: Number(score), level: classifyThreatLevel(Number(score)) }
  } catch {
    return { score: 0, level: 'CLEAN' }
  }
}

export async function getThreatScoreFromReq(req) {
  const ip = getClientIp(req)
  const hashedIp = hashIp(ip)
  return getThreatScore(hashedIp)
}

export async function incrementThreatScoreFromReq(req, threatReason) {
  const ip = getClientIp(req)
  const hashedIp = hashIp(ip)
  return incrementThreatScore(hashedIp, threatReason.reason, threatReason.points)
}
