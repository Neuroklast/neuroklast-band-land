import type { Metadata } from 'next'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { BrowsePageShell } from '@/app/_components/public/BrowsePageShell'
import { GigsBrowseClient } from '@/app/_components/public/GigsBrowseClient'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { fetchPublicArtistName, fetchPublicGigs } from '@/lib/public-fetch'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse all upcoming and past events with search and filters.',
  alternates: { canonical: '/gigs' },
}

export const revalidate = 60

export default async function GigsBrowsePage() {
  let gigs = [] as Awaited<ReturnType<typeof fetchPublicGigs>>
  let artistName = 'NEUROKLAST'

  try {
    ;[gigs, artistName] = await Promise.all([fetchPublicGigs(), fetchPublicArtistName()])
  } catch {
    // Safe defaults when Supabase is unavailable
  }

  const origin = getSiteOrigin()

  return (
    <LegalPageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl(origin, '/') },
          { name: 'Events', url: absoluteUrl(origin, '/gigs') },
        ])}
      />
      <BrowsePageShell titleKey="section.gigs" streamLabel="// EVENTS.BROWSE">
        <GigsBrowseClient gigs={gigs} artistName={artistName} />
      </BrowsePageShell>
    </LegalPageShell>
  )
}