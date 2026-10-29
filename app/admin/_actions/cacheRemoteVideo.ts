'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { uploadBufferToR2 } from '@/app/admin/_actions/r2Upload'
import { MEDIA_BUCKET } from '@/lib/constants'
import { contentObjectKey } from '@/lib/r2-object-key'
import {
  assertRemoteVideoSize,
  extensionFromVideoContentType,
  isAllowedVideoContentType,
  resolveRemoteVideoUrl,
} from '@/lib/remote-video-url'
import { downloadRemoteMediaBuffer } from '@/lib/remote-media-download'

export interface CacheRemoteVideoResult {
  ok: boolean
  storagePath?: string
  publicUrl?: string
  source?: 'direct' | 'google_drive'
  error?: string
}

export async function cacheRemoteVideoToR2(
  sourceUrl: string,
  options?: { prefix?: string },
): Promise<CacheRemoteVideoResult> {
  const result = await runAdminAction(async () => {
    const resolved = resolveRemoteVideoUrl(sourceUrl)
    if (!resolved) {
      return { ok: false as const, error: 'Invalid or unsupported video URL' }
    }

    try {
      const { buffer, contentType } = await downloadRemoteMediaBuffer({
        kind: 'video',
        url: resolved.url,
        timeoutMs: 60_000,
        isAllowedContentType: isAllowedVideoContentType,
        assertSize: assertRemoteVideoSize,
      })

      const ext = extensionFromVideoContentType(contentType)
      const prefix = options?.prefix ?? 'imports/videos'
      const objectPath = await contentObjectKey({
        prefix,
        data: buffer,
        extension: ext,
      })

      const { publicUrl, objectPath: storedPath } = await uploadBufferToR2(
        MEDIA_BUCKET,
        objectPath,
        buffer,
        contentType?.split(';')[0].trim() ?? 'video/mp4',
      )

      return {
        ok: true as const,
        storagePath: storedPath,
        publicUrl,
        source: resolved.source,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { ok: false as const, error: 'Video download timed out' }
      }
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : 'Failed to cache remote video',
      }
    }
  }, 'Unable to cache remote video.')

  if ('error' in result && !('ok' in result)) {
    return { ok: false, error: result.error }
  }
  return result
}