import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { BrowsePageShell } from '@/app/_components/public/BrowsePageShell'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { createPublicClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import { toDirectImageUrl } from '@/lib/image-cache'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'
import { getSiteOrigin } from '@/lib/og-share'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'News Archive',
  description: 'All NEUROKLAST news, releases, events and announcements.',
  alternates: { canonical: '/news' },
}

export default async function NewsArchivePage() {
  let posts: Array<{
    id: string
    title: string
    slug: string
    excerpt: string | null
    cover_storage_path: string | null
    cover_url: string | null
    published_at: string | null
  }> = []

  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('news_posts')
      .select('id, title, slug, excerpt, cover_storage_path, cover_url, published_at')
      .eq('active', true)
      .order('published_at', { ascending: false })

    if (error) console.error('[news archive] failed to load news:', error.message)
    else posts = data ?? []
  } catch {
    // Show an empty archive when the public database cannot be reached.
  }

  const origin = getSiteOrigin()

  return (
    <LegalPageShell>
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'Home', url: absoluteUrl(origin, '/') },
        { name: 'News', url: absoluteUrl(origin, '/news') },
      ])} />
      <BrowsePageShell titleKey="section.news" streamLabel="// NEWS.ARCHIVE">
        <div className="mb-6">
          <Link href="/#news" className="font-mono text-xs uppercase tracking-widest text-primary hover:underline">
            ← Back to homepage
          </Link>
        </div>
        {posts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = resolveImageUrl(post.cover_storage_path, post.cover_url)
              return (
                <article key={post.id} className="nk-os-frame group min-w-0 overflow-hidden">
                  <Link href={`/news/${encodeURIComponent(post.slug)}`} className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {cover ? (
                        <img
                          src={toDirectImageUrl(cover, { w: 640 }) || cover}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">NEWS</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {post.published_at ? (
                        <time dateTime={post.published_at} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {formatIsoDateLong(post.published_at)}
                        </time>
                      ) : null}
                      <h2 className="text-base font-semibold uppercase tracking-wide text-foreground" style={{ fontFamily: 'var(--font-heading, inherit)' }}>
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                      ) : null}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="py-12 text-center font-mono text-sm text-muted-foreground">No news available.</p>
        )}
      </BrowsePageShell>
    </LegalPageShell>
  )
}
