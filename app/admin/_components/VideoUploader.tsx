'use client'

import { useState, useRef } from 'react'
import { uploadVideoFileToR2 } from '@/lib/video-upload-client'
import { encodeBackgroundVideo } from '@/lib/background-video-encode'
import type { BackgroundVideoVariant } from '@/lib/background-video-encoding-config'
import { describeR2UploadError } from '@/lib/r2-upload-error'
import { REMOTE_VIDEO_MAX_BYTES } from '@/lib/remote-video-url'

const ALLOWED_UPLOAD_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

interface VideoUploaderProps {
  label?: string
  currentUrl?: string | null
  storagePrefix?: string
  onUpload: (storagePath: string, publicUrl?: string) => void
  onError?: (error: string) => void
  accept?: string
  scrubVariant?: BackgroundVideoVariant
  onProcessingStateChange?: (busy: boolean) => void
}

export function VideoUploader({
  label = 'Upload Video',
  currentUrl,
  storagePrefix = 'uploads/videos',
  onUpload,
  onError,
  accept = 'video/mp4,video/webm',
  scrubVariant,
  onProcessingStateChange,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [phase, setPhase] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > REMOTE_VIDEO_MAX_BYTES) {
      const msg = `File too large (max ${REMOTE_VIDEO_MAX_BYTES / (1024 * 1024)} MB)`
      onError?.(msg)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    if (!ALLOWED_UPLOAD_MIME.has(file.type)) {
      onError?.('Unsupported file type. Use MP4, MOV or WebM.')
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    onProcessingStateChange?.(true)
    setProgress(0)
    try {
      const optimized = scrubVariant
        ? await encodeBackgroundVideo(file, scrubVariant, (message, percent) => {
            setPhase(message)
            setProgress(percent ?? null)
          })
        : file
      setPhase('Uploading to storage…')
      setProgress(0)
      const { objectPath, publicUrl } = await uploadVideoFileToR2(optimized, storagePrefix, setProgress)

      if (publicUrl) setPreview(publicUrl)
      onUpload(objectPath, publicUrl)
    } catch (err) {
      const msg = describeR2UploadError(err, 'Video upload')
      onError?.(msg)
    } finally {
      setUploading(false)
      onProcessingStateChange?.(false)
      setPhase(null)
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {preview && (
        <video
          src={preview}
          className="w-full max-w-xs rounded border border-zinc-700"
          controls
          muted
          preload="metadata"
        />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="px-3 py-1.5 text-sm rounded bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
      >
        {uploading ? (phase || 'Uploading…') + (progress != null ? ' ' + progress + '%' : '') : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={scrubVariant ? 'video/mp4,video/webm,video/quicktime,.mov' : accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}