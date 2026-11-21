import { notFound } from 'next/navigation'
import { LegalPageShell } from '@/app/_components/public/LegalPageShell'
import { PublicBackLink } from '@/app/_components/public/PublicBackLink'
import { loadPublicProduct } from '@/lib/plugins/public-catalog'
import { availablePublicDownload } from '@/lib/plugins/public-download'
import { pluginCanonicalPath, pluginPreviewPath } from '@/lib/plugins/seo'
import {
  CHANNEL_LABEL,
  PACKAGE_LABEL,
  PLATFORM_META,
  artifactsByPlatform,
  formatBytes,
  latestByChannel,
  type PublicRelease,
} from '@/lib/plugins/releases'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) return { title: 'Not found', robots: { index: false, follow: false } }
  const available = availablePublicDownload(product)
  const productPath = pluginCanonicalPath(slug)
  return {
    title: `Download ${product.title}`,
    description: available
      ? `Get the available ${product.title} audio plugin builds, version details and checksums.`
      : `Download status and release information for ${product.title}.`,
    robots: available ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: available ? productPath + '/download' : productPath },
    openGraph: {
      title: `Download ${product.title} | NEUROKLAST AUDIO`,
      description: available ? `Available downloads for ${product.title}.` : `${product.title} release information.`,
      images: [{ url: pluginPreviewPath(slug), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [pluginPreviewPath(slug)] },
  }
}

function releaseDate(release: PublicRelease): string | null {
  return release.published_at
    ? new Date(release.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
    : null
}

function DownloadCard({ slug, release }: { slug: string; release: PublicRelease }) {
  const groups = artifactsByPlatform(release)
  const date = releaseDate(release)
  return (
    <article className="border border-current/30 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-semibold">Version {release.version}</h2>
        <span className="font-mono text-xs uppercase tracking-widest">{CHANNEL_LABEL[release.channel]} channel</span>
      </div>
      {date && <p className="mt-1 text-sm opacity-70">Published {date}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {groups.map(({ platform, artifacts }) => (
          <div key={platform} className="border border-current/20 p-4">
            <h3 className="text-lg font-medium">{PLATFORM_META[platform].label}</h3>
            <p className="mt-1 text-sm opacity-70">
              {artifacts.map((artifact) => PACKAGE_LABEL[artifact.package_type]).join(', ')}
            </p>
            <ul className="mt-3 space-y-3">
              {artifacts.map((artifact) => (
                <li key={artifact.package_type}>
                  <a
                    className="inline-flex min-h-11 items-center border border-current px-4 py-2 text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    href={`/api/plugins/${slug}/download?platform=${platform}&channel=${release.channel}&package=${artifact.package_type}`}
                  >
                    Download {PACKAGE_LABEL[artifact.package_type]}
                  </a>
                  <details className="mt-2 text-xs opacity-70">
                    <summary className="cursor-pointer">File details</summary>
                    <dl className="mt-2 space-y-1 font-mono">
                      <div><dt className="inline">File: </dt><dd className="inline break-all">{artifact.filename}</dd></div>
                      <div><dt className="inline">Size: </dt><dd className="inline">{formatBytes(artifact.filesize_bytes)}</dd></div>
                      <div><dt className="inline">SHA-256: </dt><dd className="inline break-all">{artifact.sha256}</dd></div>
                      <div><dt className="inline">Signature: </dt><dd className="inline">{artifact.signing_status === 'unverified' ? 'Not independently verified' : artifact.signing_status}</dd></div>
                    </dl>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {(release.changelog || release.release_notes) && (
        <details className="mt-5 border-t border-current/20 pt-4">
          <summary className="cursor-pointer text-sm font-medium">Release notes</summary>
          {release.changelog && <p className="mt-3 whitespace-pre-line text-sm opacity-80">{release.changelog}</p>}
          {release.release_notes && <p className="mt-3 whitespace-pre-line text-sm opacity-80">{release.release_notes}</p>}
        </details>
      )}
    </article>
  )
}

export default async function PluginDownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await loadPublicProduct(slug)
  if (!product) notFound()
  const releases = product.releases.some(release => release.source === 'github') ? product.releases : latestByChannel(product.releases)
  const stable = releases.filter((release) => release.channel === 'stable')
  const others = releases.filter((release) => release.channel !== 'stable')

  return (
    <LegalPageShell>
      <section className="mx-auto max-w-4xl space-y-8 px-6 py-32">
        <header className="space-y-3">
          <PublicBackLink href={pluginCanonicalPath(product.slug)} label={product.title} />
          <p className="font-mono text-sm tracking-widest">NEUROKLAST AUDIO</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Download {product.title}</h1>
          <p className="max-w-2xl text-lg">
            {product.pricing_mode === 'free'
              ? 'Free to download and use. No account and no licence key are needed.'
              : 'No account is needed to download and try the demo. The same installer unlocks with a licence later.'}
          </p>
        </header>

        {stable.length ? (
          stable.map(release => <DownloadCard key={release.id} slug={product.slug} release={release} />)
        ) : (
          <p className="border border-current/30 p-6">
            There is no published build for the stable channel yet. Check back soon.
          </p>
        )}

        {others.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Pre-release channels</h2>
            {others.map((release) => <DownloadCard key={release.id} slug={product.slug} release={release} />)}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Installing</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Download the package for your operating system.</li>
            <li>Run the installer and choose the plugin formats you use.</li>
            <li>Open {product.title} in your host or as a standalone application.</li>
            {product.license_required && <li>Activate a licence from the plugin when you have one.</li>}
          </ol>
          <p className="text-sm opacity-70">
            Supported operating systems and host formats are listed with each published release. No build is
            shown here before it has been validated and published.
          </p>
        </section>

        {product.license_required && (
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Demo and licence</h2>
            <p>{product.title} can be tried before buying. After that the full version is unlocked with a licence; presets and session settings are kept.</p>
            <p><a className="underline underline-offset-4"
              href={product.slug === 'neurokore' ? '/neurokore/account' : '/#contact'}>
              {product.slug === 'neurokore' ? 'Manage your licence and downloads' : 'Licensing and account support'}
            </a></p>
          </section>
        )}
      </section>
    </LegalPageShell>
  )
}
