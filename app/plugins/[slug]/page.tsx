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
    description: product.short_description ?? product.title + ' audio plugin by NEUROKLAST.',
  }
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) notFound()

  const releases = latestByChannel(product.releases)
  const displayedRelease = releases.find(release => release.channel === 'stable') ?? releases[0]
  const downloadAvailable = product.demo_downloads_enabled &&
    releases.some(release => release.artifacts.length > 0)
  const images = product.media.filter(item => item.kind === 'image' && item.url)
  const cover = images[0]
  const price = product.pricing_mode === 'paid' && product.sales_enabled
    ? await loadProductPriceForProduct(product.id)
    : null
  const salesOpen = isNeurokoreSalesEnabled() && product.sales_enabled &&
    product.pricing_mode === 'paid'

  return (
    <LegalPageShell>
      <div className="w-full bg-black text-white">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-5 pb-24 pt-20 sm:px-7 md:pt-28 lg:px-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
            <Link href="/" className="hover:text-white focus-visible:underline">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/plugins" className="hover:text-white focus-visible:underline">Plugins</Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-200">{product.title}</span>
          </nav>

          <header className={
            'overflow-hidden border border-white/15 bg-zinc-950 ' +
            (cover ? 'grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]' : '')
          }>
            <div className="flex min-w-0 flex-col justify-center gap-6 p-6 sm:p-9 lg:p-11">
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">NEUROKLAST AUDIO</p>
                <h1 className="break-words text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {product.title}
                </h1>
                {product.short_description && (
                  <p className="max-w-xl text-base leading-relaxed text-zinc-200 sm:text-lg">
                    {product.short_description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {downloadAvailable && (
                  <Link href={'/plugins/' + product.slug + '/download'}
                    className="inline-flex min-h-11 items-center justify-center border border-red-600 bg-red-700/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
                    {product.pricing_mode === 'free' ? 'Free download' : 'Download demo'}
                  </Link>
                )}
                {salesOpen && price && !price.recurring && (
                  <a href="#purchase" className="inline-flex min-h-11 items-center justify-center border border-white/40 px-5 py-3 text-sm font-semibold hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
                    Buy licence · {formatProductPrice(price)}
                  </a>
                )}
                <Link href="/#contact" className="inline-flex min-h-11 items-center justify-center px-2 py-3 text-sm text-zinc-300 underline underline-offset-4 hover:text-white">
                  Support
                </Link>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-4 text-sm text-zinc-400">
                {downloadAvailable && displayedRelease ? (
                  <p>Available build: {displayedRelease.version} ({CHANNEL_LABEL[displayedRelease.channel]})</p>
                ) : (
                  <p role="status">No public download is available yet.</p>
                )}
                {salesOpen && price && !price.recurring && (
                  <p>Price includes applicable taxes. Final amount is confirmed before payment.</p>
                )}
              </div>
            </div>
            {cover && (
              <figure className="flex min-h-60 flex-col justify-center border-t border-white/10 bg-black p-4 sm:p-6 lg:min-h-[400px] lg:border-l lg:border-t-0">
                <div className="flex aspect-[16/10] w-full items-center justify-center">
                  <CdnImage src={cover.url} alt={product.title + ' product image'}
                    widths={[480, 800, 1200]} sizes="(max-width: 1024px) 92vw, 46vw"
                    className="max-h-full w-full object-contain" priority />
                </div>
              </figure>
            )}
          </header>

          {salesOpen && price && !price.recurring && (
            <div id="purchase" className="scroll-mt-28">
              <PurchasePanel slug={product.slug} productTitle={product.title}
                price={formatProductPrice(price)} recurring={price.recurring} />
            </div>
          )}
          {salesOpen && price?.recurring && (
            <p role="status" className="border border-white/20 bg-zinc-950 p-5 text-zinc-300">
              Subscription checkout is not available yet. Contact us for current licensing options.
            </p>
          )}

          {product.description && (
            <section aria-labelledby="plugin-about" className="border border-white/10 bg-zinc-950/70 p-6 sm:p-9">
              <h2 id="plugin-about" className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">About {product.title}</h2>
              <p className="max-w-4xl whitespace-pre-line text-base leading-8 text-zinc-200">{product.description}</p>
            </section>
          )}

          {images.length > 1 && (
            <section aria-labelledby="plugin-gallery" className="space-y-4">
              <h2 id="plugin-gallery" className="text-2xl font-semibold tracking-tight">More images</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {images.slice(1, 5).map((item, index) => (
                  <figure key={item.url} className="flex aspect-[16/10] items-center justify-center border border-white/15 bg-zinc-950 p-3">
                    <CdnImage src={item.url} alt={product.title + ' image ' + (index + 2)}
                      widths={[480, 800, 1200]} sizes="(max-width: 640px) 92vw, 45vw"
                      className="h-full w-full object-contain" loading="lazy" />
                  </figure>
                ))}
              </div>
            </section>
          )}

          {product.features.length > 0 && (
            <section aria-labelledby="plugin-features" className="space-y-5">
              <h2 id="plugin-features" className="text-2xl font-semibold tracking-tight sm:text-3xl">Features</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {product.features.map(feature => (
                  <li key={feature.title} className="border border-white/10 bg-zinc-950 p-5 sm:p-6">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    {feature.body && <p className="mt-2 text-sm leading-7 text-zinc-300">{feature.body}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.pricing_mode === 'paid' && (
            <section aria-labelledby="plugin-licence" className="space-y-4 border border-white/10 bg-zinc-950 p-6 sm:p-9">
              <h2 id="plugin-licence" className="text-2xl font-semibold tracking-tight">Demo and licence</h2>
              <p className="max-w-3xl leading-relaxed text-zinc-300">
                {downloadAvailable
                  ? 'Try the published demo before purchasing. A valid licence unlocks the full version.'
                  : 'This plugin uses a licence for the full version. A public demo download is not available yet.'}
              </p>
              {product.slug === 'neurokore' && product.license_required && (
                <ul className="list-disc space-y-2 pl-5 text-zinc-300">
                  <li>One licence covers two device activations.</li>
                  <li>Activation requires a short internet connection.</li>
                  <li>Offline licence certificates can be renewed after 30 days.</li>
                </ul>
              )}
              <Link className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-400"
                href="/neurokore/account">Manage your licences</Link>
            </section>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {product.system_requirements.length > 0 && (
              <section aria-labelledby="plugin-requirements" className="space-y-4 border border-white/10 bg-zinc-950 p-6 sm:p-8">
                <h2 id="plugin-requirements" className="text-xl font-semibold">System requirements</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-300">
                  {product.system_requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
                </ul>
              </section>
            )}
            <section aria-labelledby="plugin-downloads" className="space-y-4 border border-white/10 bg-zinc-950 p-6 sm:p-8">
              <h2 id="plugin-downloads" className="text-xl font-semibold">Downloads and support</h2>
              <p className="text-sm leading-relaxed text-zinc-300">
                {downloadAvailable
                  ? 'Published builds, file sizes and checksums are available on the download page.'
                  : 'No public build has been published for download yet.'}
              </p>
              {downloadAvailable && (
                <Link className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-400"
                  href={'/plugins/' + product.slug + '/download'}>View available downloads</Link>
              )}
              <p className="text-sm text-zinc-400">Questions about installation, licences or refunds?</p>
              <Link className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-400"
                href="/#contact">Contact NEUROKLAST</Link>
            </section>
          </div>
        </div>
      </div>
    </LegalPageShell>
  )
}
