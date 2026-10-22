import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CommerceLegalContent } from '@/app/_components/public/CommerceLegalContent'

export const metadata = {
  title: 'Audio Software Licence Terms',
  description: 'NEUROKLAST audio software usage, activation, updates and consumer rights.',
  alternates: { canonical: '/license-terms' },
}

export default function LicenseTermsPage() {
  return <LegalPageShell><CommerceLegalContent document="license" /></LegalPageShell>
}
