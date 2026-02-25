import { kv } from '@vercel/kv'
import { randomBytes } from 'node:crypto'
import { getClientIp, hashIp } from './_ratelimit.js'
import { markAttacker, injectEntropyHeaders, setDefenseHeaders } from './_honeytokens.js'
import { incrementThreatScore, THREAT_REASONS } from './_threat-score.js'
import { isHardBlocked } from './_blocklist.js'
import { serveZipBomb } from './_zipbomb.js'
import { recordIncident } from './_attacker-profile.js'
import { detectSqlInjection, handleSqlInjectionBackfire } from './_sql-backfire.js'
import { serveCanaryDocument } from './_canary-documents.js'
import { applyLogPoisoning } from './_log-poisoning.js'

/**
 * Handles requests to paths listed as Disallow in robots.txt.
 *
 * Access to these paths is explicitly prohibited by the published robots.txt.
 * Any client that reaches this handler has intentionally ignored the access
 * control directive.  The handler applies purely defensive measures to
 * protect system availability:
 *
 * 1. Records the violation for security monitoring
 * 2. Flags the source IP for noise injection on subsequent requests
 * 3. Applies a defensive delay to limit scanner throughput
 * 4. Returns a standard error page
 */

const DELAY_MIN_MS = 3000
const DELAY_MAX_MS = 8000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Internal navigation links included in the error page.
 * A crawler following these will issue further requests to restricted paths,
 * each triggering the same defensive response cycle.
 */
const NAV_LINKS = [
  '/admin/login', '/admin/settings', '/admin/users', '/admin/export',
  '/dashboard/', '/dashboard/analytics', '/dashboard/reports',
  '/backup/latest', '/backup/database', '/backup/files',
  '/config/app', '/config/database', '/config/security',
  '/internal/docs', '/internal/api', '/internal/status',
  '/debug/status', '/debug/logs', '/debug/traces',
  '/staging/preview', '/staging/build',
  '/private/data', '/private/keys',
  '/data/export', '/data/users',
  '/logs/access', '/logs/error',
]

function pickLinks(count = 8) {
  const shuffled = [...NAV_LINKS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Generate a standard-looking 403 error page */
function renderErrorPage(path) {
  const ref = randomBytes(4).toString('hex')
  const links = pickLinks()
  const padding = randomBytes(3072).toString('base64')
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>403 Forbidden</title>
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#aaa;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.c{max-width:480px;padding:2rem;border:1px solid #222;text-align:center}
h1{color:#b91c1c;font-size:3rem;margin:0 0 .5rem}
p{margin:.5rem 0;font-size:.9rem}
.ref{font-size:.7rem;color:#444;font-family:monospace}
a{color:#666;text-decoration:none;font-size:.75rem}a:hover{color:#b91c1c}
nav{margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}
</style>
</head>
<body>
<div class="c">
<h1>403</h1>
<p>Access to this resource is restricted.</p>
<p>Authorized personnel must authenticate before proceeding.</p>
<p class="ref">Path: ${escapeHtml(path)} &middot; Ref: ${ref}</p>
<nav>
${links.map(l => `<a href="${l}">${l.slice(1)}</a>`).join('\n')}
</nav>
</div>
<!-- ${padding} -->
</body>
</html>`
}

export default async function handler(req, res) {
  // Check if IP is hard-blocked first
  const blocked = await isHardBlocked(req)
  if (blocked) {
    return res.status(403).json({ error: 'FORBIDDEN' })
  }

  // Under Attack Mode — skip all expensive countermeasures, return minimal 429
  try {
    const secSettings = await kv.get('nk-security-settings').catch(() => null)
    if (secSettings?.underAttackMode) {
      res.setHeader('Connection', 'close')
      return res.status(429).end()
    }
  } catch { /* under attack check failure must not block the response */ }

  const ip = getClientIp(req)
  const hashedIp = hashIp(ip)
  const path = req.query._src || req.url || '/'
  const ua = (req.headers['user-agent'] || '').slice(0, 200)

  // SQL Injection Backfire — respond with poisoned data if SQL injection detected
  try {
    if (detectSqlInjection(req)) {
      const backfireResult = await handleSqlInjectionBackfire(req, res)
      if (backfireResult) return
    }
  } catch { /* backfire failure must not block the response */ }

  // Canary Documents — serve trackable decoy files from tarpit directories
  try {
    const canaryResult = await serveCanaryDocument(req, res)
    if (canaryResult) return
  } catch { /* canary failure must not block the response */ }

  // Increment threat score
  let threatResult = { score: 0, level: 'CLEAN' }
  try {
    threatResult = await incrementThreatScore(hashedIp, THREAT_REASONS.ROBOTS_VIOLATION.reason, THREAT_REASONS.ROBOTS_VIOLATION.points)
  } catch {
    // Threat scoring failure must not block the response
  }

  // Determine which countermeasure to apply based on per-rule settings
  let countermeasure = 'LOGGED'
  let countermeasureResult = null
  let settings = null
  try {
    settings = await kv.get('nk-security-settings').catch(() => null)
  } catch { /* ignore */ }

  // Check zip bomb eligibility for robots violation
  const zipBombApplicable = settings?.zipBombEnabled && settings?.zipBombOnRobotsViolation
  if (zipBombApplicable) {
    countermeasure = 'ZIP_BOMB'
  } else if (threatResult.level === 'BLOCK') {
    countermeasure = 'BLOCKED'
  } else if (threatResult.level === 'TARPIT' || (settings?.tarpitOnRobotsViolation !== false)) {
    countermeasure = 'TARPITTED'
  }

  // Record the access violation — includes countermeasure info for tracking
  const entry = {
    key: `robots:${path}`,
    method: req.method,
    hashedIp,
    userAgent: ua,
    timestamp: new Date().toISOString(),
    threatScore: threatResult.score,
    threatLevel: threatResult.level,
    countermeasure,
  }

  console.error('[ACCESS VIOLATION]', JSON.stringify(entry))

  // Persist alongside other security alerts for unified monitoring
  try {
    await kv.lpush('nk-honeytoken-alerts', JSON.stringify(entry))
    await kv.ltrim('nk-honeytoken-alerts', 0, 499)
  } catch {
    // Persistence failure must not block the response
  }

  // Flag this IP — subsequent requests to any endpoint will receive noise
  await markAttacker(hashedIp)

  // Record incident in attacker profile
  try {
    await recordIncident(hashedIp, {
      type: 'robots_violation',
      key: path,
      method: req.method,
      userAgent: ua,
      threatScore: threatResult.score,
      threatLevel: threatResult.level,
      countermeasure,
      timestamp: entry.timestamp
    })
  } catch {
    // Profile recording failure must not block the response
  }

  // Defensive delay — limits scanner throughput
  const ms = DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS)
  await sleep(ms)

  // Serve zip bomb if applicable per rule settings
  if (zipBombApplicable) {
    try {
      // Update incident with result
      countermeasureResult = 'ZIP_BOMB_SENT'
      return await serveZipBomb(res)
    } catch {
      // Zip bomb failure must not block the response — fall through to error page
    }
  }

  // Log poisoning — inject misleading data into response headers for flagged attackers
  try {
    await applyLogPoisoning(req, res)
  } catch { /* log poisoning failure must not block the response */ }

  // Noise injection on response headers
  injectEntropyHeaders(res, 50)
  setDefenseHeaders(res)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res.status(403).send(renderErrorPage(path))
}
