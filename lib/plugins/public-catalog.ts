import 'server-only'
import { createPublicClient } from '@/lib/supabaseServer'
import { parsePublicCatalog, type PublicProduct } from './releases'

/** Published products and release metadata only; no storage keys or secrets. */
export async function loadPublicCatalog(): Promise<PublicProduct[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase.rpc('plugin_public_catalog')
    if (error) return []
    return parsePublicCatalog(data)
  } catch {
    return []
  }
}

export async function loadPublicProduct(slug: string): Promise<PublicProduct | null> {
  const catalog = await loadPublicCatalog()
  return catalog.find((product) => product.slug === slug) ?? null
}
