/**
 * API route that lists image files from a public Google Drive folder.
 *
 * GET /api/drive-folder?folderId=<id>
 *
 * Google Drive exposes a simple JSON feed for public folders which we scrape
 * for image file entries.  Each image is returned as a GalleryImage-compatible
 * object with a proxied URL so that CORS is not an issue and caching works.
 */

import { applyRateLimit } from './_ratelimit.js'
import { driveFolderQuerySchema, validate } from './_schemas.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // Zod validation
  const parsed = validate(driveFolderQuerySchema, req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error })
  const { folderId } = parsed.data

  try {
    // Google Drive public folder listing via the embedlink/list endpoint
    const listUrl = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`
    const response = await fetch(listUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NeuroklastBot/1.0)' },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: `Drive returned ${response.status}` })
    }

    const html = await response.text()

    // Extract file entries from the HTML.  The embedded view contains
    // data attributes or script blocks with file IDs.  We look for the
    // pattern used by Google to list file IDs and names.
    // NOTE: This is a scraping approach and may break if Google changes
    // their embedded folder view HTML structure.
    const images = []

    // Match file IDs from the embedded view HTML — Google embeds them as
    // data in script tags or anchor attributes.
    const idPattern = /\["([A-Za-z0-9_-]{20,})"(?:,\[|,"([^"]*)")/g
    let match
    while ((match = idPattern.exec(html)) !== null) {
      const fileId = match[1]
      const fileName = match[2] || ''

      // Filter to likely image files by extension (if name available) or include all
      const lowerName = fileName.toLowerCase()
      const isImage = !fileName || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(lowerName)

      if (isImage && !images.find(i => i.id === fileId)) {
        const resizeUrl = `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${fileId}&w=800&q=80`
        images.push({
          id: `drive-${fileId}`,
          url: `/api/image-proxy?url=${encodeURIComponent(resizeUrl)}`,
          caption: fileName.replace(/\.[^.]+$/, '') || `IMG_${images.length}`,
        })
      }
    }

    // Fallback: try matching direct file links
    if (images.length === 0) {
      const linkPattern = /\/file\/d\/([A-Za-z0-9_-]+)/g
      while ((match = linkPattern.exec(html)) !== null) {
        const fileId = match[1]
        if (!images.find(i => i.id === `drive-${fileId}`)) {
          const resizeUrl = `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${fileId}&w=800&q=80`
          images.push({
            id: `drive-${fileId}`,
            url: `/api/image-proxy?url=${encodeURIComponent(resizeUrl)}`,
            caption: `IMG_${images.length}`,
          })
        }
      }
    }

    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')
    return res.json({ images })
  } catch (error) {
    console.error('Drive folder listing error:', error)
    return res.status(502).json({ error: 'Failed to list Drive folder' })
  }
}
