/**
 * API route that proxies file downloads from Google Drive.
 *
 * GET /api/drive-download?fileId=<id>
 *
 * Streams the file content directly to the client so the browser does not
 * need to open a new Google Drive tab.  Returns proper Content-Disposition
 * headers to trigger a browser download.
 */

import { applyRateLimit } from './_ratelimit.js'
import { driveDownloadQuerySchema, validate } from './_schemas.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting (GDPR-compliant, IP is hashed)
  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  // Zod validation
  const parsed = validate(driveDownloadQuerySchema, req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error })
  const { fileId } = parsed.data

  try {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Drive API key is not configured' })
    }

    // Get file metadata first (name, mimeType)
    const metaParams = new URLSearchParams({
      fields: 'name, mimeType, size',
      key: apiKey,
      supportsAllDrives: 'true',
    })
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?${metaParams}`
    )

    if (!metaRes.ok) {
      return res.status(502).json({ error: `Drive API returned ${metaRes.status}` })
    }

    const meta = await metaRes.json()

    // For large files (>10MB), redirect directly to Google Drive to save Vercel bandwidth
    const fileSizeBytes = parseInt(meta.size || '0', 10)
    const MAX_PROXY_SIZE = 10 * 1024 * 1024 // 10 MB
    
    if (fileSizeBytes > MAX_PROXY_SIZE) {
      // Redirect to Google Drive public download URL (no OAuth required)
      const redirectUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
      return res.redirect(307, redirectUrl)
    }

    // Download file content using public download URL (no OAuth required)
    const dlRes = await fetch(
      `https://drive.google.com/uc?export=download&id=${fileId}`,
      { redirect: 'follow' }
    )

    if (!dlRes.ok) {
      return res.status(502).json({ error: `Drive download returned ${dlRes.status}` })
    }

    const fileName = meta.name || 'download'
    const contentType = meta.mimeType || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    if (meta.size) {
      res.setHeader('Content-Length', meta.size)
    }
    res.setHeader('Cache-Control', 'private, max-age=300')

    // Stream the response body
    const buffer = Buffer.from(await dlRes.arrayBuffer())
    return res.send(buffer)
  } catch (error) {
    console.error('Drive download error:', error)
    return res.status(502).json({ error: 'Failed to download file from Drive' })
  }
}
