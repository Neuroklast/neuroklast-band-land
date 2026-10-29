import { buildGigSlugMap } from '@/lib/gig-slug'
import { LEGAL_DOCUMENTS, PUBLIC_LEGAL_LOCALES, localizedLegalPath } from '@/lib/legal-routes'

/**
 * Pure sitemap XML serialization and public URL mapping.
 * The route adapter owns public Supabase filtering, query ordering and ISR.
 */
export const BASE_URL = 'https://neuroklast.net'

export type SitemapUrl = { loc: string; changefreq: string; priority: string; lastmod?: string }

export const STATIC_URLS: SitemapUrl[] = [
  { loc: `${BASE_URL}/`, changefreq: 'weekly', priority: '1.0' },
  { loc: `${BASE_URL}/releases`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/gigs`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/media`, changefreq: 'weekly', priority: '0.7' },
  { loc: `${BASE_URL}/booking`, changefreq: 'monthly', priority: '0.7' },
  { loc: `${BASE_URL}/news`, changefreq: 'daily', priority: '0.7' },
  { loc: `${BASE_URL}/plugins`, changefreq: 'weekly', priority: '0.8' },
  { loc: `${BASE_URL}/soundpacks`, changefreq: 'weekly', priority: '0.7' },




  { loc: `${BASE_URL}/withdrawal`, changefreq: 'monthly', priority: '0.3' },


]

export const LOCALIZED_LEGAL_URLS: SitemapUrl[] = PUBLIC_LEGAL_LOCALES.flatMap(locale =>
  LEGAL_DOCUMENTS.map(document => ({
    loc: BASE_URL + localizedLegalPath(locale, document),
    changefreq: 'monthly',
    priority: '0.4',
  })),
)

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function buildSitemap(urls: SitemapUrl[]): string {
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


export interface NewsSitemapRow {
  slug: string
  published_at: string | null
  updated_at: string | null
}

export interface GigSitemapRow {
  id: string
  title: string
  festival_name: string | null
  venue: string | null
  city: string | null
  event_date: string
}

export interface PluginSitemapRow {
  slug: string
}

export interface SoundpackSitemapRow {
  id: string
}

/** Input rows are queried with active=true by the adapter. Do not change ordering. */
export function newsSitemapUrls(rows: NewsSitemapRow[]): SitemapUrl[] {
  return rows
    .filter(row => typeof row.slug === 'string' && row.slug.length > 0)
    .map(row => {
      const last = row.updated_at || row.published_at
      return {
        loc: BASE_URL + '/news/' + encodeURIComponent(row.slug),
        changefreq: 'monthly',
        priority: '0.6',
        lastmod: last ? new Date(last).toISOString().slice(0, 10) : undefined,
      }
    })
}

/** Preserve the same collision-safe slug mapping used by public gig pages. */
export function gigSitemapUrls(rows: GigSitemapRow[]): SitemapUrl[] {
  const slugById = buildGigSlugMap(rows)
  const entries: SitemapUrl[] = []
  for (const row of rows) {
    const slug = slugById.get(row.id)
    if (!slug) continue
    // Event date is not the modification date. Never fabricate lastmod.
    entries.push({
      loc: BASE_URL + '/gigs/' + slug,
      changefreq: 'weekly',
      priority: '0.7',
    })
  }
  return entries
}

/** Caller selects active plugin products only; validate slugs again here. */
export function pluginSitemapUrls(rows: PluginSitemapRow[]): SitemapUrl[] {
  return rows
    .filter(item => typeof item.slug === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(item.slug))
    .map(item => ({
      loc: BASE_URL + '/plugins/' + item.slug,
      changefreq: 'weekly',
      priority: '0.8',
    }))
}

/** Caller selects active packs only; never publish arbitrary identifiers. */
export function soundpackSitemapUrls(rows: SoundpackSitemapRow[]): SitemapUrl[] {
  return rows
    .filter(row => typeof row.id === 'string' && /^[a-f0-9-]{36}$/i.test(row.id))
    .map(row => ({
      loc: BASE_URL + '/soundpacks/' + row.id,
      changefreq: 'weekly',
      priority: '0.7',
    }))
}
