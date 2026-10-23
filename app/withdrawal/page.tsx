import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'
import { WithdrawalForm } from './WithdrawalForm'
import { WithdrawalIntro } from './WithdrawalIntro'

export const metadata = {
  title: 'Vertrag widerrufen',
  description: 'Elektronische Widerrufserklärung für Online-Bestellungen bei NEUROKLAST.',
  robots: { index: true, follow: true },
}

export default function WithdrawalPage() {
  return (
    <LegalPageShell>
      <section className="mx-auto w-full max-w-4xl space-y-6 px-6 py-32 text-white">
        <PublicBackLink />
        <WithdrawalIntro />
        <WithdrawalForm />
        <p className="text-sm text-white/70"><Link href="/withdrawal-policy" className="underline">Withdrawal notice / Widerrufsbelehrung</Link></p>
      </section>
    </LegalPageShell>
  )
}
