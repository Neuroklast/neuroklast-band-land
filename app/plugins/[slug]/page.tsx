import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { loadPublicProduct } from '@/lib/plugins/public-catalog'
import { formatProductPrice, loadProductPriceForProduct } from '@/lib/plugins/price'
import { CHANNEL_LABEL, latestByChannel } from '@/lib/plugins/releases'
import { isNeurokoreSalesEnabled } from '@/lib/neurokore/flags'
import { PurchasePanel } from './PurchasePanel'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) return { title: 'Not found', robots: { index: false, follow: false } }
  return {
    title: product.title,
    description: product.short_description ?? `${product.title} audio plugin by NEUROKLAST.`,
  }
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) notFound()
  const stable = latestByChannel(product.releases).find((release) => release.channel === 'stable')
  const price = product.pricing_mode === 'paid' && product.sales_enabled
    ? await loadProductPriceForProduct(product.id)
    : null
  const salesOpen = isNeurokoreSalesEnabled() && product.sales_enabled && product.pricing_mode === 'paid'

  return (
    <LegalPageShell>
      <section className="mx-auto max-w-4xl space-y-16 px-6 py-32">
        <header className="space-y-5">
          <div className="relative rounded border border-white/10 bg-black/40 p-6 md:p-10">
            <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO</p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">{product.title}</h1>
            {product.short_description && <p className="max-w-2xl text-xl">{product.short_description}</p>}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center border border-current px-5 py-3 font-medium hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                href={`/plugins/${product.slug}/download`}
              >
                {product.pricing_mode === 'free' ? 'Free Download' : 'Free Download (demo)'}
              </Link>
              {salesOpen && price && !price.recurring ? (
                <a className="inline-flex min-h-11 items-center border border-current/40 px-5 py-3 hover:opacity-80" href="#purchase">
                  Buy License — {formatProductPrice(price)}
                </a>
              ) : null}
            </div>
            {salesOpen && price && <p className="text-sm opacity-70">The displayed price includes applicable taxes. No physical shipping. The final total is confirmed in Stripe Checkout.</p>}
            <p className="text-sm opacity-70">
              {stable ? `Latest stable build: ${stable.version} (${CHANNEL_LABEL[stable.channel]}).` : 'No public build has been published yet.'}
            </p>
          </div>
        </header>

        {salesOpen && price && !price.recurring && (
          <div id="purchase" className="scroll-mt-32">
            <PurchasePanel slug={product.slug} productTitle={product.title}
              price={formatProductPrice(price)} recurring={price.recurring} />
          </div>
        )}
        {salesOpen && price?.recurring && (
          <p role="status" className="border border-white/20 p-4">
            Subscription checkout is not available yet. Contact us for current licensing options.
          </p>
        )}

        {product.media.some((item) => item.kind === 'image') && (
          <section className="grid gap-4 sm:grid-cols-2">
            {product.media.filter((item) => item.kind === 'image').slice(0, 4).map((item) => (
              <CdnImage key={item.url} src={item.url} alt={`${product.title} screenshot`}
                widths={[480, 800, 1200]} sizes="(max-width: 640px) 90vw, 45vw"
                className="w-full border border-current/20 object-cover" loading="lazy" />
            ))}
          </section>
        )}

        {product.description && (
          <section className="space-y-3 rounded border border-white/10 bg-black/40 p-6 md:p-8">
            <h2 className="text-3xl font-semibold">About</h2>
            <p className="whitespace-pre-line opacity-90">{product.description}</p>
          </section>
        )}

        {product.features.length > 0 && (
          <section className="space-y-6 rounded border border-white/10 bg-black/40 p-6 md:p-8">
            <h2 className="text-3xl font-semibold">Features</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li key={feature.title} className="border border-current/20 p-5">
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                  {feature.body && <p className="mt-1 text-sm opacity-80">{feature.body}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {product.pricing_mode === 'paid' && (
          <section className="space-y-3 border border-current/30 p-6">
            <h2 className="text-2xl font-semibold">Demo and licence</h2>
            <p>
              Download without an account and try {product.title} first. A licence unlocks the full
              version; the plugin stays installed.
            </p>
            {product.license_required && (
              <ul className="list-disc space-y-2 pl-5">
                <li>One licence covers two device activations.</li>
                <li>Activation needs a short internet connection.</li>
                <li>The signed licence file works offline for up to 30 days and can be renewed.</li>
              </ul>
            )}
            <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/neurokore/account">
              Manage your licence
            </Link>
          </section>
        )}

        {product.system_requirements.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">System requirements</h2>
            <ul className="list-disc space-y-1 pl-5 opacity-80">
              {product.system_requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
            </ul>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Downloads</h2>
          <p className="opacity-80">
            Published builds with version, file size and checksum are listed on the download page.
          </p>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href={`/plugins/${product.slug}/download`}>
            Open downloads
          </Link>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Support</h2>
          <p className="opacity-80">Questions about installation, licences or refunds: use the contact form on this site.</p>
          <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/#contact">Contact NEUROKLAST</Link>
        </section>
      </section>
    </LegalPageShell>
  )
}
