import { legalLanguageAlternates, localizedLegalPath } from '@/lib/legal-routes'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'
import { createPublicClient } from '@/lib/supabaseServer'
import { loadLegalConfig, DEFAULT_LEGAL_CONFIG } from '@/lib/legal-content'

export const revalidate = 60
export const metadata = {
  title: 'Right of Withdrawal for Digital Content',
  description: 'Legal withdrawal period, refunds and electronic withdrawal notice for software.',
  alternates: { canonical: localizedLegalPath('en', 'withdrawal-policy'), languages: legalLanguageAlternates('withdrawal-policy') },
}

export default async function WithdrawalPolicyPage() {
  let config = DEFAULT_LEGAL_CONFIG
  try { config = await loadLegalConfig(createPublicClient()) } catch { /* retain fallback */ }
  return <LegalPageShell><CommerceLegalContent document="withdrawal" config={config} /></LegalPageShell>
}
