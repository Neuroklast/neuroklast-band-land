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
      className="mt-3 space-y-5"
      closing={closing}
      stagger={0.05}
    >
      {cover ? (
        <OverlayItem className="relative flex max-h-[min(36vh,340px)] items-center justify-center overflow-hidden border border-border/60 bg-muted" delay={0}>
          <OverlayScanImage src={cover} alt={data.title} className="max-h-[min(36vh,340px)] w-full object-contain" />
          <OverlayFrame />
        </OverlayItem>
      ) : null}

      <div className="max-w-prose">
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
            className="mb-5 font-mono text-2xl font-bold uppercase leading-tight tracking-tight hover-chromatic crt-flash-in sm:text-3xl"
            data-text={data.title}
          >
            {data.title}
          </h2>
        </OverlayItem>
        {data.link ? (
          <OverlayItem delay={0.18}>
            <NewsExternalLink href={data.link} label={data.linkLabel} />
          </OverlayItem>
        ) : null}
        {body ? (
          <OverlayItem delay={0.2}>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-foreground/90 md:text-base md:leading-8">
              <NewsBodyText text={body} />
            </p>
          </OverlayItem>
        ) : null}
      </div>
    </OverlayReveal>
  )
}
