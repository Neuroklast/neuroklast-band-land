import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabaseServer', () => ({
  createPublicClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: async () => ({
              data: [
                {
                  slug: 'tour-news',
                  published_at: '2026-04-01T00:00:00.000Z',
                  updated_at: null,
                },
              ],
            }),
          }),
        }),
      }),
    }),
  }),
}))

import { GET } from '@/app/api/sitemap/route'

describe('GET /api/sitemap', () => {
  it('does not keep a static public/sitemap.xml that would shadow the rewrite', () => {
    expect(existsSync(resolve(process.cwd(), 'public/sitemap.xml'))).toBe(false)
  })

  it('lists core public routes and published news', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toMatch(/xml/)
    const xml = await res.text()
    expect(xml).toContain('https://neuroklast.net/</loc>')
    expect(xml).toContain('/releases')
    expect(xml).toContain('/gigs')
    expect(xml).toContain('/legal-notice')
    expect(xml).toContain('/privacy-policy')
    expect(xml).toContain('/news/tour-news')
  })
})
