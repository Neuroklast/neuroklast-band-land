'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { SpotifyEmbed } from '@/components/SpotifyEmbed'
import { spotifyEmbedHeight } from '@/lib/spotify-artist'
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
  const playerHeight = spotifyEmbedHeight(uri)

  return (
    <SectionWrapper id="spotify" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="spotify" dataText={title}>
        {title}
      </SectionHeading>
      <SectionIntro sectionId="spotify">{intro}</SectionIntro>
      <div className="w-full overflow-hidden border border-border" style={{ height: playerHeight + 2 }}>
        <SpotifyEmbed uri={uri} height={playerHeight} className="w-full" />
      </div>
    </SectionWrapper>
  )
}
