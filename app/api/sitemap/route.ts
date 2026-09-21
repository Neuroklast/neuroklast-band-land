import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabaseServer'
import { buildGigSlugMap } from '@/lib/gig-slug'

/** Rebuild periodically so new news posts appear without redeploy. */
export const revalidate = 3600

const BASE_URL = process.env.SITE_URL?.replace(/\/$/, '') || 'https://neuroklast.net'

type SitemapUrl = { loc: string; changefreq: string; priority: string; lastmod?: string }

const STATIC_URLS: SitemapUrl[] = [
  { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE_URL}/releases`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/gigs`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/media`, changefreq: 'weekly', priority: '0.7' },
  { loc: `${BASE_URL}/legal-notice`, changefreq: 'monthly', priority: '0.3' },
  { loc: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.3' },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(({ loc, changefreq, priority, lastmod }) => {
      const lastmodLine = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodLine}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

interface NewsSitemapRow {
  slug: string
  published_at: string | null
  updated_at: string | null
}

async function fetchNewsUrls(): Promise<SitemapUrl[]> {
  try {
    // Cookie-less client: keeps this route cacheable (s-maxage) — crawler
    // swarms must never re-run the DB query per request.
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('news_posts')
      .select('slug, published_at, updated_at')
      .eq('active', true)
      .order('published_at', { ascending: false })
      .limit(200)

    const rows = (data ?? []) as NewsSitemapRow[]
    return rows
      .filter((row) => typeof row.slug === 'string' && row.slug.length > 0)
      .map((row) => {
        const last = row.updated_at || row.published_at
        return {
          loc: `${BASE_URL}/news/${encodeURIComponent(row.slug)}`,
          changefreq: 'monthly',
          priority: '0.6',
          lastmod: last ? new Date(last).toISOString().slice(0, 10) : undefined,
        }
      })
  } catch {
    return []
  }
}

async function fetchContentStamp(): Promise<string | undefined> {
  try {
    // Single row read: reflects the newest site_config change and is cheap
    // enough for the hourly sitemap regeneration.
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('site_config')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)

    const stamp = (data ?? [])[0]?.updated_at as string | null | undefined
    return stamp ? new Date(stamp).toISOString().slice(0, 10) : undefined
  } catch {
    return undefined
  }
}

async function fetchGigUrls(): Promise<SitemapUrl[]> {
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('gigs')
      .select('id, title, festival_name, venue, city, event_date')
      .eq('active', true)
      .order('event_date', { ascending: true })

    const rows = (data ?? []) as Array<{
      id: string
      title: string
      festival_name: string | null
      venue: string | null
      city: string | null
      event_date: string
    }>

    const slugById = buildGigSlugMap(rows)
    const entries: SitemapUrl[] = []
    for (const row of rows) {
      const slug = slugById.get(row.id)
      if (!slug) continue
      // No lastmod here: gigs have no updated_at, and the event date is not a
      // modification date. GET() applies the site_config content stamp instead.
      entries.push({
        loc: `${BASE_URL}/gigs/${slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }
    return entries
  } catch {
    return []
  }
}

export async function GET(): Promise<NextResponse> {
  const [newsUrls, gigUrls, contentStamp] = await Promise.all([
    fetchNewsUrls(),
    fetchGigUrls(),
    fetchContentStamp(),
  ])
  const staticUrls = STATIC_URLS.map((url) =>
    url.lastmod ? url : { ...url, lastmod: contentStamp },
  )
  const datedGigUrls = gigUrls.map((url) =>
    url.lastmod ? url : { ...url, lastmod: contentStamp },
  )
  const xml = buildSitemap([...staticUrls, ...datedGigUrls, ...newsUrls])
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
