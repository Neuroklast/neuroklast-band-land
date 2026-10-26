import { latestByChannel, type PublicRelease } from './releases'

/**
 * Only advertise a download once the public catalogue contains a published
 * artifact and the product owner has enabled anonymous demo/free downloads.
 */
export function availablePublicDownload(
  product: { demo_downloads_enabled: boolean; releases: readonly PublicRelease[] },
): PublicRelease | null {
  if (!product.demo_downloads_enabled) return null
  const releases = (product.releases.some(release => release.source === 'github')
    ? product.releases : latestByChannel(product.releases)).filter(release => release.artifacts.length > 0)
  return releases.find(release => release.channel === 'stable') ?? releases[0] ?? null
}
