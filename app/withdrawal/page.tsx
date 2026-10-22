import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { WithdrawalForm } from './WithdrawalForm'

export const metadata = {
  title: 'Vertrag widerrufen',
  description: 'Elektronische Widerrufserklärung für Online-Bestellungen bei NEUROKLAST.',
  robots: { index: true, follow: true },
}

export default function WithdrawalPage() {
  return (
    <LegalPageShell>
      <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-32 text-white">
        <h1 className="text-3xl font-semibold">Vertrag widerrufen</h1>
        <p>Hier kannst du gemäß § 356a BGB eine Widerrufserklärung zu einer Online-Bestellung übermitteln. Eine Anmeldung ist dafür nicht erforderlich.</p>
        <WithdrawalForm />
        <p className="text-sm text-white/70">
          Der Widerruf ist auch formlos möglich. Informationen zum gesetzlichen Widerrufsrecht findest du in unserer
          {' '}<Link href="/withdrawal-policy" className="underline">Widerrufsbelehrung</Link>.
        </p>
      </main>
    </LegalPageShell>
  )
}
