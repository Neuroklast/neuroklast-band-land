import type { Metadata } from 'next'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { BrowsePageShell } from '@/app/_components/public/BrowsePageShell'
import { MediaBrowseClient } from '@/app/_components/public/MediaBrowseClient'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { fetchPublicMediaDownloads } from '@/lib/public-fetch'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Media',
  description: 'Download photos, logos, documents and audio from Neuroklast.',
  alternates: { canonical: '/media' },
}

export const revalidate = 60

export default async function MediaBrowsePage() {
  let items = [] as Awaited<ReturnType<typeof fetchPublicMediaDownloads>>

  try {
    items = await fetchPublicMediaDownloads()
  } catch {
    // Safe defaults when Supabase is unavailable
  }

  const origin = getSiteOrigin()

  return (
    <LegalPageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl(origin, '/') },
          { name: 'Media', url: absoluteUrl(origin, '/media') },
        ])}
      />
      <BrowsePageShell titleKey="section.media" streamLabel="// MEDIA.DOWNLOADS">
        <MediaBrowseClient items={items} />
      </BrowsePageShell>
    </LegalPageShell>
  )
}
