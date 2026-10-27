import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { loadPublicProduct } from '@/lib/plugins/public-catalog'
import { loadProductPriceForProduct, formatProductPrice } from '@/lib/plugins/price'
import { isPluginSaleOpen, isNeurokoreSandboxPreview } from '@/lib/neurokore/flags'
import { PurchasePanel } from '../PurchasePanel'
import { availablePublicDownload } from '@/lib/plugins/public-download'

export const metadata: Metadata = {
  title: 'Checkout | NEUROKLAST AUDIO',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

/**
 * Purchase is a separate deliberate step, never mixed into the product
 * marketing page. Existing Stripe endpoint handles all pricing and legal checks.
 */
export default async function PluginCheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product || !isPluginSaleOpen(product) || product.pricing_mode !== 'paid') notFound()
  const price = await loadProductPriceForProduct(product.id)
  if (!price || price.recurring) notFound()

  const image = product.media.find(item => item.kind === 'image' && item.url)
  const demoAvailable = availablePublicDownload(product) !== null
  const isSandbox = isNeurokoreSandboxPreview() && product.slug === 'neurokore'
  return (
    <LegalPageShell>
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-24 pt-24 sm:px-7 md:pt-32 lg:px-10">
          <nav aria-label="Checkout breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-400">
            <Link href="/plugins" className="hover:text-white">Plugins</Link>
            <span aria-hidden="true">/</span>
            <Link href={'/plugins/' + product.slug} className="hover:text-white">{product.title}</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white">Checkout</span>
          </nav>
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[.22em] text-red-400">NEUROKLAST AUDIO / CHECKOUT</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete your order</h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-300">
              Review your software licence, sign in if needed, then continue to Stripe's secure payment page.
            </p>
          </div>
          {isSandbox && (
            <div role="status" className="border-l-2 border-amber-600 bg-zinc-950 px-4 py-3 text-xs text-amber-200">
              Stripe Sandbox — simulated payment of {formatProductPrice(price)}. No real charge.
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.65fr)] lg:items-start">
            <aside className="space-y-5 border border-white/15 bg-zinc-950 p-5 sm:p-7">
              <Link href={'/plugins/' + product.slug} className="text-sm text-zinc-300 underline underline-offset-4 hover:text-white">
                ← Back to {product.title}
              </Link>
              {image && (
                <figure className="aspect-[16/10] overflow-hidden border border-white/10 bg-black">
                  <CdnImage src={image.url} alt={product.title + ' software'} widths={[320, 640, 960]}
                    sizes="(max-width: 1024px) 90vw, 36vw" className="h-full w-full object-contain" />
                </figure>
              )}
              <h2 className="text-xl font-bold">{product.title}</h2>
              {product.short_description && <p className="text-sm leading-7 text-zinc-300">{product.short_description}</p>}
              <div className="space-y-3 border-t border-white/15 pt-5 text-sm text-zinc-300">
                <p>One-time software licence — no subscription</p>
                <p>Licences and downloads are available in your customer account after payment.</p>
                {demoAvailable && <Link href={'/plugins/' + product.slug + '/download'}
                  className="inline-block underline underline-offset-4 hover:text-white">Try the demo before buying</Link>}
              </div>
            </aside>
            <PurchasePanel slug={product.slug} productTitle={product.title}
              price={formatProductPrice(price)} recurring={false} />
          </div>
        </div>
      </main>
    </LegalPageShell>
  )
}
