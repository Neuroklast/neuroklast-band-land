import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabaseServer'
import { DEFAULT_LEGAL_CONFIG, loadLegalConfig, type LegalConfig } from '@/lib/legal-content'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PrivacyPolicyContent } from '@/app/_components/public/PrivacyPolicyContent'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data protection information for this website.',
  alternates: { canonical: '/privacy-policy' },
}

export const revalidate = 60

export default async function PrivacyPolicyPage() {
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
          { name: 'Privacy Policy', url: absoluteUrl(origin, '/privacy-policy') },
        ])}
      />
      <PrivacyPolicyContent config={config} />
    </LegalPageShell>
  )
}