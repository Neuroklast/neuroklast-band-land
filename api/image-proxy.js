import { kv } from '@vercel/kv'

/**
 * Server-side image proxy that fetches remote images, caches them in Vercel KV,
 * and returns the binary data. Handles Google Drive URLs and other CORS-restricted
 * sources. The KV cache survives deployments.
 *
 * GET /api/image-proxy?url=<encoded-url>
 */

const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4 MB
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

function toDirectUrl(url) {
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)
  if (driveFile) return `https://drive.google.com/uc?export=view&id=${driveFile[1]}`
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&#]+)/)
  if (driveOpen) return `https://drive.google.com/uc?export=view&id=${driveOpen[1]}`
  return url
}

function cacheKey(url) {
  return `img-cache:${url}`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query
  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' })
  }

  // Only allow http(s) URLs
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  const directUrl = toDirectUrl(url)
  const key = cacheKey(directUrl)

  try {
    // Check KV cache first
    const cached = await kv.get(key)
    if (cached && cached.data && cached.contentType) {
      const buf = Buffer.from(cached.data, 'base64')
      res.setHeader('Content-Type', cached.contentType)
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000')
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(200).send(buf)
    }
  } catch (e) {
    console.warn('KV cache read failed:', e)
  }

  try {
    const response = await fetch(directUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NeuroklastImageProxy/1.0)' },
      redirect: 'follow',
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream returned ${response.status}` })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({ error: 'URL does not point to an image' })
    }

    const arrayBuf = await response.arrayBuffer()
    if (arrayBuf.byteLength > MAX_IMAGE_SIZE) {
      // Serve but don't cache very large images
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=86400')
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(200).send(Buffer.from(arrayBuf))
    }

    const base64 = Buffer.from(arrayBuf).toString('base64')

    // Cache in KV (fire-and-forget)
    kv.set(key, { data: base64, contentType }, { ex: CACHE_TTL_SECONDS }).catch((e) => {
      console.warn('KV cache write failed:', e)
    })

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=2592000')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).send(Buffer.from(arrayBuf))
  } catch (error) {
    console.error('Image proxy error:', error)
    return res.status(502).json({ error: 'Failed to fetch image' })
  }
}
