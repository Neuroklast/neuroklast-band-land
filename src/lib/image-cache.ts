const DB_NAME = 'neuroklast-image-cache'
const STORE_NAME = 'images'
const DB_VERSION = 1
const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.8

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getCached(key: string): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function setCached(key: string, value: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // silently fail
  }
}

function compressImage(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  let { width, height } = img

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return img.src
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

/**
 * Transform known provider URLs into wsrv.nl-proxied image URLs.
 * Supports Google Drive share links and lh3 CDN URLs:
 *   - /file/d/{id}/view        → wsrv.nl/?url=lh3.../{id}
 *   - /open?id={id}            → wsrv.nl/?url=lh3.../{id}
 *   - /uc?export=view&id={id}  → wsrv.nl/?url=lh3.../{id}
 *   - lh3.googleusercontent.com/d/{id} → wsrv.nl/?url=lh3.../{id}
 */
export function toDirectImageUrl(url: string): string {
  // Google Drive: /file/d/{fileId}/view  →  wsrv.nl proxy
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)
  if (driveFileMatch) {
    return `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`
  }
  // Google Drive: open?id={fileId}
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&#]+)/)
  if (driveOpenMatch) {
    return `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${driveOpenMatch[1]}`
  }
  // Google Drive: uc?export=view&id={fileId}
  const driveUcMatch = url.match(/drive\.google\.com\/uc\?[^#]*?id=([^&#]+)/)
  if (driveUcMatch) {
    return `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${driveUcMatch[1]}`
  }
  // Already an lh3 URL — wrap through wsrv.nl
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^/?#]+)/)
  if (lh3Match) {
    return `https://wsrv.nl/?url=https://lh3.googleusercontent.com/d/${lh3Match[1]}`
  }
  return url
}

/**
 * Attempt to load the image directly with CORS. If that fails (e.g. Google Drive),
 * fall back to the server-side proxy which caches in Vercel KV.
 */
function loadImageElement(url: string): Promise<HTMLImageElement> {
  const directUrl = toDirectImageUrl(url)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      // Direct CORS load failed — try the server-side proxy
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(directUrl)}`
      const img2 = new Image()
      img2.crossOrigin = 'anonymous'
      img2.onload = () => resolve(img2)
      img2.onerror = () => reject(new Error('Failed to load image via proxy'))
      img2.src = proxyUrl
    }
    img.src = directUrl
  })
}

/**
 * Loads an image from a URL, compresses it, and caches the result in IndexedDB.
 * Returns a data URL (from cache on subsequent calls).
 * Handles Google Drive URLs and falls back to server-side proxy on CORS failures.
 */
export async function loadCachedImage(url: string): Promise<string> {
  const cached = await getCached(url)
  if (cached) return cached

  try {
    const img = await loadImageElement(url)
    const compressed = compressImage(img)
    await setCached(url, compressed)
    return compressed
  } catch {
    // All strategies failed — return a usable URL (direct or transformed)
    return toDirectImageUrl(url)
  }
}
