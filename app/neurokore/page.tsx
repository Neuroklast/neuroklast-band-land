import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { formatNeurokorePrice, loadNeurokorePrice } from '@/lib/neurokore/price'
import { loadPublicReleases } from '@/lib/neurokore/public-releases'
import { latestByChannel } from '@/lib/neurokore/releases'
import { loadProductsSectionPublished } from '@/lib/products-visibility'

export const revalidate = 60

export async function generateMetadata() {
  if (!(await loadProductsSectionPublished())) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }
  return { title: 'NEUROKORE', description: 'NEUROKORE modular distortion and sound design plugin for Windows, macOS and Linux.' }
}

const FEATURES = [
  { title: 'Circuit View', body: 'Build and reorder a signal chain on a visual board, with input, output and sidechain routing.' },
  { title: 'Terminal View', body: 'Edit the same chain as text when you want exact control over every stage.' },
  { title: 'Nonlinear stages', body: 'Distortion, wave shaping and filters combined into one modular processing path.' },
  { title: 'Dynamics and modulation', body: 'Compression, sidechain behaviour and modulation blocks for movement and texture.' },
  { title: 'Six macros', body: 'Performance controls that move several parameters at once.' },
  { title: 'Factory presets', body: 'Presets for mix utilities alongside creative sound-design patches.' },
]

export default async function NeurokorePage() {
  if (!(await loadProductsSectionPublished())) notFound()
  const price = await loadNeurokorePrice()
  const releases = latestByChannel(await loadPublicReleases())
  const stable = releases.find((release) => release.channel === 'stable')
  const salesOpen = isNeurokoreSalesEnabled()

  return (
    <LegalPageShell>
      <section className="mx-auto max-w-4xl space-y-16 px-6 py-32">
        <header className="space-y-5">
          <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO</p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">NEUROKORE</h1>
          <p className="max-w-2xl text-xl">
            Modular distortion and sound design for heavy guitars, aggressive drums, industrial
            textures and animated bass.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex min-h-11 items-center border border-current px-5 py-3 font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              href="/neurokore/download"
            >
              Free Download
            </Link>
            {salesOpen && price ? (
              <Link
                className="inline-flex min-h-11 items-center border border-current/40 px-5 py-3 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                href="/neurokore/account"
              >
                Buy License — {formatNeurokorePrice(price)}
                {price.recurring ? ' / period' : ''}
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-11 items-center border border-current/40 px-5 py-3 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                href="/neurokore/account"
              >
                Licenses &amp; downloads
              </Link>
            )}
          </div>
          {salesOpen && price && <p className="text-sm opacity-70">Tax is calculated at checkout.</p>}
          <p className="text-sm opacity-70">
            {stable
              ? `Latest stable build: ${stable.version}.`
              : 'No public build has been published yet.'}
            {' '}Standalone, VST3 and Audio Unit availability depends on the published platform.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">What it does</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="border border-current/20 p-5">
                <h3 className="text-lg font-medium">{feature.title}</h3>
                <p className="mt-1 text-sm opacity-80">{feature.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 border border-current/30 p-6">
          <h2 className="text-2xl font-semibold">Try it for 14 days</h2>
          <p>
            Download without an account. The demo starts on first launch and includes the full
            feature set. After 14 days the wet signal is muted until you activate a license —
            presets, sessions and settings are kept.
          </p>
          <p>
            The demo and the full version use the same installer. Entering a license key in the
            plugin unlocks it immediately, without reinstalling.
          </p>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/neurokore/download">
            Download the demo
          </Link>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Licensing</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>One license covers two device activations.</li>
            <li>Activation needs a short internet connection.</li>
            <li>The signed license file works offline for up to 30 days and can be renewed.</li>
            <li>No network requests are made from the audio processing path.</li>
          </ul>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/neurokore/account">
            Manage your license
          </Link>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Downloads</h2>
          <p>Published builds for Windows, macOS and Linux are listed on the download page with version, file size and checksum.</p>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/neurokore/download">
            Open downloads
          </Link>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Frequently asked</h2>
          <dl className="space-y-4">
            <div><dt className="font-medium">Do I need an account for the demo?</dt><dd className="opacity-80">No. Downloads and the demo are open to everyone.</dd></div>
            <div><dt className="font-medium">What happens after 14 days?</dt><dd className="opacity-80">The wet signal is muted. You can activate a license at any time without reinstalling.</dd></div>
            <div><dt className="font-medium">Can I work offline?</dt><dd className="opacity-80">Yes. After activation the signed license is valid offline for up to 30 days, and you can import a license file manually.</dd></div>
            <div><dt className="font-medium">Can I move to another computer?</dt><dd className="opacity-80">You have two device activations per license. Contact support if you need a slot reset.</dd></div>
          </dl>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Support</h2>
          <p className="opacity-80">Questions about installation, licenses or refunds: use the contact form on this site.</p>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/#contact">Contact NEUROKLAST</Link>
        </section>
      </section>
    </LegalPageShell>
  )
}
