/** @type {import('next').NextConfig} */
import { buildSecurityHeaders } from './security-headers.mjs'

function r2PublicHostname() {
  const host = process.env.R2_PUBLIC_HOST
  if (!host) return null
  try {
    return new URL(host.startsWith('http') ? host : `https://${host}`).hostname
  } catch {
    return null
  }
}

const r2Hostname = r2PublicHostname()

const DEFAULT_FAVICON = '/brand/nk-mark.svg'

const SECURITY_HEADERS = buildSecurityHeaders({ isDev: process.env.NODE_ENV !== 'production' })

const nextConfig = {
  // Expose the public R2 origin to client code (stale pub-*.r2.dev rewrite).
  env: {
    NEXT_PUBLIC_R2_PUBLIC_HOST: process.env.R2_PUBLIC_HOST ?? '',
  },
  // Image crop export + FormData uploads go through Server Actions.
  // Default is 1 MB; hero/logo full-res exports often exceed that after PNG inflate.
  // Keep under Vercel serverless request body (~4.5 MB).
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  outputFileTracingIncludes: {
    '*': ['./supabase/schema.sql'],
  },
  async redirects() {
    return [
      // Canonical host: apex. `has.host` only matches on Vercel deployments.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.neuroklast.net' }],
        destination: 'https://neuroklast.net/:path*',
        permanent: true,
      },
      { source: '/impressum', destination: '/legal-notice', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/datenschutz', destination: '/privacy-policy', permanent: true },
    ]
  },
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: DEFAULT_FAVICON },
      // Dynamic sitemap (news + static routes). Do not keep public/sitemap.xml —
      // a static file would shadow this rewrite.
      { source: '/sitemap.xml', destination: '/api/sitemap' },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
  images: {
    // Vercel Image Optimization returns 402 when quota is exceeded, so it stays
    // off by default. Switch `site_config.imageCdn.mode` to "vercel" AND set
    // NEXT_PUBLIC_IMAGE_OPTIMIZATION=on to opt in (see lib/image-cdn.ts).
    unoptimized: process.env.NEXT_PUBLIC_IMAGE_OPTIMIZATION !== 'on',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.eu.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      // Apple Music / iTunes artwork CDN (used as fallback when R2 upload is skipped)
      { protocol: 'https', hostname: '*.mzstatic.com' },
      // YouTube video thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      // Bandcamp cover art
      { protocol: 'https', hostname: '*.bcbits.com' },
      // wsrv.nl image proxy (used for Google Drive and other external images)
      { protocol: 'https', hostname: 'wsrv.nl' },
      ...(r2Hostname ? [{ protocol: /** @type {'https'} */ ('https'), hostname: r2Hostname }] : []),
    ],
  },
}

export default nextConfig
