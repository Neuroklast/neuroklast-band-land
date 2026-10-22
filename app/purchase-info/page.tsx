import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'

export const metadata = {
  title: 'Software Purchase Information',
  description: 'Payment, digital delivery, activation, withdrawal and consumer rights.',
  alternates: { canonical: '/purchase-info' },
}

export default function PurchaseInfoPage() {
  return <LegalPageShell><CommerceLegalContent document="purchase" /></LegalPageShell>
}
