import { fetchUrlWithResolvedCheck } from '@/lib/ssrf-guard'

type RemoteMediaKind = 'image' | 'video'

interface RemoteMediaDownloadOptions {
  kind: RemoteMediaKind
  url: string
  timeoutMs: number
  isAllowedContentType: (contentType: string | null) => boolean
  assertSize: (byteLength: number) => void
}

export interface RemoteMediaBuffer {
  buffer: Buffer
  contentType: string | null
}

/**
 * Shared SSRF-guarded download path for authenticated image/video imports.
 * The callers still own URL validation, per-type limits, optimization, R2 writes
 * and runAdminAction authorization. Never use this for arbitrary public URLs.
 */
export async function downloadRemoteMediaBuffer({
  kind,
  url,
  timeoutMs,
  isAllowedContentType,
  assertSize,
}: RemoteMediaDownloadOptions): Promise<RemoteMediaBuffer> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchUrlWithResolvedCheck(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: `${kind}/*,application/octet-stream`,
        'User-Agent': 'NeuroklastAdmin/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to download ${kind} (HTTP ${response.status})`)
    }

    const contentType = response.headers.get('content-type')
    if (!isAllowedContentType(contentType)) {
      throw new Error(
        `URL did not return ${kind === 'image' ? 'an image' : 'a video'}. For Google Drive, ensure the file is shared publicly.`,
      )
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    assertSize(buffer.byteLength)
    return { buffer, contentType }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${kind === 'image' ? 'Image' : 'Video'} download timed out`)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
