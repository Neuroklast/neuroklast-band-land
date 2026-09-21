import type { Metadata } from 'next'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { BrowsePageShell } from '@/app/_components/public/BrowsePageShell'
import { ReleasesBrowseClient } from '@/app/_components/public/ReleasesBrowseClient'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { fetchPublicArtistName, fetchPublicReleaseCardItems } from '@/lib/public-fetch'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Releases',
  description: 'Browse the full discography with search and filters.',
  alternates: { canonical: '/releases' },
}

export const revalidate = 60

export default async function ReleasesBrowsePage() {
  let releases = [] as Awaited<ReturnType<typeof fetchPublicReleaseCardItems>>
  let artistName = 'NEUROKLAST'

  try {
    ;[releases, artistName] = await Promise.all([
      fetchPublicReleaseCardItems(),
      fetchPublicArtistName(),
    ])
  } catch {
    // Safe defaults when Supabase is unavailable
  }

  const origin = getSiteOrigin()

  return (
    <LegalPageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl(origin, '/') },
          { name: 'Releases', url: absoluteUrl(origin, '/releases') },
        ])}
      />
      <BrowsePageShell titleKey="section.releases" streamLabel="// DISCOGRAPHY.BROWSE">
        <ReleasesBrowseClient releases={releases} artistName={artistName} />
      </BrowsePageShell>
    </LegalPageShell>
  )
}