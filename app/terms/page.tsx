import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'

export const metadata = {
  title: 'Terms and Conditions for Software',
  description: 'Terms of sale, digital fulfilment, consumer rights and software licensing.',
  alternates: { canonical: '/terms' },
}
export default function TermsPage() {
  return <LegalPageShell><CommerceLegalContent document="terms" /></LegalPageShell>
}
