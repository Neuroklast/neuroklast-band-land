'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { SpotifyEmbed } from '@/components/SpotifyEmbed'
import { resolveSectionHeading } from '@/lib/section-display'
import { SectionWrapper, SectionHeading, SectionIntro } from './SectionWrapper'

interface SpotifySectionProps {
  uri: string
  heading?: string
  intro?: string
}

export function SpotifySection({ uri, heading, intro }: SpotifySectionProps) {
  const { t } = useLocale()
  const title = resolveSectionHeading(heading, 'spotify', t)

  return (
    <SectionWrapper id="spotify" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="spotify" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="spotify">{intro}</SectionIntro>
      <SpotifyEmbed uri={uri} height={380} className="w-full overflow-hidden border border-border" />
    </SectionWrapper>
  )
}
