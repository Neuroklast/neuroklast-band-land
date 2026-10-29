import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabaseServer'
import {
  STATIC_URLS,
  LOCALIZED_LEGAL_URLS,
  buildSitemap,
  newsSitemapUrls,
  gigSitemapUrls,
  pluginSitemapUrls,
  soundpackSitemapUrls,
  type SitemapUrl,
  type NewsSitemapRow,
  type GigSitemapRow,
} from '@/lib/sitemap-entries'

/** Rebuild periodically so new news posts appear without redeploy. */
export const revalidate = 300

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

    return newsSitemapUrls((data ?? []) as NewsSitemapRow[])
  } catch {
    return []
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

    return gigSitemapUrls((data ?? []) as GigSitemapRow[])
  } catch {
    return []
  }
}

/** Only public plugin pages may be discoverable; hidden products must not leak. */
async function fetchPluginUrls(): Promise<SitemapUrl[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('products')
      .select('slug').eq('kind', 'plugin').eq('active', true).limit(250)
    if (error) return []
    return pluginSitemapUrls(data ?? [])
  } catch {
    return []
  }
}

/** A published pack has an indexable product page, but an inactive pack does not. */
async function fetchSoundpackUrls(): Promise<SitemapUrl[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.from('soundpacks')
      .select('id').eq('active', true).limit(250)
    if (error) return []
    return soundpackSitemapUrls(data ?? [])
  } catch {
    return []
  }
}

export async function GET(): Promise<NextResponse> {
  const [newsUrls, gigUrls, pluginUrls, soundpackUrls] = await Promise.all([
    fetchNewsUrls(),
    fetchGigUrls(),
    fetchPluginUrls(),
    fetchSoundpackUrls(),
  ])
  // Only provide lastmod when it actually describes a page update.
  // A change to unrelated site settings must not rewrite all sitemap dates.
  const xml = buildSitemap([...STATIC_URLS, ...LOCALIZED_LEGAL_URLS, ...pluginUrls, ...soundpackUrls, ...gigUrls, ...newsUrls])
  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
