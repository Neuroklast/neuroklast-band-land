import type { NewsOverlayData } from '@/lib/app-types'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { toDirectImageUrl } from '@/lib/image-cache'
import { NewsExternalLink } from '@/components/news/NewsExternalLink'
import { NewsBodyText } from '@/components/news/NewsBodyText'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

interface NewsOverlayContentProps {
  data: NewsOverlayData
  closing?: boolean
}

export function NewsOverlayContent({ data, closing }: NewsOverlayContentProps) {
  const cover = data.coverUrl ? toDirectImageUrl(data.coverUrl, { w: 1200 }) || data.coverUrl : null
  const body = (data.body ?? data.excerpt ?? '').trim()

  return (
    <OverlayReveal
      data-theme-color="card border primary"
      className="mt-8 space-y-6"
      closing={closing}
      stagger={0.05}
    >
      {cover ? (
        <OverlayItem className="relative overflow-hidden border border-primary/20 bg-muted" delay={0}>
          <OverlayScanImage src={cover} alt={data.title} className="max-h-[50vh] w-full object-contain" />
          <OverlayFrame />
        </OverlayItem>
      ) : null}

      <div>
        <OverlayItem delay={0.06}>
          <div className="data-label mb-2">// NEWS.ENTRY</div>
        </OverlayItem>
        {data.publishedAt ? (
          <OverlayItem delay={0.1}>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {formatIsoDateLong(data.publishedAt)}
            </p>
          </OverlayItem>
        ) : null}
        <OverlayItem delay={0.14}>
          <h2
            className="mb-4 font-mono text-3xl font-bold uppercase hover-chromatic crt-flash-in sm:text-4xl"
            data-text={data.title}
          >
            {data.title}
          </h2>
        </OverlayItem>
        {data.link ? (
          <OverlayItem delay={0.18}>
            <NewsExternalLink href={data.link} />
          </OverlayItem>
        ) : null}
        {body ? (
          <OverlayItem delay={0.2}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 md:text-base">
              <NewsBodyText text={body} />
            </p>
          </OverlayItem>
        ) : null}
        <OverlayItem delay={0.24}>
          <a
            href={'/news/' + encodeURIComponent(data.slug)}
            className="inline-flex min-h-11 items-center border border-primary/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
          >
            Open full article
          </a>
        </OverlayItem>
      </div>
    </OverlayReveal>
  )
}
