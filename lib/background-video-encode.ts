'use client'

import {
  buildScrubEncodingArgs,
  SCRUB_VIDEO_MAX_BYTES,
  type BackgroundVideoVariant,
} from '@/lib/background-video-encoding-config'

export type EncodeVideoProgress = (message: string, percentage?: number) => void

interface FFmpegInstance {
  on: (event: 'progress', callback: (event: { progress: number }) => void) => void
  load: (options: {
    coreURL: string
    wasmURL: string
    workerLoadURL: string
  }) => Promise<boolean>
  writeFile: (path: string, data: Uint8Array) => Promise<boolean>
  exec: (arguments_: string[]) => Promise<number>
  readFile: (path: string) => Promise<string | Uint8Array>
  terminate: () => void
}
type FFmpegConstructor = new () => FFmpegInstance

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: FFmpegConstructor }
  }
}

let wrapperPromise: Promise<FFmpegConstructor> | null = null

function loadBrowserFFmpeg(): Promise<FFmpegConstructor> {
  if (window.FFmpegWASM?.FFmpeg) return Promise.resolve(window.FFmpegWASM.FFmpeg)
  if (wrapperPromise) return wrapperPromise

  wrapperPromise = new Promise<FFmpegConstructor>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/api/admin/ffmpeg/ffmpeg.js'
    script.async = true
    script.onload = () => {
      const ffmpeg = window.FFmpegWASM?.FFmpeg
      if (ffmpeg) resolve(ffmpeg)
      else reject(new Error('FFmpeg browser wrapper failed to initialize.'))
    }
    script.onerror = () => reject(new Error('FFmpeg browser wrapper could not be loaded.'))
    document.head.appendChild(script)
  }).catch((error: unknown) => {
    wrapperPromise = null
    throw error
  })
  return wrapperPromise
}

/**
 * Encode on the admin's machine, not inside a short-lived Vercel function.
 * The single-threaded FFmpeg core is copied to the same origin during
 * predev/prebuild in a non-public directory and served by an authenticated\n * same-origin admin API. Do not use a CDN script or weaken the public CSP.
 */
export async function encodeBackgroundVideo(
  input: File,
  variant: BackgroundVideoVariant,
  onProgress?: EncodeVideoProgress,
): Promise<File> {
  if (input.size === 0 || input.size > SCRUB_VIDEO_MAX_BYTES) {
    throw new Error('Video must be between 1 byte and 50 MB.')
  }

  onProgress?.('Loading video encoder…')
  const FFmpeg = await loadBrowserFFmpeg()
  const ffmpeg = new FFmpeg()
  const suffix = input.name.split('.').pop()?.toLowerCase()
  const inputName = 'input.' + (suffix === 'mov' || suffix === 'webm' ? suffix : 'mp4')
  const outputName = 'background.scrub.mp4'

  try {
    ffmpeg.on('progress', ({ progress }) => {
      if (Number.isFinite(progress)) {
        onProgress?.('Optimizing video for scrolling…', Math.max(0, Math.min(99, Math.round(progress * 100))))
      }
    })
    await ffmpeg.load({
      coreURL: '/api/admin/ffmpeg/ffmpeg-core.js',
      wasmURL: '/api/admin/ffmpeg/ffmpeg-core.wasm',
      workerLoadURL: '/api/admin/ffmpeg/814.ffmpeg.js',
    })
    onProgress?.('Optimizing video for scrolling…', 0)
    await ffmpeg.writeFile(inputName, new Uint8Array(await input.arrayBuffer()))
    const exitCode = await ffmpeg.exec(buildScrubEncodingArgs(inputName, outputName, variant))
    if (exitCode !== 0) {
      throw new Error('FFmpeg could not encode this video (code ' + exitCode + ').')
    }
    const bytes = await ffmpeg.readFile(outputName)
    if (typeof bytes === 'string' || bytes.byteLength === 0) {
      throw new Error('FFmpeg did not produce a valid MP4 file.')
    }
    if (bytes.byteLength > SCRUB_VIDEO_MAX_BYTES) {
      throw new Error('Optimized video exceeds 50 MB. Choose a shorter video.')
    }
    onProgress?.('Video optimized', 100)
    return new File([new Uint8Array(bytes)], outputName, { type: 'video/mp4' })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Background video optimization failed: ' + error.message)
    }
    throw new Error('Background video optimization failed.')
  } finally {
    // Per-upload process: release potentially hundreds of MB of WASM memory.
    ffmpeg.terminate()
  }
}
