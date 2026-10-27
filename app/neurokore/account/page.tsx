import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'
import { LicenseAccount } from './LicenseAccount'

export const metadata = {
  title: 'My licences | NEUROKLAST',
  robots: { index: false, follow: false },
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>
}) {
  const { auth } = await searchParams
  const failed = auth === 'expired' || auth === 'invalid'
  return (
    <LegalPageShell>
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-32">
        <PublicBackLink />
        <h1 className="text-3xl font-bold">My licences &amp; downloads</h1>
        {failed && (
          <p role="alert" className="border border-red-700/60 bg-red-950/20 p-4 text-sm leading-7 text-red-200">
            This sign-in link has expired or was already used. Request a new link below.
          </p>
        )}
        <p className="text-sm leading-7 text-zinc-300">
          Already signed in? Your NEUROKORE licences and activation keys appear here.
          Otherwise, request a one-time email link.
        </p>
        <LicenseAccount />
        <Link href="/plugins/neurokore#purchase"
          className="inline-block text-sm font-semibold text-zinc-200 underline underline-offset-4 hover:text-red-400">
          Return to NEUROKORE checkout
        </Link>
      </section>
    </LegalPageShell>
  )
}
