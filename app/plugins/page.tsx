import Link from 'next/link'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { loadPublicCatalog } from '@/lib/plugins/public-catalog'
import { CHANNEL_LABEL, latestByChannel } from '@/lib/plugins/releases'

export const revalidate = 60

export const metadata = {
  title: 'Plugins',
  description: 'Audio plugins by NEUROKLAST: free downloads, demos and licences.',
}

export default async function PluginsIndexPage() {
  const catalog = await loadPublicCatalog()
  return (
    <LegalPageShell>
      <section className="mx-auto max-w-4xl space-y-10 px-6 py-32">
        <header className="space-y-3">
          <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Plugins</h1>
          <p className="max-w-2xl text-lg">
            Free downloads, demos and licences for every NEUROKLAST plugin. No account is needed to
            download and try a plugin.
          </p>
        </header>

        {catalog.length === 0 ? (
          <p className="border border-current/30 p-6">No plugin has been published yet.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {catalog.map((product) => {
              const stable = latestByChannel(product.releases).find((release) => release.channel === 'stable')
              return (
                <li key={product.id} className="border border-current/30 p-6">
                  <h2 className="text-2xl font-semibold">{product.title}</h2>
                  {product.short_description && <p className="mt-2 opacity-80">{product.short_description}</p>}
                  <p className="mt-3 font-mono text-xs uppercase tracking-widest opacity-70">
                    {product.pricing_mode === 'free' ? 'Free' : 'Paid'}
                    {stable ? ` · ${CHANNEL_LABEL[stable.channel]} ${stable.version}` : ' · no public build yet'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link className="inline-flex min-h-11 items-center border border-current px-4 py-2 text-sm hover:opacity-80"
                      href={`/plugins/${product.slug}`}>
                      Details
                    </Link>
                    <Link className="inline-flex min-h-11 items-center border border-current/40 px-4 py-2 text-sm hover:opacity-80"
                      href={`/plugins/${product.slug}/download`}>
                      Download
                    </Link>
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
