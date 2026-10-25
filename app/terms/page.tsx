import { legalLanguageAlternates, localizedLegalPath } from '@/lib/legal-routes'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'
import { createPublicClient } from '@/lib/supabaseServer'
import { loadLegalConfig, DEFAULT_LEGAL_CONFIG } from '@/lib/legal-content'

export const revalidate = 60
export const metadata = {
  title: 'Terms and Conditions for Software | NEUROKLAST',
  description: 'Terms of sale and use for NEUROKLAST audio software.',
  alternates: { canonical: localizedLegalPath('en', 'terms'), languages: legalLanguageAlternates('terms') },
}

export default async function TermsPage() {
  let config = DEFAULT_LEGAL_CONFIG
  try { config = await loadLegalConfig(createPublicClient()) } catch { /* built-in terms */ }
  return <LegalPageShell><CommerceLegalContent document="terms" config={config} /></LegalPageShell>
}
