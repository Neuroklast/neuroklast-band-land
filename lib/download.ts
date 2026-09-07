export interface DownloadProgress {
  state: 'idle' | 'downloading' | 'complete' | 'error'
  progress: number
  error?: string
}

export async function downloadFile(
  url: string,
  fileName: string,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  onProgress({ state: 'downloading', progress: 0 })
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)
    const blob = await response.blob()
    onProgress({ state: 'downloading', progress: 0.95 })
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
    onProgress({ state: 'complete', progress: 1 })
  } catch (err) {
    onProgress({
      state: 'error',
      progress: 0,
      error: err instanceof Error ? err.message : 'Download failed',
    })
  }
}
