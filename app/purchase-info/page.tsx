import { legalLanguageAlternates, localizedLegalPath } from '@/lib/legal-routes'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'

export const metadata = {
  title: 'Software Purchase Information',
  description: 'Payment, digital delivery, activation, withdrawal and consumer rights.',
  alternates: { canonical: localizedLegalPath('en', 'purchase-info'), languages: legalLanguageAlternates('purchase-info') },
}

export default function PurchaseInfoPage() {
  return <LegalPageShell><CommerceLegalContent document="purchase" /></LegalPageShell>
}
