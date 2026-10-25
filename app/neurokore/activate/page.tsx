import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'
import { OfflineActivate } from './OfflineActivate'

export const metadata = {
  title: 'Offline licence',
  robots: { index: false, follow: false },
}

export default function OfflineActivatePage() {
  return (
    <LegalPageShell>
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-32">
        <PublicBackLink />
        <h1 className="text-3xl font-bold">Offline licence file</h1>
        <p className="text-zinc-300">
          Create a <span className="font-mono">neurokore.lic</span> for a studio computer that cannot reach the internet.
          The key comes from <Link className="underline underline-offset-4" href="/neurokore/account">your account</Link>.
        </p>
        <OfflineActivate />
      </section>
    </LegalPageShell>
  )
}
