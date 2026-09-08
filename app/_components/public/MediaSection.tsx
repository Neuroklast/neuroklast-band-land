'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { resolveSectionHeading } from '@/lib/section-display'
import type { MediaDownloadItem } from '@/lib/media-download'
import { SectionWrapper, SectionHeading, SectionIntro } from './SectionWrapper'
import { MediaArchiveCard } from './MediaExplorer'

interface MediaSectionProps {
  items: MediaDownloadItem[]
  heading?: string
  intro?: string
}

export function MediaSection({ items, heading, intro }: MediaSectionProps) {
  const { t } = useLocale()
  const title = resolveSectionHeading(heading, 'media', t)

  return (
    <SectionWrapper id="media" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="media" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="media">{intro}</SectionIntro>
      <MediaArchiveCard items={items} />
      {items.length > 0 ? (
        <div className="mt-6 flex justify-center">
          <Link
            href="/media"
            className="cyber-border hover-glitch inline-flex min-h-[44px] items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
          >
            {t('media.viewAll').replace('{0}', String(items.length))}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </SectionWrapper>
  )
}
