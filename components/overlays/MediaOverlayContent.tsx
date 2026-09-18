'use client'

import { DownloadSimple } from '@phosphor-icons/react'
import type { MediaOverlayData } from '@/lib/app-types'
import { toDirectImageUrl } from '@/lib/image-cache'
import { useLocale } from '@/contexts/LocaleContext'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

interface MediaOverlayContentProps {
  data: MediaOverlayData
  closing?: boolean
}

export function MediaOverlayContent({ data, closing }: MediaOverlayContentProps) {
  const { t } = useLocale()
  const previewSrc = toDirectImageUrl(data.imageUrl, { w: 1600, q: 85 }) || data.imageUrl

  return (
    <OverlayReveal className="space-y-6" closing={closing} stagger={0.06}>
      <OverlayItem className="relative overflow-hidden border border-border bg-muted" delay={0}>
        <OverlayScanImage
          src={previewSrc}
          alt={data.title}
          className="mx-auto max-h-[min(70vh,720px)] w-auto max-w-full object-contain"
        />
        <OverlayFrame />
      </OverlayItem>
      <div className="space-y-2">
        <OverlayItem delay={0.08}>
          <h2 className="font-mono text-xl font-bold uppercase tracking-tight">{data.title}</h2>
        </OverlayItem>
        {data.description ? (
          <OverlayItem delay={0.12}>
            <p className="font-mono text-sm text-muted-foreground">{data.description}</p>
          </OverlayItem>
        ) : null}
      </div>
      <OverlayItem delay={0.16}>
        <a
          href={sanitizeExternalHref(data.fileUrl)}
          download={data.filename ?? undefined}
          className="cyber-border hover-glitch inline-flex min-h-[44px] items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
        >
          <DownloadSimple className="h-4 w-4" />
          {t('media.download')}
        </a>
      </OverlayItem>
    </OverlayReveal>
  )
}
