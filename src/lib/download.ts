const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/x-tar': '.tar',
  'application/gzip': '.gz',
  'application/json': '.json',
  'application/xml': '.xml',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/octet-stream': '',
  'text/plain': '.txt',
  'text/html': '.html',
  'text/css': '.css',
  'text/csv': '.csv',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/flac': '.flac',
  'audio/aac': '.aac',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/ogg': '.ogv',
  'video/quicktime': '.mov',
}

/**
 * Returns a file extension (e.g. ".pdf") for the given MIME type, or "" if unknown.
 */
export function extensionFromMime(mime: string): string {
  const base = mime.split(';')[0].trim().toLowerCase()
  return MIME_TO_EXT[base] ?? ''
}

const EXT_REGEX = /\.[a-zA-Z0-9]{1,10}$/

/**
 * Returns true if the filename already contains a recognized file extension.
 */
export function hasFileExtension(fileName: string): boolean {
  return EXT_REGEX.test(fileName)
}

/**
 * Ensures the filename has a proper file extension.
 * If it already has one, return as-is. Otherwise try to derive one from the
 * Content-Disposition header or the Content-Type header.
 */
export function ensureExtension(fileName: string, response: Response): string {
  if (hasFileExtension(fileName)) return fileName

  // Try Content-Disposition first (e.g. `attachment; filename="report.pdf"`)
  const disposition = response.headers.get('Content-Disposition')
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)"?/i)
    if (match) {
      const serverName = decodeURIComponent(match[1].trim())
      const extMatch = serverName.match(EXT_REGEX)
      if (extMatch) return fileName + extMatch[0]
    }
  }

  // Fall back to Content-Type
  const contentType = response.headers.get('Content-Type')
  if (contentType) {
    const ext = extensionFromMime(contentType)
    if (ext) return fileName + ext
  }

  return fileName
}

/**
 * Extracts a Google Drive file ID from various URL formats.
 * Returns null if the URL is not a recognizable Google Drive link.
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null
  try {
    // Format: https://drive.google.com/file/d/{fileId}/...
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)
    if (fileMatch) return fileMatch[1]

    // Format: https://drive.google.com/open?id={fileId}
    const openMatch = url.match(/drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/)
    if (openMatch) return openMatch[1]

    // Format: https://drive.google.com/uc?id={fileId}&export=download
    const ucMatch = url.match(/drive\.google\.com\/uc\?.*id=([A-Za-z0-9_-]+)/)
    if (ucMatch) return ucMatch[1]
  } catch {
    // Ignore parse errors
  }
  return null
}

export interface DownloadProgress {
  state: 'idle' | 'downloading' | 'complete' | 'error'
  progress: number // 0 to 1
  error?: string
}

/**
 * Download a file through the Drive API proxy with progress tracking.
 * Falls back to direct link if it's not a Google Drive URL.
 */
export async function downloadFile(
  url: string,
  fileName: string,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  const fileId = extractDriveFileId(url)

  if (fileId) {
    // Use the proxy API for Google Drive files
    return downloadViaDriveProxy(fileId, fileName, onProgress)
  }

  // For non-Drive URLs, use a fetch-based download with progress
  return downloadDirect(url, fileName, onProgress)
}

async function downloadViaDriveProxy(
  fileId: string,
  fileName: string,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  // The API endpoint proxies the Google Drive file and streams it back so we
  // can track real download progress — no 307 redirects, no CORS issues.
  const downloadUrl = `/api/drive-download?fileId=${encodeURIComponent(fileId)}`
  return downloadDirect(downloadUrl, fileName, onProgress)
}

async function downloadDirect(
  url: string,
  fileName: string,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  onProgress({ state: 'downloading', progress: 0 })

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`)
    }

    const resolvedName = ensureExtension(fileName, response)
    const blob = await trackResponseProgress(response, onProgress)
    triggerBlobDownload(blob, resolvedName)
    onProgress({ state: 'complete', progress: 1 })
  } catch (err) {
    // If fetch-based download fails (e.g. CORS), fall back to window.open
    const message = err instanceof Error ? err.message : 'Download failed'
    onProgress({ state: 'error', progress: 0, error: message })
  }
}

async function trackResponseProgress(
  response: Response,
  onProgress: (progress: DownloadProgress) => void,
): Promise<Blob> {
  const contentLength = response.headers.get('Content-Length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  if (!response.body || !total) {
    // No streaming support or unknown size – just get the whole blob
    const blob = await response.blob()
    onProgress({ state: 'downloading', progress: 0.95 })
    return blob
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    received += value.length
    onProgress({ state: 'downloading', progress: Math.min(received / total, 0.99) })
  }

  return new Blob(chunks)
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
