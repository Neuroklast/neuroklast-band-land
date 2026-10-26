'use client'

import { contentObjectKey } from '@/lib/r2-object-key'
import { SCRUB_VIDEO_MAX_BYTES } from '@/lib/background-video-encoding-config'

/** Shared upload for original product videos and encoded background MP4s. */
export async function uploadVideoFileToR2(
  file: File,
  storagePrefix: string,
  onProgress?: (percent: number) => void,
): Promise<{ objectPath: string; publicUrl: string }> {
  if (file.size <= 0 || file.size > SCRUB_VIDEO_MAX_BYTES) {
    throw new Error('Video must be between 1 byte and 50 MB.')
  }
  const { createSignedUploadUrl } = await import('@/app/admin/_actions/r2Upload')
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
  const prefix = storagePrefix.replace(/[^a-z0-9/_-]/gi, '').replace(/^\/+|\/+$/g, '') || 'uploads/videos'
  const objectKey = await contentObjectKey({
    prefix,
    data: await file.arrayBuffer(),
    extension,
  })
  const { url, objectPath, publicUrl } = await createSignedUploadUrl(objectKey)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round(event.loaded / event.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('Upload failed (HTTP ' + xhr.status + ').'))
    }
    xhr.onerror = () => reject(new Error('Upload failed.'))
    xhr.send(file)
  })
  return { objectPath, publicUrl }
}
