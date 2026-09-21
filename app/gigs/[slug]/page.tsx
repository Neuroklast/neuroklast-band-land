import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { GigDetailActions } from '@/app/_components/public/GigDetailActions'
import { GigStatusBadge } from '@/components/overlays/GigStatusBadge'
import { fetchPublicArtistName, fetchPublicGigs } from '@/lib/public-fetch'
import {
  eventDisplayName,
  formatGigLocation,
  gigHasClockTime,
  gigTypeLabel,
  mapGigRowToOverlayGig,
  type PublicGigRow,
} from '@/lib/gig-public-mapper'
import { buildGigSlugMap, findGigBySlug } from '@/lib/gig-slug'
import { formatIsoDateCompact, formatIsoDateLong } from '@/lib/format-display-date'
import { getSiteOrigin } from '@/lib/og-share'
import { sanitizeExternalHref } from '@/lib/sanitize-href'
import { absoluteUrl, buildBreadcrumbSchema, buildMusicEventSchema } from '@/lib/structured-data'

export const revalidate = 60

interface GigPageParams {
  params: Promise<{ slug: string }>
}

async function loadGig(slug: string): Promise<{ gig: PublicGigRow; artistName: string } | null> {
  const [gigs, artistName] = await Promise.all([fetchPublicGigs(), fetchPublicArtistName()])
  const gig = findGigBySlug(gigs, slug)
  return gig ? { gig, artistName } : null
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const gigs = await fetchPublicGigs()
    return Array.from(buildGigSlugMap(gigs).values()).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: GigPageParams): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadGig(slug)
  if (!loaded) return { title: 'Event' }

  const { gig } = loaded
  const headline = eventDisplayName(gig)
  const location = formatGigLocation(gig)
  const description =
    gig.description?.trim() ||
    [formatIsoDateLong(gig.event_date), location].filter(Boolean).join(' — ')

  return {
    title: `${headline} — ${formatIsoDateLong(gig.event_date)}`,
    description,
    alternates: { canonical: `/gigs/${slug}` },
    openGraph: {
      title: `${headline} — ${formatIsoDateLong(gig.event_date)}`,
      description,
      type: 'website',
      images: [{ url: `/share/gig/${gig.id}` }],
    },
  }
}

export default async function GigDetailPage({ params }: GigPageParams) {
  const { slug } = await params
  const loaded = await loadGig(slug)
  if (!loaded) notFound()

  const { gig, artistName } = loaded
  const headline = eventDisplayName(gig)
  const location = formatGigLocation(gig)
  const overlayGig = mapGigRowToOverlayGig(gig)
  const origin = getSiteOrigin()
  const canonicalUrl = absoluteUrl(origin, `/gigs/${slug}`)
  const ticketUrl = sanitizeExternalHref(gig.ticket_url)
  const typeLabel = gigTypeLabel(gig.gig_type)

  const eventSchema = buildMusicEventSchema({
    name: headline,
    startDate: gig.event_date,
    url: canonicalUrl,
    performerName: artistName,
    venueName: gig.venue,
    city: gig.city,
    country: gig.country,
    description: gig.description,
    ticketUrl: gig.ticket_url,
    imageUrl: overlayGig.photoUrl,
    cancelled: overlayGig.status === 'cancelled',
    soldOut: overlayGig.soldOut,
  })

  return (
    <LegalPageShell>
      <JsonLd
        data={[
          eventSchema,
          buildBreadcrumbSchema([
            { name: 'Home', url: absoluteUrl(origin, '/') },
            { name: 'Events', url: absoluteUrl(origin, '/gigs') },
            { name: headline, url: canonicalUrl },
          ]),
        ]}
      />
      <article className="mx-auto max-w-3xl px-card pt-[calc(var(--nk-nav-h)+1.5rem)] pb-section">
        <Link
          href="/gigs"
          className="mb-8 inline-flex min-h-[44px] items-center font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          ← All events
        </Link>

        <p className="data-label mb-3" data-theme-color="data-label">
          // EVENT.{formatIsoDateCompact(gig.event_date)}
        </p>

        <h1 className="mb-4 text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
          {headline}
        </h1>

        <GigStatusBadge status={gig.status} soldOut={gig.sold_out} eventDate={gig.event_date} />

        {overlayGig.photoUrl ? (
          <div className="mt-8 aspect-video overflow-hidden border border-border bg-muted">
            <CdnImage
              src={overlayGig.photoUrl}
              alt={headline}
              widths={[480, 768, 1200]}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-full w-full object-cover"
              priority
            />
          </div>
        ) : null}

        <dl className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Date</dt>
            <dd className="mt-1 text-foreground">{formatIsoDateLong(gig.event_date)}</dd>
            {gigHasClockTime(gig.event_date) ? (
              <dd className="mt-1 font-mono text-xs text-muted-foreground">Start time as announced</dd>
            ) : null}
          </div>
          {location ? (
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Location
              </dt>
              <dd className="mt-1 text-foreground">{location}</dd>
            </div>
          ) : null}
          {typeLabel ? (
            <div>
              <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Type
              </dt>
              <dd className="mt-1 text-foreground">{typeLabel}</dd>
            </div>
          ) : null}
        </dl>

        {gig.description?.trim() ? (
          <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
            {gig.description}
          </div>
        ) : null}

        {ticketUrl ? (
          <div className="mt-10">
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nk-os-btn nk-os-btn--fill inline-flex min-h-[44px] items-center px-6 py-3 tracking-[0.25em]"
            >
              Tickets
            </a>
          </div>
        ) : null}

        <GigDetailActions gig={overlayGig} artistName={artistName} shareUrl={canonicalUrl} />
      </article>
    </LegalPageShell>
  )
}
