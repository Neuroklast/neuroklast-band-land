
import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
export const metadata = { title: 'NEUROKORE', description: 'NEUROKORE audio plugin, licenses and downloads.' }
export const revalidate = 60
export default function NeurokorePage() {
  return <LegalPageShell><section className="mx-auto max-w-3xl space-y-8 px-6 py-32">
    <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO</p>
    <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">NEUROKORE</h1>
    <p className="text-xl">Build your own signal chain. An audio plugin for sound design and experimentation.</p>
    <p>Standalone, VST3 and Audio Unit. Check the release notes and supported systems before purchasing.</p>
    <div className="border border-current/30 p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Your plugin. Your license.</h2>
      <p>Sign in to purchase, retrieve your license key or download your build. Alpha testers receive a free key from NEUROKLAST.</p>
      <Link className="inline-flex min-h-11 items-center border border-current px-5 py-3" href="/neurokore/account">Licenses &amp; downloads</Link>
    </div>
    <p className="text-sm">Two devices per license. Activation requires internet access; signed activation files work offline for up to 30 days.
      Renew in the plugin with the same key. Alpha keys have an additional expiry date.</p>
  </section></LegalPageShell>
}
