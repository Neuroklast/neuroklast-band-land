import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { BrandedVideoPlayer } from '@/components/BrandedVideoPlayer'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { loadPublicProduct } from '@/lib/plugins/public-catalog'
import { formatProductPrice, loadProductPriceForProduct } from '@/lib/plugins/price'
import { CHANNEL_LABEL } from '@/lib/plugins/releases'
import { availablePublicDownload } from '@/lib/plugins/public-download'
import { isPluginSaleOpen, isNeurokoreSandboxPreview, sandboxCheckoutBlocker } from '@/lib/neurokore/flags'
import { getApiSecret } from '@/lib/api-secrets'
import { JsonLd } from '@/app/_components/public/JsonLd'
import { getSiteOrigin } from '@/lib/og-share'
import { absoluteUrl, buildBreadcrumbSchema, buildSoftwareApplicationSchema } from '@/lib/structured-data'
import { pluginCanonicalPath, pluginPreviewPath, pluginPrimaryImage, pluginSeoDescription } from '@/lib/plugins/seo'
import { isLegacySupabaseStorageUrl } from '@/lib/r2'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) return { title: 'Not found', robots: { index: false, follow: false } }
  const description = pluginSeoDescription(product)
  const canonical = pluginCanonicalPath(slug)
  const preview = pluginPreviewPath(slug)
  return {
    title: product.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.title + ' | NEUROKLAST AUDIO',
      description,
      type: 'website',
      url: absoluteUrl(getSiteOrigin(), canonical),
      siteName: 'NEUROKLAST',
      images: [{ url: preview, width: 1200, height: 630, alt: product.title + ' by NEUROKLAST' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title + ' | NEUROKLAST AUDIO',
      description,
      images: [{ url: preview, alt: product.title + ' by NEUROKLAST' }],
    },
  }
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) notFound()

  const displayedRelease = availablePublicDownload(product)
  const downloadAvailable = displayedRelease !== null
  const images = product.media.filter(item => item.kind === 'image' && item.url)
  const videos = product.media.filter(item => item.kind === 'video' && item.url && !isLegacySupabaseStorageUrl(item.url))
  const audios = product.media.filter(item => item.kind === 'audio' && item.url && !isLegacySupabaseStorageUrl(item.url))
  const cover = images[0]
  const saleAllowed = isPluginSaleOpen(product)
  const price = product.pricing_mode === 'paid' && saleAllowed
    ? await loadProductPriceForProduct(product.id)
    : null
  const salesOpen = saleAllowed && product.pricing_mode === 'paid'
  const sandboxPreview = isNeurokoreSandboxPreview() && product.slug === 'neurokore'
  const sandboxBlocker = sandboxPreview ? sandboxCheckoutBlocker() : null
  const sandboxMailReady = sandboxPreview ? Boolean(await getApiSecret('resend_api_key')) : null
  const sandboxLicensingReady = sandboxPreview
    ? Boolean(process.env.NEUROKORE_KEY_ENCRYPTION_SECRET && process.env.NEUROKORE_SIGNING_PRIVATE_KEY)
    : null

  const canonicalUrl = absoluteUrl(getSiteOrigin(), pluginCanonicalPath(slug))
  const softwareSchema = buildSoftwareApplicationSchema({
    name: product.title,
    url: canonicalUrl,
    description: pluginSeoDescription(product),
    imageUrl: pluginPrimaryImage(product),
    version: displayedRelease?.version,
    downloadUrl: downloadAvailable ? canonicalUrl + '/download' : undefined,
    offer: product.pricing_mode === 'free' && downloadAvailable
      ? { amount: 0, currency: 'EUR' }
      : salesOpen && price && !price.recurring
        ? { amount: price.amount, currency: price.currency }
        : undefined,
  })
  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl(getSiteOrigin(), '/') },
    { name: 'Audio plugins', url: absoluteUrl(getSiteOrigin(), '/plugins') },
    { name: product.title, url: canonicalUrl },
  ])

  return (
    <LegalPageShell>
      <JsonLd data={[softwareSchema, breadcrumbs]} />
      <div className="w-full bg-black text-white">
        <div className="mx-auto w-full max-w-6xl space-y-10 px-5 pb-24 pt-20 sm:px-7 md:pt-28 lg:px-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
            <Link href="/" className="hover:text-white focus-visible:underline">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/plugins" className="hover:text-white focus-visible:underline">Plugins</Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-200">{product.title}</span>
          </nav>

          {sandboxPreview && (
            <section role="status" aria-label="Stripe Sandbox readiness"
              className="space-y-1 border-l-2 border-amber-700/70 bg-zinc-950 px-4 py-3 text-xs text-zinc-300">
              <p className="font-semibold text-amber-300">Preview / Stripe Sandbox – simulated payments only</p>
              {sandboxBlocker === 'invalid-stripe-key' ? (
                <p>Checkout locked: Preview must use a NEUROKLAST Stripe test secret key (sk_test_ or rk_test_), not a live key.</p>
              ) : sandboxBlocker === 'sales-disabled' ? (
                <p>Checkout locked: the Preview sales flag is off.</p>
              ) : sandboxBlocker === 'missing-price' ? (
                <p>Checkout locked: the EUR 1 sandbox Price ID is missing.</p>
              ) : !price ? (
                <p>Checkout locked: Stripe could not load the EUR 1 sandbox Price. Check the test key's account and permissions.</p>
              ) : (
                <p>Sandbox price verified: {formatProductPrice(price)}. No real charges.</p>
              )}
              {!sandboxLicensingReady && (
                <p>Licence fulfillment is not ready: the existing encryption and signing keys must be configured for this Preview branch.</p>
              )}
              {!sandboxMailReady && (
                <p>Purchase email is not ready: set a Resend API key for this Preview branch or provide access to the existing encrypted key.</p>
              )}
            </section>
          )}
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
                {salesOpen && price && !price.recurring && (
                  <Link href={"/plugins/" + product.slug + "/checkout"}
                    className="inline-flex min-h-11 items-center justify-center border border-red-600 bg-red-800/80 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
                    Buy {product.title} · {formatProductPrice(price)}
                  </Link>
                )}
                {downloadAvailable && (
                  <Link href={'/plugins/' + product.slug + '/download'}
                    className="inline-flex min-h-11 items-center justify-center border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500">
                    {product.pricing_mode === 'free' ? 'Free download' : 'Try free demo'}
                  </Link>
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

          {salesOpen && price?.recurring && (
            <p role="status" className="border border-white/20 bg-zinc-950 p-5 text-zinc-300">
              Subscription checkout is not available yet. Contact us for current licensing options.
            </p>
          )}

          {videos.length > 0 && (
            <section aria-labelledby="plugin-videos" className="space-y-4">
              <div className="space-y-2"><p className="font-mono text-xs uppercase tracking-[.2em] text-red-400">IN ACTION</p><h2 id="plugin-videos" className="text-2xl font-semibold tracking-tight sm:text-3xl">See and hear {product.title}</h2></div>
              <div className={videos.length === 1 ? "grid gap-4" : "grid gap-4 lg:grid-cols-2"}>
                {videos.map((item, index) => (
                  <figure key={item.url} className="mx-auto w-full max-w-5xl border border-white/15 bg-zinc-950 p-3 sm:p-5">
                    <BrandedVideoPlayer
                      src={item.url}
                      poster={cover?.url}
                      title={product.title + ' video ' + (index + 1)}
                      className="w-full"
                    />
                  </figure>
                ))}
              </div>
            </section>
          )}

          {product.description && (
            <section aria-labelledby="plugin-about" className="border border-white/10 bg-zinc-950/70 p-6 sm:p-9">
              <h2 id="plugin-about" className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">About {product.title}</h2>
              <p className="max-w-4xl whitespace-pre-line text-base leading-8 text-zinc-200">{product.description}</p>
            </section>
          )}

          {audios.length > 0 && (
            <section aria-labelledby="plugin-audio" className="space-y-4">
              <h2 id="plugin-audio" className="text-2xl font-semibold tracking-tight">Audio</h2>
              <div className="space-y-3">
                {audios.map((item, index) => (
                  <audio
                    key={item.url}
                    src={item.url}
                    controls
                    preload="none"
                    className="w-full"
                    aria-label={product.title + ' audio ' + (index + 1)}
                  />
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
              <div className="flex flex-col items-start gap-2">
                <Link className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-400"
                  href="/neurokore/account">Manage your licences</Link>
                {product.slug === 'neurokore' &&
                  <Link className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-red-400"
                    href="/neurokore/activate">Create an offline licence file</Link>}
              </div>
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
          {salesOpen && price && !price.recurring && (
            <section aria-labelledby="plugin-final-cta"
              className="flex flex-wrap items-center justify-between gap-5 border border-red-800/50 bg-zinc-950 p-6 sm:p-9">
              <div className="space-y-2">
                <h2 id="plugin-final-cta" className="text-2xl font-semibold">Ready to make it yours?</h2>
                <p className="text-sm leading-7 text-zinc-300">
                  {product.title} · {formatProductPrice(price)} · One-time purchase.
                  Your licence will be available in your account after payment.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={'/plugins/' + product.slug + '/checkout'}
                  className="inline-flex min-h-11 items-center justify-center border border-red-600 bg-red-800/80 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700">
                  Buy {product.title}
                </Link>
                {downloadAvailable && (
                  <Link href={'/plugins/' + product.slug + '/download'}
                    className="inline-flex min-h-11 items-center justify-center border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:border-red-500">
                    Try demo
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </LegalPageShell>
  )
}
