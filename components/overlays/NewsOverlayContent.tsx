import { motion } from 'framer-motion'
import { ArrowSquareOut } from '@phosphor-icons/react'
import type { NewsOverlayData } from '@/lib/app-types'
import { formatIsoDateLong } from '@/lib/format-display-date'
import { toDirectImageUrl } from '@/lib/image-cache'
import { sanitizeExternalHref } from '@/lib/sanitize-href'

interface NewsOverlayContentProps {
  data: NewsOverlayData
}

export function NewsOverlayContent({ data }: NewsOverlayContentProps) {
  const href = sanitizeExternalHref(data.link)
  const cover = data.coverUrl ? toDirectImageUrl(data.coverUrl, { w: 1200 }) || data.coverUrl : null
  const body = (data.body ?? data.excerpt ?? '').trim()

  return (
    <motion.div
      data-theme-color="card border primary"
      className="mt-8 space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {cover ? (
        <div className="overflow-hidden border border-primary/20 bg-muted">
          <img src={cover} alt="" className="max-h-[50vh] w-full object-contain" />
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="data-label mb-2">// NEWS.ENTRY</div>
        {data.publishedAt ? (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {formatIsoDateLong(data.publishedAt)}
          </p>
        ) : null}
        <h2
          className="mb-4 font-mono text-3xl font-bold uppercase hover-chromatic crt-flash-in sm:text-4xl"
          data-text={data.title}
        >
          {data.title}
        </h2>
        {body ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 md:text-base">
            {body}
          </p>
        ) : null}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-colors hover:bg-primary/20"
          >
            <ArrowSquareOut className="h-4 w-4" aria-hidden />
            Open link
          </a>
        ) : null}
      </motion.div>
    </motion.div>
  )
}
