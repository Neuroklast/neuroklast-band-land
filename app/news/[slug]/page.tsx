import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabaseServer'
import { resolveImageUrl } from '@/lib/r2'
import { NewsExternalLink } from '@/components/news/NewsExternalLink'
import { NEWS_LINK_LABELS_KEY, parseNewsLinkLabels } from '@/lib/news-link-label'
import { NewsBodyText } from '@/components/news/NewsBodyText'
import { NewsShareActions } from '@/components/news/NewsShareActions'
import { toDirectImageUrl } from '@/lib/image-cache'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

interface NewsPostRow {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  link: string | null
  cover_storage_path: string | null
  cover_url: string | null
  published_at: string | null
}

async function loadPost(slug: string): Promise<NewsPostRow | null> {
  try {
    // Cookie-less client: keeps this route static (ISR) instead of per-request.
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('news_posts')
      .select(
        'id, title, slug, excerpt, body, link, cover_storage_path, cover_url, published_at',
      )
      .eq('slug', slug)
      .eq('active', true)
      .maybeSingle()
    return (data as NewsPostRow | null) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) return { title: 'News', robots: { index: false, follow: false } }
  const cover = resolveImageUrl(post.cover_storage_path, post.cover_url)
  const origin = getSiteOrigin()
  const image = absoluteUrl(origin, cover || '/og-image.png')
  const description = post.excerpt?.trim() || post.body.slice(0, 160).trim() || undefined
  return {
    title: post.title,
    description,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: absoluteUrl(origin, '/news/' + encodeURIComponent(slug)),
      siteName: 'NEUROKLAST',
      images: [{ url: image, alt: post.title }],
      publishedTime: post.published_at ?? undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
  }
}

export const revalidate = 60

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  // Pre-render published slugs at build time; ISR covers new additions.
  try {
    const supabase = createPublicClient()
    const { data } = await supabase
      .from('news_posts')
      .select('slug')
      .eq('active', true)
    return (data ?? []).map((row) => ({ slug: row.slug }))
  } catch {
    return []
  }
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await loadPost(slug)
  if (!post) notFound()

  const cover = resolveImageUrl(post.cover_storage_path, post.cover_url)
  const { data: labelRow } = await createPublicClient()
    .from('site_config')
    .select('value')
    .eq('key', NEWS_LINK_LABELS_KEY)
    .maybeSingle()
  const linkLabel = parseNewsLinkLabels(labelRow?.value)[post.id] ?? null
  const articleUrl = absoluteUrl(getSiteOrigin(), '/news/' + encodeURIComponent(post.slug))
  const dateLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <LegalPageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl(getSiteOrigin(), '/') },
          { name: post.title, url: absoluteUrl(getSiteOrigin(), `/news/${post.slug}`) },
        ])}
      />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.excerpt || undefined,
        mainEntityOfPage: articleUrl,
        image: cover ? absoluteUrl(getSiteOrigin(), cover) : undefined,
        datePublished: post.published_at || undefined,
        publisher: { '@type': 'Organization', name: 'NEUROKLAST', url: getSiteOrigin() },
      }} />
      <article className="mx-auto max-w-3xl px-card pt-[calc(var(--nk-nav-h)+1.5rem)] pb-section">
        <Link
          href="/#news"
          className="mb-8 inline-flex font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to news
        </Link>

        {cover ? (
          <div className="mb-7 flex max-h-[min(40vh,400px)] items-center justify-center overflow-hidden border border-border/60 bg-muted">
            <img
              src={toDirectImageUrl(cover, { w: 1200 }) || cover}
              alt={post.title}
              className="max-h-[min(40vh,400px)] w-full object-contain"
            />
          </div>
        ) : null}

        {dateLabel ? (
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {dateLabel}
          </p>
        ) : null}

        <h1
          className="mb-5 text-3xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-4xl"
          style={{ fontFamily: 'var(--font-heading, inherit)' }}
        >
          {post.title}
        </h1>

        {post.excerpt ? (
          <p
            className="mb-8 text-lg text-muted-foreground"
            style={{ fontFamily: 'var(--font-body, inherit)' }}
          >
            {post.excerpt}
          </p>
        ) : null}

        {post.link ? (
          <div className="mb-7">
            <NewsExternalLink href={post.link} label={linkLabel} />
          </div>
        ) : null}

        <div
          className="whitespace-pre-wrap text-base leading-8 text-foreground/90"
          style={{ fontFamily: 'var(--font-body, inherit)' }}
        >
          <NewsBodyText text={post.body} />
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <NewsShareActions slug={post.slug} title={post.title} excerpt={post.excerpt} />
        </div>
      </article>
    </LegalPageShell>
  )
}
