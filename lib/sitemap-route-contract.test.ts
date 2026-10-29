import { describe, expect, it, vi } from 'vitest'

const { queries } = vi.hoisted(() => ({
  queries: [] as Array<{ table: string; filters: Array<[string, unknown]>; limit?: number }>,
}))

vi.mock('@/lib/supabaseServer', () => ({
  createPublicClient: () => ({
    from: (table: string) => {
      const record: { table: string; filters: Array<[string, unknown]>; limit?: number } = {
        table,
        filters: [],
      }
      queries.push(record)
      const data: Record<string, unknown[]> = {
        news_posts: [
          { slug: 'news-1', published_at: '2026-09-01T00:00:00Z', updated_at: null },
        ],
        gigs: [
          { id: 'gig-a', title: 'Live', festival_name: null, venue: 'Club', city: 'Berlin', event_date: '2026-10-29' },
        ],
        products: [{ slug: 'neurokore' }],
        soundpacks: [{ id: '12345678-1234-1234-1234-1234567890ab' }],
      }
      const result = { data: data[table] ?? [], error: null }
      const builder = {
        select: (_columns: string) => builder,
        eq: (field: string, value: unknown) => {
          record.filters.push([field, value])
          return builder
        },
        order: (_field: string, _options?: unknown) => builder,
        limit: (amount: number) => {
          record.limit = amount
          return Promise.resolve(result)
        },
        then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve),
      }
      return builder
    },
  }),
}))

import { GET, revalidate } from '@/app/api/sitemap/route'

describe('public sitemap route adapter', () => {
  it('retains cookie-less reads, published-only filtering and cache headers', async () => {
    queries.length = 0
    const response = await GET()
    const xml = await response.text()

    expect(revalidate).toBe(300)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, s-maxage=300')
    expect(queries).toHaveLength(4)

    const byTable = Object.fromEntries(queries.map(query => [query.table, query]))
    expect(byTable.news_posts.filters).toContainEqual(['active', true])
    expect(byTable.gigs.filters).toContainEqual(['active', true])
    expect(byTable.products.filters).toEqual([['kind', 'plugin'], ['active', true]])
    expect(byTable.soundpacks.filters).toContainEqual(['active', true])
    expect(byTable.news_posts.limit).toBe(200)
    expect(byTable.products.limit).toBe(250)
    expect(byTable.soundpacks.limit).toBe(250)

    const entries = [
      '/plugins/neurokore</loc>',
      '/soundpacks/12345678-1234-1234-1234-1234567890ab</loc>',
      '/gigs/live-2026-10-29</loc>',
      '/news/news-1</loc>',
    ]
    for (const entry of entries) expect(xml).toContain(entry)
    const positions = entries.map(entry => xml.indexOf(entry))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})
