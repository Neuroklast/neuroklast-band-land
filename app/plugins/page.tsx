import type { Metadata } from 'next'
import Link from 'next/link'
import { CdnImage } from '@/app/_components/public/CdnImage'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'
import { loadPublicCatalog } from '@/lib/plugins/public-catalog'
import { availablePublicDownload } from '@/lib/plugins/public-download'
import { CHANNEL_LABEL } from '@/lib/plugins/releases'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Audio plugins',
  description: 'Discover NEUROKLAST audio software, available plugin downloads, demos and licences.',
  alternates: { canonical: '/plugins' },
  openGraph: {
    title: 'NEUROKLAST AUDIO | Plugins',
    description: 'Audio plugins and software by NEUROKLAST.',
    type: 'website',
    url: 'https://neuroklast.net/plugins',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEUROKLAST AUDIO | Plugins',
    images: ['/og-image.png'],
  },
}

export default async function PluginsIndexPage() {
  const catalog = await loadPublicCatalog()
  return (
    <LegalPageShell>
      <section className="mx-auto w-full max-w-6xl space-y-9 px-5 pb-24 pt-20 text-white sm:px-7 md:pt-28 lg:px-10">
        <header className="space-y-3">
          <PublicBackLink />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">NEUROKLAST AUDIO</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Audio plugins</h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Explore our audio software. Published downloads and demos are available without an account.
          </p>
        </header>
        {catalog.length === 0 ? (
          <p className="border border-white/20 bg-zinc-950 p-6">No plugins are publicly listed yet.</p>
        ) : (
          <ul className="grid gap-5">
            {catalog.map(product => {
              const cover = product.media.find(item => item.kind === 'image' && item.url)
              const download = availablePublicDownload(product)
              return (
                <li key={product.id} className="grid overflow-hidden border border-white/15 bg-zinc-950 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
                  {cover ? (
                    <div className="flex aspect-[16/10] items-center justify-center bg-black p-3 sm:p-5 md:aspect-auto md:min-h-64">
                      <CdnImage src={cover.url} alt={product.title + ' image'}
                        widths={[400, 640, 960]} sizes="(max-width: 768px) 90vw, 42vw"
                        className="h-full w-full object-contain" loading="lazy" />
                    </div>
                  ) : (
                    <div className="flex min-h-48 items-center justify-center bg-black font-mono text-xs text-zinc-500">
                      Product preview unavailable
                    </div>
                  )}
                  <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
                    <h2 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">{product.title}</h2>
                    {product.short_description && (
                      <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">{product.short_description}</p>
                    )}
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                      {product.pricing_mode === 'free' ? 'Free plugin' : 'Licensed plugin'}
                      {download ? ' · ' + CHANNEL_LABEL[download.channel] + ' ' + download.version : ' · No public build yet'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link className="inline-flex min-h-11 items-center border border-white/40 px-5 py-3 text-sm font-semibold transition-colors hover:border-red-500"
                        href={'/plugins/' + product.slug}>View plugin</Link>
                      {download && (
                        <Link className="inline-flex min-h-11 items-center border border-red-600 bg-red-700/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-red-700/35"
                          href={'/plugins/' + product.slug + '/download'}>
                          {product.pricing_mode === 'free' ? 'Free download' : 'Download demo'}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </LegalPageShell>
  )
}
