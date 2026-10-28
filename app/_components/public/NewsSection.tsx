'use client'

import Link from 'next/link'
import { useLocale } from '@/contexts/LocaleContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { selectHomepageNews } from '@/lib/news-homepage'
import { SectionWrapper, SectionEmpty, SectionHeading, SectionIntro } from './SectionWrapper'
import { CdnImage } from './CdnImage'
import { NewsShareActions } from '@/components/news/NewsShareActions'
import { NewsExternalLink } from '@/components/news/NewsExternalLink'

export interface NewsPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  link: string | null
  linkLabel?: string | null
  coverUrl: string | null
  publishedAt: string | null
}

interface NewsSectionProps {
  posts: NewsPostCard[]
  featuredId?: string | null
  heading?: string
  intro?: string
}

function NewsCard({
  post,
  prominent = false,
  featured = false,
  onOpen,
}: {
  post: NewsPostCard
  prominent?: boolean
  featured?: boolean
  onOpen: (post: NewsPostCard) => void
}) {
  const { t } = useLocale()

  return (
    <article className={`nk-os-frame group flex h-full min-w-0 flex-col overflow-hidden ${prominent ? 'w-full' : ''}`}>
      <button
        type="button"
        className={`flex w-full flex-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${prominent ? 'flex-col md:flex-row' : 'flex-row sm:flex-col'}`}
        onClick={() => onOpen(post)}
        aria-label={`Open ${post.title}`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-muted ${prominent
            ? 'aspect-video w-full md:aspect-[16/9] md:w-[57%]'
            : 'min-h-28 w-28 sm:aspect-video sm:min-h-0 sm:w-full'}`}
        >
          {post.coverUrl ? (
            <CdnImage
              src={post.coverUrl}
              alt={post.title}
              widths={prominent ? [480, 800, 1200] : [240, 400, 640]}
              sizes={prominent
                ? '(max-width: 767px) 90vw, (max-width: 1280px) 54vw, 700px'
                : '(max-width: 639px) 112px, (max-width: 1024px) 45vw, 380px'}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full min-h-28 items-center justify-center border-b border-primary/10 bg-black/70 px-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              NEWS
            </div>
          )}
        </div>
        <div className={`flex min-w-0 flex-1 flex-col justify-center ${prominent ? 'gap-3 p-5 md:p-7' : 'gap-2 p-3 sm:p-4'}`}>
          {prominent ? (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
              {featured ? 'FEATURED // NEWS' : 'LATEST // NEWS'}
            </span>
          ) : null}
          {post.publishedAt ? (
            <time dateTime={post.publishedAt} className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {formatIsoDateLong(post.publishedAt)}
            </time>
          ) : null}
          <h3
            className={`font-semibold uppercase tracking-wide text-foreground ${prominent
              ? 'line-clamp-3 text-xl leading-snug sm:text-2xl lg:text-3xl'
              : 'line-clamp-2 text-sm sm:text-base'}`}
            style={{ fontFamily: 'var(--font-heading, inherit)' }}
          >
            {post.title}
          </h3>
          {post.excerpt ? (
            <p
              className={`leading-relaxed text-muted-foreground ${prominent
                ? 'line-clamp-4 text-sm md:text-base'
                : 'line-clamp-2 text-xs sm:line-clamp-3 sm:text-sm'}`}
              style={{ fontFamily: 'var(--font-body, inherit)' }}
            >
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </button>
      <div className="flex min-h-12 items-center justify-between gap-2 border-t border-border/50 px-4">
        {post.link ? (
          <NewsExternalLink href={post.link} label={post.linkLabel} compact />
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {t('news.readMore')}
          </span>
        )}
        <NewsShareActions slug={post.slug} title={post.title} excerpt={post.excerpt} variant="compact" />
      </div>
    </article>
  )
}

export function NewsSection({ posts, featuredId, heading, intro }: NewsSectionProps) {
  const { t } = useLocale()
  const { openOverlay } = useOverlay()
  const title = resolveSectionHeading(heading, 'news', t)
  const { lead, recent, isFeatured } = selectHomepageNews(posts, featuredId ?? null)
  const openNews = (post: NewsPostCard) => openOverlay({ type: 'news', data: post })

  return (
    <SectionWrapper id="news" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="news" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="news">{intro}</SectionIntro>

      {lead ? (
        <div className="space-y-5">
          <NewsCard post={lead} prominent featured={isFeatured} onOpen={openNews} />
          {recent.length ? (
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((post) => (
                <NewsCard key={post.id} post={post} onOpen={openNews} />
              ))}
            </div>
          ) : null}
          {posts.length > 4 ? (
            <div className="flex justify-end">
              <Link
                href="/news"
                className="inline-flex min-h-10 items-center border border-primary/30 px-4 font-mono text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                ALL NEWS / ARCHIVE →
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <SectionEmpty label={t('news.noNews')} />
      )}
    </SectionWrapper>
  )
}
