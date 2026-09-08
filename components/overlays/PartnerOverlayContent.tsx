import { motion } from 'framer-motion'
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
}

export function PartnerOverlayContent({ data }: PartnerOverlayContentProps) {
  const { t } = useLocale()
  const socials = data.socials ?? {}
  const activeSocials = SOCIAL_ICONS.filter(({ key }) => {
    const href = socials[key]
    return typeof href === 'string' && href.trim().length > 0
  })
  const website = sanitizeExternalHref(data.url)

  return (
    <motion.div
      data-theme-color="card card-foreground border"
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {data.logoUrl ? (
          <div className="relative w-full max-w-[200px] shrink-0 self-center md:self-start">
            <div
              className="aspect-square w-full overflow-hidden border border-primary/40 bg-black p-4"
              style={{ filter: 'drop-shadow(0 0 20px color-mix(in oklch, var(--primary) 30%, transparent))' }}
            >
              <img src={data.logoUrl} alt={data.name} className="h-full w-full object-contain" />
            </div>
          </div>
        ) : null}
        <div className="flex-1">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            {t('credits.overlayLabel')}
          </div>
          <h2 className="mb-4 font-mono text-4xl font-bold uppercase crt-flash-in" data-text={data.name}>
            {data.name}
          </h2>
          {data.description ? (
            <p className="leading-relaxed text-foreground/90">{data.description}</p>
          ) : null}
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-[44px] items-center font-mono text-xs uppercase tracking-wider text-primary hover:underline"
            >
              {t('credits.overlayLink')}
            </a>
          ) : null}
          {activeSocials.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
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
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
