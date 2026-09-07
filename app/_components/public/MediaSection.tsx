'use client'

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
    </SectionWrapper>
  )
}
