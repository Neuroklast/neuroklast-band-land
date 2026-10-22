import type { PublicProduct } from './releases'

type DescribedProduct = Pick<PublicProduct, 'title' | 'short_description' | 'description'>

export function pluginSeoDescription(product: DescribedProduct): string {
  const text = (product.short_description || product.description || '')
    .replace(/\s+/g, ' ').trim()
  if (!text) return `${product.title} audio software by NEUROKLAST. Features, requirements and available downloads.`
  if (text.length <= 160) return text
  const trimmed = text.slice(0, 157)
  const boundary = trimmed.lastIndexOf(' ')
  return (boundary >= 110 ? trimmed.slice(0, boundary) : trimmed).trimEnd() + '…'
}

export function pluginCanonicalPath(slug: string): string {
  return '/plugins/' + encodeURIComponent(slug)
}

export function pluginPreviewPath(slug: string): string {
  return pluginCanonicalPath(slug) + '/opengraph-image'
}

/** The media editor defines the primary product artwork by ordering: first image wins. */
export function pluginPrimaryImage(product: Pick<PublicProduct, 'media'>): string | null {
  return product.media.find((item) => item.kind === 'image' && Boolean(item.url.trim()))?.url ?? null
}
