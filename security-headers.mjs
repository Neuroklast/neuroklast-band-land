/**
 * Single source of truth for the public security headers.
 *
 * `next.config.mjs` imports this module. Do not duplicate the values in
 * `vercel.json` — Next.js on Vercel applies the config headers to every route,
 * and two copies drift apart silently.
 */

export const HSTS_VALUE = 'max-age=63072000; includeSubDomains; preload'

/**
 * Build the Content-Security-Policy value.
 * `unsafe-eval` is a development-only escape hatch (React Refresh / Turbopack);
 * production must not allow eval.
 */
export function buildContentSecurityPolicy({ isDev = false } = {}) {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://open.spotify.com',
    'https://embed-cdn.spotifycdn.com',
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
  ]

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-src 'self' https://open.spotify.com https://www.youtube.com https://youtube.com https://music.youtube.com https://www.youtube-nocookie.com https://embed-cdn.spotifycdn.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https: data:",
    "connect-src 'self' https://api.spotify.com https://open.spotify.com https://spclient.wg.spotify.com https://api.song.link https://rest.bandsintown.com https://itunes.apple.com https://wsrv.nl https://vercel.com https://*.public.blob.vercel-storage.com https://*.supabase.co wss://*.supabase.co https://*.r2.cloudflarestorage.com https://*.eu.r2.cloudflarestorage.com https://*.r2.dev https://fonts.googleapis.com https://fonts.gstatic.com",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join('; ')
}

export function buildSecurityHeaders({ isDev = false } = {}) {
  return [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy({ isDev }) },
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Strict-Transport-Security', value: HSTS_VALUE },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
    { key: 'X-DNS-Prefetch-Control', value: 'off' },
  ]
}
