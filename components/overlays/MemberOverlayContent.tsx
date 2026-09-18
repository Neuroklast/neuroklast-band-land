import { Button } from '@/components/ui/button'
import { InstagramLogo } from '@phosphor-icons/react'
import type { Member } from '@/lib/app-types'
import type { DecorativeTexts } from '@/lib/types'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import {
  OverlayFrame,
  OverlayItem,
  OverlayReveal,
  OverlayScanImage,
} from '@/components/motion/overlay-motion'

interface MemberOverlayContentProps {
  data: Member
  decorativeTexts?: DecorativeTexts
  closing?: boolean
}

export function MemberOverlayContent({ data, decorativeTexts, closing }: MemberOverlayContentProps) {
  const profileLabel = decorativeTexts?.memberProfileLabel ?? '// MEMBER.PROFILE'
  return (
    <OverlayReveal
      data-theme-color="card card-foreground border"
      className="space-y-6"
      closing={closing}
      stagger={0.04}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {data.image ? (
          <OverlayItem
            className="relative h-40 w-40 shrink-0 overflow-hidden bg-muted sm:h-48 sm:w-48"
            variant="slideLeft"
            delay={0}
          >
            <OverlayScanImage
              src={data.image}
              alt={data.name}
              className="h-full w-full object-cover"
            />
            <OverlayFrame />
          </OverlayItem>
        ) : null}
        <div className="min-w-0 flex-1">
          <OverlayItem delay={0.05}>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
              {profileLabel}
            </div>
          </OverlayItem>
          <OverlayItem delay={0.1}>
            <h2
              className="mb-2 font-mono text-2xl font-bold uppercase crt-flash-in sm:text-4xl"
              data-text={data.name}
            >
              {data.name}
            </h2>
          </OverlayItem>
          {data.role ? (
            <OverlayItem delay={0.16}>
              <p className="mb-4 font-mono text-base text-muted-foreground sm:text-xl">{data.role}</p>
            </OverlayItem>
          ) : null}
          {data.bio ? (
            <OverlayItem delay={0.22}>
              <p className="leading-relaxed text-foreground/90">{data.bio}</p>
            </OverlayItem>
          ) : null}
          {data.instagram ? (
            <OverlayItem delay={0.3}>
              <Button asChild variant="outline" className="mt-4 font-mono">
                <a href={sanitizeExternalHref(data.instagram)} target="_blank" rel="noopener noreferrer">
                  <InstagramLogo className="mr-2 h-5 w-5" weight="fill" />
                  Follow
                </a>
              </Button>
            </OverlayItem>
          ) : null}
        </div>
      </div>
    </OverlayReveal>
  )
}
