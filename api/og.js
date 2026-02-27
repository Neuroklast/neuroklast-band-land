import { kv } from '@vercel/kv'
import { applyRateLimit } from './_ratelimit.js'

/**
 * Open Graph meta-tag endpoint for social-media link previews.
 *
 * When a user shares a link like /share/news/{id}, /share/gig/{id} or
 * /share/release/{id}, Vercel rewrites the request to this handler.
 * It reads the band-data from KV, extracts the relevant content item,
 * and returns a small HTML page with the correct og:title, og:description,
 * og:image (and Twitter card) meta tags.  A client-side redirect sends
 * real browsers to the SPA with the matching hash fragment.
 */

const FALLBACK_TITLE = 'NEUROKLAST'
const FALLBACK_DESCRIPTION = 'NEUROKLAST – Hard Techno, Industrial, DNB & Dark Electro.'
const FALLBACK_IMAGE = '/og-image.png'

/** Derive the site origin from a trusted source, not raw Host header. */
function getOrigin() {
  return process.env.SITE_URL || 'https://neuroklast.com'
}

/** Simple HTML entity escaping to prevent XSS in injected strings. */
function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Strip markdown/HTML so we get a plain-text description. */
function plainText(str, maxLen = 200) {
  if (!str) return ''
  const plain = String(str)
    .replace(/[<>]/g, '')
    .replace(/[#*_~`\-[\]()!]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain
}

/** Format an ISO date string for display. */
function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Look up the content item and return { title, description, image, hash }.
 * `hash` is the SPA fragment the browser should navigate to.
 */
function resolveContent(data, type, id) {
  if (!data || !type || !id) return null

  if (type === 'news') {
    const items = data.news || []
    const item = items.find(n => n.id === id)
    if (!item) return null
    return {
      title: plainText(item.text, 70) || FALLBACK_TITLE,
      description: plainText(item.details || item.text),
      image: item.photo || data.logoUrl || FALLBACK_IMAGE,
      hash: `#news/${id}`,
    }
  }

  if (type === 'gig') {
    const items = data.gigs || []
    const item = items.find(g => g.id === id)
    if (!item) return null
    const dateStr = fmtDate(item.date)
    return {
      title: `${data.name || FALLBACK_TITLE} @ ${item.venue}`,
      description: `${dateStr} – ${item.venue}, ${item.location}`,
      image: item.photo || data.logoUrl || FALLBACK_IMAGE,
      hash: `#gigs/${id}`,
    }
  }

  if (type === 'release') {
    const items = data.releases || []
    const item = items.find(r => r.id === id)
    if (!item) return null
    const typeLabel = item.type ? ` (${item.type.toUpperCase()})` : ''
    return {
      title: `${item.title}${typeLabel} – ${data.name || FALLBACK_TITLE}`,
      description: plainText(item.description) || `${item.title} by ${data.name || FALLBACK_TITLE}`,
      image: item.artwork || data.logoUrl || FALLBACK_IMAGE,
      hash: `#releases/${id}`,
    }
  }

  return null
}

/** Build a minimal HTML page with OG tags and a meta-refresh redirect. */
function buildHTML(origin, meta) {
  const title = esc(meta.title)
  const description = esc(meta.description)
  // Resolve image to absolute URL if it starts with /
  const image = meta.image.startsWith('/') ? `${origin}${meta.image}` : meta.image
  const canonical = `${origin}/${esc(meta.hash)}`
  const redirect = `${origin}/${meta.hash}`

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<meta name="description" content="${description}"/>
<meta property="og:title" content="${title}"/>
<meta property="og:description" content="${description}"/>
<meta property="og:image" content="${esc(image)}"/>
<meta property="og:url" content="${canonical}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="NEUROKLAST"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${title}"/>
<meta name="twitter:description" content="${description}"/>
<meta name="twitter:image" content="${esc(image)}"/>
<meta http-equiv="refresh" content="0;url=${esc(redirect)}"/>
</head>
<body></body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  // Rate limiting — generous limit since crawlers must not be blocked
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  const { type, id } = req.query || {}
  const origin = getOrigin()

  if (!type || !id) {
    res.setHeader('Location', origin)
    return res.status(302).end()
  }

  // Validate type parameter against a whitelist
  const ALLOWED_TYPES = ['news', 'gig', 'release']
  if (!ALLOWED_TYPES.includes(type)) {
    res.setHeader('Location', origin)
    return res.status(302).end()
  }

  // Validate id: only allow safe characters (alphanumeric, dash, underscore)
  if (!/^[\w-]+$/.test(id)) {
    res.setHeader('Location', origin)
    return res.status(302).end()
  }

  let data = null
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      data = await kv.get('band-data')
    }
  } catch {
    // KV unavailable — fall through to fallback
  }

  const meta = resolveContent(data, type, id)

  if (!meta) {
    const fallback = {
      title: FALLBACK_TITLE,
      description: FALLBACK_DESCRIPTION,
      image: FALLBACK_IMAGE,
      hash: type === 'news' ? '#news' : type === 'gig' ? '#gigs' : '#releases',
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    return res.status(200).send(buildHTML(origin, fallback))
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  return res.status(200).send(buildHTML(origin, meta))
}
