import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The CSP has a single source of truth: `security-headers.mjs`, imported by
 * `next.config.mjs`. `vercel.json` must not carry a second copy — two CSPs drift
 * apart silently, which is exactly what this test prevents.
 */
const root = resolve(__dirname, '../..')

function readSource(file: string): string {
  return readFileSync(resolve(root, file), 'utf8')
}

function extractDirective(csp: string, directive: string): string[] {
  const match = csp.match(new RegExp(`${directive}\\s+([^;]+)`))
  if (!match) return []
  return match[1].trim().split(/\s+/)
}

describe('CSP single source of truth', () => {
  const headersSource = readSource('security-headers.mjs')
  const nextConfig = readSource('next.config.mjs')

  it('keeps the CSP out of vercel.json', () => {
    const vercel = JSON.parse(readSource('vercel.json')) as {
      headers?: Array<{ headers: Array<{ key: string }> }>
    }
    const keys = (vercel.headers ?? []).flatMap((group) => group.headers.map((h) => h.key))
    expect(keys).not.toContain('Content-Security-Policy')
  })

  it('wires next.config.mjs to the shared builder', () => {
    expect(nextConfig).toContain("from './security-headers.mjs'")
    expect(nextConfig).toContain('buildSecurityHeaders(')
  })

  it('allows the admin live-preview iframe and blocks framing by others', () => {
    expect(headersSource).toContain("frame-ancestors 'self'")
    expect(headersSource).toContain("frame-src 'self'")
    expect(headersSource).toContain("X-Frame-Options', value: 'SAMEORIGIN'")
  })

  it('keeps img-src https-only and allows blob URLs for admin previews', () => {
    expect(headersSource).toContain("img-src 'self' data: blob: https:")
    expect(headersSource).not.toMatch(/img-src[^;]*http:/)
  })

  it('allows the Google Fonts stylesheet', () => {
    expect(headersSource).toContain(
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    )
  })

  it('allows the R2 and Supabase connect targets', () => {
    const connect = extractDirective(headersSource, 'connect-src')
    expect(connect).toContain('https://*.r2.cloudflarestorage.com')
    expect(connect).toContain('https://*.eu.r2.cloudflarestorage.com')
    expect(connect).toContain('https://*.r2.dev')
    expect(connect).toContain('wss://*.supabase.co')
  })

  it('allows unsafe-eval in development only', () => {
    expect(headersSource).toContain("...(isDev ? [\"'unsafe-eval'\"] : [])")
    expect(headersSource).toContain("object-src 'none'")
    expect(headersSource).toContain("base-uri 'self'")
    expect(headersSource).toContain("form-action 'self'")
  })

  it('pins HSTS with preload', () => {
    expect(headersSource).toContain('max-age=63072000; includeSubDomains; preload')
  })
})
