import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabaseServer'
import { DEFAULT_LEGAL_CONFIG, loadLegalConfig, type LegalConfig } from '@/lib/legal-content'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { LegalNoticeContent } from '@/app/_components/public/LegalNoticeContent'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Legal Notice',
  description: 'Legal notice and operator information for this website.',
  alternates: { canonical: '/legal-notice' },
}

export const revalidate = 60

export default async function LegalNoticePage() {
  let config: LegalConfig = DEFAULT_LEGAL_CONFIG

  try {
    const supabase = createPublicClient()
    config = await loadLegalConfig(supabase)
  } catch {
    // defaults
  }

  const origin = getSiteOrigin()

  return (
    <LegalPageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl(origin, '/') },
          { name: 'Legal Notice', url: absoluteUrl(origin, '/legal-notice') },
        ])}
      />
      <LegalNoticeContent config={config} />
    </LegalPageShell>
  )
}