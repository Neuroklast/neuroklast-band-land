/**
 * Defense-in-depth HTTPS redirect. Vercel terminates TLS at the edge;
 * this still 308s if a proxy forwards `x-forwarded-proto: http`.
 * Localhost is left on HTTP so `next dev` is not bounced.
 */
export function httpsRedirectLocation(
  requestUrl: string,
  forwardedProto: string | null | undefined,
): string | null {
  if (forwardedProto !== 'http') return null
  try {
    const url = new URL(requestUrl)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return null
    url.protocol = 'https:'
    return url.toString()
  } catch {
    return null
  }
}
