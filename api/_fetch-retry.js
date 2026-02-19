const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Fetch a URL with automatic retry on HTTP 429 (Too Many Requests).
 * Respects the Retry-After response header when present; otherwise uses
 * exponential backoff (1 s, 2 s, 4 s …).
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithRetry(url, options) {
  let attempt = 0
  while (true) {
    const response = await fetch(url, options)
    if (response.status !== 429 || attempt >= MAX_RETRIES) {
      return response
    }
    const retryAfter = response.headers.get('Retry-After')
    const delayMs = retryAfter
      ? parseFloat(retryAfter) * 1000
      : BASE_DELAY_MS * Math.pow(2, attempt)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    attempt++
  }
}
