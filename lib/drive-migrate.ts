import {
  extractGoogleDriveFileId,
  extensionFromContentType,
  googleDriveDirectUrl,
} from '@/lib/remote-image-url'

const DRIVE_FOLDER_RE = /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/
const MAX_BYTES = 50 * 1024 * 1024

export function extractGoogleDriveFolderId(url: string): string | null {
  return url.match(DRIVE_FOLDER_RE)?.[1] ?? null
}

export function isGoogleDriveUrl(value: string): boolean {
  return value.includes('drive.google.com')
}

export function collectStringValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') {
    out.push(value)
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringValues(item, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStringValues(nested, out)
    }
  }
  return out
}

export function collectGoogleDriveFileIds(root: unknown): string[] {
  const ids = new Set<string>()
  for (const value of collectStringValues(root)) {
    if (!isGoogleDriveUrl(value)) continue
    if (extractGoogleDriveFolderId(value)) continue
    const id = extractGoogleDriveFileId(value)
    if (id) ids.add(id)
  }
  return [...ids]
}

export function collectGoogleDriveFolderIds(root: unknown): string[] {
  const ids = new Set<string>()
  for (const value of collectStringValues(root)) {
    const id = extractGoogleDriveFolderId(value)
    if (id) ids.add(id)
  }
  return [...ids]
}

export interface DriveFileBytes {
  fileId: string
  bytes: Buffer
  contentType: string
  extension: string
}

function parseConfirmToken(html: string): { confirm: string; uuid?: string } | null {
  const confirm = html.match(/confirm=([0-9A-Za-z_-]+)/)?.[1]
  if (!confirm) return null
  const uuid = html.match(/name="uuid"\s+value="([^"]+)"/)?.[1]
  return { confirm, uuid }
}

export async function downloadGoogleDriveFile(fileId: string): Promise<DriveFileBytes> {
  const fetchOnce = async (url: string): Promise<Response> => {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'neuroklast-band-land/3.0 (drive-migrate)' },
    })
    if (!res.ok) throw new Error(`Drive download ${fileId} failed: HTTP ${res.status}`)
    return res
  }

  let url = `${googleDriveDirectUrl(fileId)}&confirm=t`
  let res = await fetchOnce(url)
  let contentType = res.headers.get('content-type') ?? 'application/octet-stream'

  if (contentType.includes('text/html')) {
    const html = await res.text()
    const token = parseConfirmToken(html)
    if (!token) throw new Error(`Drive download ${fileId} returned HTML without confirm token`)
    url = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${token.confirm}`
    if (token.uuid) url += `&uuid=${encodeURIComponent(token.uuid)}`
    res = await fetchOnce(url)
    contentType = res.headers.get('content-type') ?? 'application/octet-stream'
    if (contentType.includes('text/html')) {
      throw new Error(`Drive download ${fileId} still HTML after confirm (file may be private)`)
    }
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength === 0) throw new Error(`Drive download ${fileId} is empty`)
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`Drive download ${fileId} exceeds ${MAX_BYTES / (1024 * 1024)} MB`)
  }

  return {
    fileId,
    bytes: buffer,
    contentType: contentType.split(';')[0].trim() || 'application/octet-stream',
    extension: extensionFromContentType(contentType),
  }
}

interface DriveListFile {
  id: string
  name: string
  mimeType: string
}

export async function listGoogleDriveFolderFiles(
  folderId: string,
  apiKey: string,
): Promise<DriveListFile[]> {
  const files: DriveListFile[] = []
  let pageToken: string | undefined

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken,files(id,name,mimeType)',
      key: apiKey,
      pageSize: '100',
    })
    if (pageToken) params.set('pageToken', pageToken)
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`)
    if (!res.ok) {
      throw new Error(`Drive folder list ${folderId} failed: HTTP ${res.status}`)
    }
    const json = (await res.json()) as { files?: DriveListFile[]; nextPageToken?: string }
    files.push(...(json.files ?? []))
    pageToken = json.nextPageToken
  } while (pageToken)

  return files
}

export async function collectDriveFileIdsFromFolders(
  folderIds: string[],
  apiKey: string,
): Promise<string[]> {
  const ids = new Set<string>()
  const queue = [...folderIds]

  while (queue.length > 0) {
    const folderId = queue.pop()
    if (!folderId) break
    const files = await listGoogleDriveFolderFiles(folderId, apiKey)
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        queue.push(file.id)
      } else if (!file.mimeType.startsWith('application/vnd.google-apps.')) {
        ids.add(file.id)
      }
    }
  }

  return [...ids]
}
