'use server'

import { runAdminAction } from '@/app/admin/_actions/auth'
import { uploadBufferToR2 } from '@/app/admin/_actions/r2Upload'
import { MEDIA_BUCKET } from '@/lib/constants'
import { contentObjectKey } from '@/lib/r2-object-key'
import { optimizeImageBuffer } from '@/lib/optimize-image'
import {
  assertRemoteImageSize,
  isAllowedImageContentType,
  resolveRemoteImageUrl,
} from '@/lib/remote-image-url'
import { downloadRemoteMediaBuffer } from '@/lib/remote-media-download'

export interface CacheRemoteImageResult {
  ok: boolean
  storagePath?: string
  publicUrl?: string
  source?: 'direct' | 'google_drive' | 'upload'
  error?: string
}

export async function cacheRemoteImageToR2(
  sourceUrl: string,
  options?: { prefix?: string },
): Promise<CacheRemoteImageResult> {
  const result = await runAdminAction(async () => {
    const resolved = resolveRemoteImageUrl(sourceUrl)
    if (!resolved) {
      return { ok: false as const, error: 'Invalid or unsupported image URL' }
    }

    try {
      const { buffer, contentType } = await downloadRemoteMediaBuffer({
        kind: 'image',
        url: resolved.url,
        timeoutMs: 20_000,
        isAllowedContentType: isAllowedImageContentType,
        assertSize: assertRemoteImageSize,
      })

      const mimeType = contentType?.split(';')[0].trim() ?? 'image/jpeg'
      const optimized = await optimizeImageBuffer(buffer, mimeType)

      const prefix = options?.prefix ?? 'imports'
      const objectPath = await contentObjectKey({
        prefix,
        data: optimized.buffer,
        extension: optimized.extension,
      })

      const { publicUrl, objectPath: storedPath } = await uploadBufferToR2(
        MEDIA_BUCKET,
        objectPath,
        optimized.buffer,
        optimized.contentType,
      )

      return {
        ok: true as const,
        storagePath: storedPath,
        publicUrl,
        source: resolved.source,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { ok: false as const, error: 'Image download timed out' }
      }
      return {
        ok: false as const,
        error: error instanceof Error ? error.message : 'Failed to cache remote image',
      }
    }
  }, 'Unable to cache remote image.')

  if ('error' in result && !('ok' in result)) {
    return { ok: false, error: result.error }
  }
  return result
}