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
 * Loads an image from a URL, compresses it, and caches the result in IndexedDB.
 * Returns a data URL (from cache on subsequent calls).
 */
export async function loadCachedImage(url: string): Promise<string> {
  const cached = await getCached(url)
  if (cached) return cached

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      try {
        const compressed = compressImage(img)
        await setCached(url, compressed)
        resolve(compressed)
      } catch {
        resolve(url)
      }
    }
    img.onerror = () => {
      // If CORS fails, return original URL without caching
      resolve(url)
    }
    img.src = url
  })
}
