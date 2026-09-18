import {
  InstagramLogo,
  FacebookLogo,
  SpotifyLogo,
  SoundcloudLogo,
  YoutubeLogo,
  MusicNote,
  Globe,
  type Icon,
} from '@phosphor-icons/react'
import type { Partner } from '@/lib/app-types'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { useLocale } from '@/contexts/LocaleContext'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

const SOCIAL_ICONS: { key: string; icon: Icon; label: string }[] = [
  { key: 'instagram', icon: InstagramLogo, label: 'Instagram' },
  { key: 'facebook', icon: FacebookLogo, label: 'Facebook' },
  { key: 'spotify', icon: SpotifyLogo, label: 'Spotify' },
  { key: 'soundcloud', icon: SoundcloudLogo, label: 'SoundCloud' },
  { key: 'youtube', icon: YoutubeLogo, label: 'YouTube' },
  { key: 'bandcamp', icon: MusicNote, label: 'Bandcamp' },
  { key: 'website', icon: Globe, label: 'Website' },
]

interface PartnerOverlayContentProps {
  data: Partner
  closing?: boolean
}

export function PartnerOverlayContent({ data, closing }: PartnerOverlayContentProps) {
  const { t } = useLocale()
  const socials = data.socials ?? {}
  const activeSocials = SOCIAL_ICONS.filter(({ key }) => {
    const href = socials[key]
    return typeof href === 'string' && href.trim().length > 0
  })
  const website = sanitizeExternalHref(data.url)

  return (
    <OverlayReveal
      data-theme-color="card card-foreground border"
      className="space-y-6"
      closing={closing}
      stagger={0.05}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {data.logoUrl ? (
          <OverlayItem
            className="relative w-full max-w-[200px] shrink-0 self-center md:self-start"
            variant="slideLeft"
            delay={0}
          >
            <div
              className="relative aspect-square w-full overflow-hidden border border-primary/40 bg-black p-4"
              style={{ filter: 'drop-shadow(0 0 20px color-mix(in oklch, var(--primary) 30%, transparent))' }}
            >
              <OverlayScanImage
                src={data.logoUrl}
                alt={data.name}
                className="h-full w-full object-contain"
              />
              <OverlayFrame />
            </div>
          </OverlayItem>
        ) : null}
        <div className="flex-1">
          <OverlayItem delay={0.08}>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
              {t('credits.overlayLabel')}
            </div>
          </OverlayItem>
          <OverlayItem delay={0.12}>
            <h2
              className="mb-4 font-mono text-4xl font-bold uppercase crt-flash-in"
              data-text={data.name}
            >
              {data.name}
            </h2>
          </OverlayItem>
          {data.description ? (
            <OverlayItem delay={0.16}>
              <p className="leading-relaxed text-foreground/90">{data.description}</p>
            </OverlayItem>
          ) : null}
          {website ? (
            <OverlayItem delay={0.2}>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] items-center font-mono text-xs uppercase tracking-wider text-primary hover:underline"
              >
                {t('credits.overlayLink')}
              </a>
            </OverlayItem>
          ) : null}
          {activeSocials.length > 0 ? (
            <OverlayItem className="mt-4 flex flex-wrap gap-3" delay={0.24}>
              {activeSocials.map(({ key, icon: Icon, label }) => (
                <a
                  key={key}
                  href={sanitizeExternalHref(socials[key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 transition-colors hover:text-primary"
                  title={label}
                  aria-label={label}
                >
                  <Icon size={22} weight="fill" />
                </a>
              ))}
            </OverlayItem>
          ) : null}
        </div>
      </div>
    </OverlayReveal>
  )
}
