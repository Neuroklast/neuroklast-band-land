/**
 * MusicHighlightsSection
 * Shows YouTube videos with a two-click consent pattern (GDPR):
 * - First state: thumbnail + play button (no iframe, no YouTube cookies)
 * - After click: YouTube embed loads in place
 */
'use client'

import { useLocale } from '@/contexts/LocaleContext'
import { resolveSectionHeading } from '@/lib/section-display'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import { SectionWrapper, SectionEmpty, SectionHeading, SectionIntro } from './SectionWrapper'

interface MusicHighlight {
  id: string
  title: string
  youtube_url: string
  description: string | null
}

interface EmbedPlayerProps {
  title: string
  youtubeUrl: string
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    return u.searchParams.get('v')
  } catch {
    return null
  }
}

function EmbedPlayer({ title, youtubeUrl }: EmbedPlayerProps) {
  const videoId = extractVideoId(youtubeUrl)

  if (!videoId) {
    return (
      <a
              href={sanitizeExternalHref(youtubeUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center font-mono text-xs text-muted-foreground underline transition-colors hover:text-foreground"
      >
        Watch on YouTube →
      </a>
    )
  }

  return <YouTubeEmbed videoId={videoId} title={title} />
}

interface MusicHighlightsSectionProps {
  highlights: MusicHighlight[]
  heading?: string
  intro?: string
}

export function MusicHighlightsSection({ highlights, heading, intro }: MusicHighlightsSectionProps) {
  const { t } = useLocale()
  const title = resolveSectionHeading(heading, 'music-highlights', t)

  return (
    <SectionWrapper id="music" data-theme-color="foreground card border primary">
      <SectionHeading sectionId="music-highlights" dataText={title}>{title}</SectionHeading>
      <SectionIntro sectionId="music-highlights">{intro}</SectionIntro>
      {highlights.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {highlights.map((h) => (
            <div key={h.id} className="flex flex-col gap-3">
              <EmbedPlayer title={h.title} youtubeUrl={h.youtube_url} />
              <p className="font-mono text-sm text-foreground">{h.title}</p>
              {h.description ? (
                <p className="font-mono text-xs text-muted-foreground">{h.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <SectionEmpty label="Music highlights coming soon" />
      )}
    </SectionWrapper>
  )
}