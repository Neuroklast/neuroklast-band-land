/**
 * Video Exporter Utility
 * 
 * Captures DOM elements with animations and exports them as video files.
 * Uses MediaRecorder API for browser-based video recording.
 */

export interface VideoExportOptions {
  /** Target element to record */
  element: HTMLElement
  /** Duration in milliseconds */
  duration: number
  /** Video width in pixels */
  width?: number
  /** Video height in pixels */
  height?: number
  /** Frames per second (default: 30) */
  fps?: number
  /** Video format mime type */
  mimeType?: string
  /** Filename for the exported video */
  filename?: string
}

export interface VideoExportProgress {
  /** Current recording time in milliseconds */
  currentTime: number
  /** Total duration in milliseconds */
  totalDuration: number
  /** Progress percentage (0-100) */
  progress: number
  /** Recording status */
  status: 'preparing' | 'recording' | 'processing' | 'complete' | 'error'
  /** Error message if status is 'error' */
  error?: string
}

/**
 * Captures a DOM element with animations and exports as video
 */
export class VideoExporter {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: Blob[] = []
  private startTime: number = 0
  private progressCallback?: (progress: VideoExportProgress) => void
  private animationFrame: number | null = null

  /**
   * Export a DOM element as video
   */
  async export(
    options: VideoExportOptions,
    onProgress?: (progress: VideoExportProgress) => void
  ): Promise<Blob> {
    this.progressCallback = onProgress

    try {
      // Report preparing status
      this.reportProgress({
        currentTime: 0,
        totalDuration: options.duration,
        progress: 0,
        status: 'preparing'
      })

      // Get the element and prepare for recording
      const element = options.element
      const width = options.width || element.offsetWidth
      const height = options.height || element.offsetHeight

      // Create a canvas to capture the element
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!

      // Get stream from canvas
      const fps = options.fps || 30
      this.stream = canvas.captureStream(fps)

      // Determine supported mime type
      const mimeType = this.getSupportedMimeType(options.mimeType)
      
      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps for good quality
      })

      this.chunks = []

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data)
        }
      }

      // Start recording
      this.mediaRecorder.start(100) // Collect data every 100ms
      this.startTime = Date.now()

      // Report recording status
      this.reportProgress({
        currentTime: 0,
        totalDuration: options.duration,
        progress: 0,
        status: 'recording'
      })

      // Start capturing frames
      await this.captureFrames(element, canvas, ctx, options.duration, fps)

      // Stop recording and process
      return await this.finalizeRecording(options.duration)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.reportProgress({
        currentTime: 0,
        totalDuration: options.duration,
        progress: 0,
        status: 'error',
        error: errorMessage
      })
      throw error
    }
  }

  /**
   * Capture frames from the element to the canvas
   */
  private async captureFrames(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    duration: number,
    fps: number
  ): Promise<void> {
    const frameInterval = 1000 / fps
    let lastFrameTime = 0

    return new Promise((resolve) => {
      const captureFrame = (timestamp: number) => {
        const elapsed = timestamp - this.startTime

        // Check if we should capture this frame
        if (timestamp - lastFrameTime >= frameInterval) {
          // Use html2canvas-like approach: draw DOM to canvas
          // Note: This is a simplified version. For production, you might want to use html2canvas library
          this.drawElementToCanvas(element, canvas, ctx)
          
          lastFrameTime = timestamp

          // Report progress
          this.reportProgress({
            currentTime: elapsed,
            totalDuration: duration,
            progress: Math.min((elapsed / duration) * 100, 100),
            status: 'recording'
          })
        }

        // Continue or finish
        if (elapsed < duration) {
          this.animationFrame = requestAnimationFrame(captureFrame)
        } else {
          resolve()
        }
      }

      this.animationFrame = requestAnimationFrame(captureFrame)
    })
  }

  /**
   * Draw element to canvas (simplified implementation)
   * Note: For better results, use html2canvas or similar library
   */
  private drawElementToCanvas(
    element: HTMLElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ): void {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get computed styles
    const bgColor = window.getComputedStyle(element).backgroundColor
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // For canvas elements (like AudioVisualizer), copy directly
    const canvasElements = element.querySelectorAll('canvas')
    canvasElements.forEach((sourceCanvas) => {
      const rect = sourceCanvas.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const x = rect.left - elementRect.left
      const y = rect.top - elementRect.top
      
      try {
        ctx.drawImage(sourceCanvas, x, y, rect.width, rect.height)
      } catch (e) {
        // Handle CORS issues silently
        console.warn('Could not draw canvas element:', e)
      }
    })

    // Note: For complete DOM rendering, integrate html2canvas here
    // This is a minimal implementation for demonstration
  }

  /**
   * Finalize recording and return the video blob
   */
  private async finalizeRecording(duration: number): Promise<Blob> {
    this.reportProgress({
      currentTime: duration,
      totalDuration: duration,
      progress: 100,
      status: 'processing'
    })

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mediaRecorder!.mimeType })
        
        this.reportProgress({
          currentTime: duration,
          totalDuration: duration,
          progress: 100,
          status: 'complete'
        })

        this.cleanup()
        resolve(blob)
      }

      this.mediaRecorder.onerror = (event) => {
        this.cleanup()
        reject(new Error(`MediaRecorder error: ${event}`))
      }

      this.mediaRecorder.stop()
      
      // Stop all tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
      }
    })
  }

  /**
   * Download the video blob as a file
   */
  static download(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `animation-export-${new Date().toISOString().split('T')[0]}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Get supported mime type
   */
  private getSupportedMimeType(preferred?: string): string {
    const types = [
      preferred,
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ].filter(Boolean) as string[]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    throw new Error('No supported video mime type found')
  }

  /**
   * Report progress to callback
   */
  private reportProgress(progress: VideoExportProgress): void {
    this.progressCallback?.(progress)
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.mediaRecorder = null
    this.stream = null
    this.chunks = []
  }

  /**
   * Cancel ongoing export
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
  }
}

/**
 * Quick export helper function
 */
export async function exportElementAsVideo(
  element: HTMLElement,
  duration: number = 5000,
  options?: Partial<VideoExportOptions>
): Promise<Blob> {
  const exporter = new VideoExporter()
  
  return exporter.export({
    element,
    duration,
    ...options
  })
}
