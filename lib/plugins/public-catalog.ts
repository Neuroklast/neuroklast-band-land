import 'server-only'
import { db } from '@/lib/neurokore/server'
import { latestByChannel, parsePublicCatalog, type PublicProduct } from './releases'
import { mergePublicReleaseDownloads } from './github-releases'
import { loadNeurokoreGitHubReleases, loadPluginGitHubReleases } from './github-releases-server'

/** Published products and release metadata only; no storage keys or secrets. */
export async function loadPublicCatalog(): Promise<PublicProduct[]> {
  try {
    const supabase = db()
    const { data, error } = await supabase.rpc('plugin_public_catalog')
    if (error) return []
    const products = parsePublicCatalog(data)
    if (!products.some(product => ['neurokore', 'neurometer'].includes(product.slug) && product.demo_downloads_enabled)) return products
    const [neurokore, neurometer] = await Promise.all([
      products.some(product => product.slug === 'neurokore' && product.demo_downloads_enabled) ? loadNeurokoreGitHubReleases() : Promise.resolve([]),
      products.some(product => product.slug === 'neurometer' && product.demo_downloads_enabled) ? loadPluginGitHubReleases('neurometer') : Promise.resolve([]),
    ])
    return products.map(product => {
      if (!product.demo_downloads_enabled) return product
      const github = product.slug === 'neurokore' ? neurokore : product.slug === 'neurometer' ? neurometer : []
      return github.length ? { ...product, releases: mergePublicReleaseDownloads(latestByChannel(product.releases), github) } : product
    })
  } catch {
    return []
  }
}

export async function loadPublicProduct(slug: string): Promise<PublicProduct | null> {
  const catalog = await loadPublicCatalog()
  return catalog.find((product) => product.slug === slug) ?? null
}
