'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { formatIsoDateLong } from '@/lib/format-display-date'
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
  heading?: string
  intro?: string
}

export function NewsSection({ posts, heading, intro }: NewsSectionProps) {
  const { t } = useLocale()
  const { openOverlay } = useOverlay()
  const title = resolveSectionHeading(heading, 'news', t)

  return (
    <SectionWrapper id="news" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="news" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="news">{intro}</SectionIntro>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="nk-os-frame group flex h-full min-w-0 flex-col">
              <button
                type="button"
                className="flex w-full flex-1 flex-col text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => openOverlay({ type: 'news', data: post })}
                aria-label={`Open ${post.title}`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {post.coverUrl ? (
                    <CdnImage
                      src={post.coverUrl}
                      alt={post.title}
                      widths={[320, 480, 800]}
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 400px"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                      NEWS
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-1 flex-col gap-2 px-4 pb-4 pt-4">
                  {post.publishedAt ? (
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {formatIsoDateLong(post.publishedAt)}
                    </p>
                  ) : null}
                  <h3
                    className="line-clamp-2 text-base font-semibold uppercase tracking-wide text-foreground"
                    style={{ fontFamily: 'var(--font-heading, inherit)' }}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p
                      className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
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
          ))}
        </div>
      ) : (
        <SectionEmpty label={t('news.noNews')} />
      )}
    </SectionWrapper>
  )
}
