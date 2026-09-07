'use client'

import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { useLocale } from '@/contexts/LocaleContext'
import { useOverlay } from '@/contexts/OverlayContext'
import { asDisplayString } from '@/lib/safe-string'
import { resolveSectionHeading } from '@/lib/section-display'
import { SectionWrapper, SectionHeading, SectionIntro } from './SectionWrapper'

export interface PublicMember {
  id: string
  name: string
  role: string | null
  bio: string | null
  photoUrl: string | null
}

interface BioSectionProps {
  /** Biography body text from Supabase `bio.content`. Non-strings are coerced safely. */
  content: string | null | undefined
  heading?: string
  intro?: string
  bodyFontSize?: string
  readMoreMaxHeight?: string
  members?: PublicMember[]
  /** Achievements list shown as a block inside the Biography section. */
  achievements?: string[]
  /** Collaborations list shown as a block inside the Biography section. */
  collabs?: string[]
}

function asStringList(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : []
}

export function BioSection({
  content,
  heading,
  intro,
  bodyFontSize,
  readMoreMaxHeight,
  members = [],
  achievements = [],
  collabs = [],
}: BioSectionProps) {
  const { t } = useLocale()
  const { openOverlay } = useOverlay()
  const title = resolveSectionHeading(heading, 'bio', t)
  const [expanded, setExpanded] = useState(false)
  // Never call .trim() on non-strings — that threw and tripped SectionErrorBoundary
  const safeContent = asDisplayString(content)
  const hasContent = safeContent.trim().length > 0
  const displayContent = hasContent ? safeContent : t('bio.empty')

  const bioTextClass =
    typeof bodyFontSize === 'string' && bodyFontSize.trim() ? bodyFontSize : 'text-lg'
  const maxH =
    typeof readMoreMaxHeight === 'string' && readMoreMaxHeight.trim()
      ? readMoreMaxHeight
      : '280px'
  // Always show full content when short or expanded — avoid mask making text look "invisible"
  const clampCollapsed = hasContent && !expanded

  return (
    <SectionWrapper id="bio" data-theme-color="foreground muted-foreground card border">
      <SectionHeading sectionId="bio" dataText={title}>{title}</SectionHeading>
      <SectionIntro sectionId="bio">{intro}</SectionIntro>

      <div
        className={`overflow-hidden whitespace-pre-wrap font-light ${bioTextClass} text-muted-foreground leading-relaxed`}
        style={{
          fontFamily: 'var(--font-body, inherit)',
          maxHeight: clampCollapsed ? maxH : 'none',
          maskImage: clampCollapsed
            ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
            : 'none',
          WebkitMaskImage: clampCollapsed
            ? 'linear-gradient(to bottom, black 60%, transparent 100%)'
            : 'none',
          transition:
            'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), mask-image 0.3s ease, -webkit-mask-image 0.3s ease',
        }}
      >
        {displayContent}
      </div>

      {hasContent ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="cyber-border hover-glitch inline-flex min-h-[44px] items-center gap-2 px-4 py-2 font-mono"
          >
            {expanded ? (
              <>
                <CaretUp className="h-4 w-4" aria-hidden />
                {t('bio.showLess')}
              </>
            ) : (
              <>
                <CaretDown className="h-4 w-4" aria-hidden />
                {t('bio.readMore')}
              </>
            )}
          </button>
        </div>
      ) : null}

      {asStringList(achievements).length > 0 || asStringList(collabs).length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {asStringList(achievements).length > 0 ? (
            <div>
              <h3 className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-primary">
                {t('bio.achievements')}
              </h3>
              <ul className="space-y-2">
                {asStringList(achievements).map((item) => (
                  <li key={item} className="font-mono text-xs leading-relaxed text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {asStringList(collabs).length > 0 ? (
            <div>
              <h3 className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-primary">
                {t('bio.collabs')}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {asStringList(collabs).map((item) => (
                  <li key={item} className="cyber-border px-3 py-1 font-mono text-xs text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {members.length > 0 ? (
        <div className="mt-12">
          <h3 className="mb-6 font-mono text-sm uppercase tracking-[0.3em] text-primary">
            {t('bio.members')}
          </h3>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {members.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  className="cyber-border group w-full cursor-pointer bg-card/40 p-3 text-left"
                  onClick={() =>
                    openOverlay({
                      type: 'member',
                      data: {
                        id: member.id,
                        name: member.name,
                        role: member.role ?? '',
                        bio: member.bio ?? '',
                        image: member.photoUrl ?? undefined,
                      },
                    })
                  }
                  aria-label={`Open ${member.name}`}
                >
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt=""
                      className="mb-3 aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="mb-3 aspect-square w-full bg-secondary" />
                  )}
                  <p className="font-mono text-sm uppercase tracking-wider text-foreground">{member.name}</p>
                  {member.role ? (
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {member.role}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionWrapper>
  )
}