'use client'

import { useOverlay } from '@/contexts/OverlayContext'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { toDirectImageUrl } from '@/lib/image-cache'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { SectionWrapper, SectionEmpty, SectionHeading, SectionIntro } from './SectionWrapper'

export interface NewsPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  link: string | null
  coverUrl: string | null
  publishedAt: string | null
}

interface NewsSectionProps {
  posts: NewsPostCard[]
  heading?: string
  intro?: string
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return formatIsoDateLong(iso)
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className="nk-os-frame group block w-full cursor-pointer text-left"
              onClick={() =>
                openOverlay({
                  type: 'news',
                  data: {
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    body: post.body,
                    link: post.link,
                    coverUrl: post.coverUrl,
                    publishedAt: post.publishedAt,
                  },
                })
              }
              aria-label={`Open ${post.title}`}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {post.coverUrl ? (
                  <img
                    src={toDirectImageUrl(post.coverUrl, { w: 800 }) || post.coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                    NEWS
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                {post.publishedAt ? (
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {formatDate(post.publishedAt)}
                  </p>
                ) : null}
                <h3
                  className="text-base font-semibold uppercase tracking-wide text-foreground"
                  style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p
                    className="line-clamp-3 text-sm text-muted-foreground"
                    style={{ fontFamily: 'var(--font-body, inherit)' }}
                  >
                    {post.excerpt}
                  </p>
                ) : null}
                <span className="inline-block font-mono text-xs uppercase tracking-widest text-primary">
                  Read more →
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <SectionEmpty label="News coming soon" />
      )}
    </SectionWrapper>
  )
}
