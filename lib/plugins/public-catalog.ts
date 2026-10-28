import 'server-only'
import { db } from '@/lib/neurokore/server'
import { latestByChannel, parsePublicCatalog, type PublicProduct } from './releases'
import { mergePublicReleaseDownloads } from './github-releases'
import { loadNeurokoreGitHubReleases } from './github-releases-server'

/** Published products and release metadata only; no storage keys or secrets. */
export async function loadPublicCatalog(): Promise<PublicProduct[]> {
  try {
    const supabase = db()
    const { data, error } = await supabase.rpc('plugin_public_catalog')
    if (error) return []
    const products = parsePublicCatalog(data)
    if (!products.some(product => product.slug === 'neurokore' && product.demo_downloads_enabled)) return products
    const github = await loadNeurokoreGitHubReleases()
    if (!github.length) return products
    return products.map(product => product.slug === 'neurokore' && product.demo_downloads_enabled
      ? { ...product, releases: mergePublicReleaseDownloads(latestByChannel(product.releases), github) } : product)
  } catch {
    return []
  }
}

export async function loadPublicProduct(slug: string): Promise<PublicProduct | null> {
  const catalog = await loadPublicCatalog()
  return catalog.find((product) => product.slug === slug) ?? null
}
