/**
 * API route that proxies file downloads from Google Drive.
 *
 * GET /api/drive-download?fileId=<id>
 *
 * Fetches the file from Google Drive server-side and streams it back to the
 * client.  This avoids 307 redirects (which break fetch-based progress
 * tracking) and keeps CORS simple because the browser only talks to our own
 * origin.
 *
 * Works for all publicly shared files without any API key.
 */

import { Readable } from 'node:stream'
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

  // Fetch the file from Google Drive, following any redirects automatically.
  // Note: fileId is validated via regex in _schemas.js to only allow [A-Za-z0-9_-]+
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`

  let driveRes
  try {
    driveRes = await fetch(downloadUrl, { redirect: 'follow' })
  } catch (err) {
    console.error('Failed to fetch from Google Drive:', err)
    return res.status(502).json({ error: 'Failed to fetch file from Google Drive' })
  }

  if (!driveRes.ok) {
    return res.status(502).json({ error: `Google Drive returned ${driveRes.status}` })
  }

  // Forward relevant headers so the client can track progress and trigger a
  // proper file-save dialog.
  const contentType = driveRes.headers.get('content-type')
  const contentLength = driveRes.headers.get('content-length')
  const contentDisposition = driveRes.headers.get('content-disposition')

  if (contentType) res.setHeader('Content-Type', contentType)
  if (contentLength) res.setHeader('Content-Length', contentLength)
  if (contentDisposition) {
    res.setHeader('Content-Disposition', contentDisposition)
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`)
  }

  // Stream the body to the client.
  if (driveRes.body) {
    const nodeStream = Readable.fromWeb(driveRes.body)
    nodeStream.pipe(res)
  } else {
    // Fallback: buffer the entire response (unlikely path).
    const buffer = Buffer.from(await driveRes.arrayBuffer())
    res.end(buffer)
  }
}
