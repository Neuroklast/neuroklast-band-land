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
  let loadFailed = false

  try {
    ;[releases, artistName] = await Promise.all([
      fetchPublicReleaseCardItems(),
      fetchPublicArtistName(),
    ])
  } catch (error) {
    console.error('[releases] browse failed:', error)
    loadFailed = true
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
        {loadFailed ? (
          <p role="alert" className="p-5 text-sm text-zinc-300">The discography is temporarily unavailable. Please retry later.</p>
        ) : (
          <ReleasesBrowseClient releases={releases} artistName={artistName} />
        )}
      </BrowsePageShell>
    </LegalPageShell>
  )
}