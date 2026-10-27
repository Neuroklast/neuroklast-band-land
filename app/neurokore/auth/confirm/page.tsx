import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Confirm account sign-in | NEUROKLAST',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function ConfirmSignIn({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>
}) {
  const { token_hash: hash, type } = await searchParams
  const valid = typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash) && type === 'email'
  return (
    <LegalPageShell>
      <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center gap-6 px-6 py-24 text-white">
        <p className="font-mono text-xs font-bold uppercase tracking-[.26em] text-red-500">NK / NEUROKLAST AUDIO</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {valid ? 'Confirm your sign-in' : 'Sign-in link unavailable'}
        </h1>
        {valid ? (
          <section className="space-y-5 border border-white/20 bg-zinc-950 p-6 sm:p-8">
            <p className="leading-7 text-zinc-300">
              Confirm to access your licences, downloads and purchases. You only need to do this once for this link.
            </p>
            <form method="post" action="/api/neurokore/auth/confirm">
              <input type="hidden" name="token_hash" value={hash} />
              <input type="hidden" name="type" value="email" />
              <button className="min-h-12 w-full border border-red-600 bg-red-800/60 px-5 py-3 font-semibold text-white hover:bg-red-800">
                Sign in to my account
              </button>
            </form>
            <p className="text-xs leading-6 text-zinc-400">
              This extra confirmation protects your one-time email link from automatic email security scanners.
            </p>
          </section>
        ) : (
          <p className="text-zinc-300">This link is missing information or has expired. Request a new email to sign in.</p>
        )}
        <Link className="text-sm underline underline-offset-4 hover:text-red-400" href="/neurokore/account">
          Back to customer sign-in
        </Link>
      </main>
    </LegalPageShell>
  )
}
