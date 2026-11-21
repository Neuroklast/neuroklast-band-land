import 'server-only'
import { parsePluginGitHubReleases, type OfficialPluginSlug } from './github-releases'
import type { PublicRelease } from './releases'

/**
 * Loads cached public releases and preserves CMS downloads if GitHub fails.
 */
export async function loadPluginGitHubReleases(slug: OfficialPluginSlug): Promise<PublicRelease[]> {
  try {
    const response = await fetch('https://api.github.com/repos/Neuroklast/vst-releases/releases?per_page=100', {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'neuroklast.net' },
      next: { revalidate: 300, tags: [`${slug}-github-releases`] },
      signal: AbortSignal.timeout(5000), redirect: 'error',
    })
    if (!response.ok) return []
    return parsePluginGitHubReleases(await response.json(), slug)
  } catch {
    return []
  }
}

export const loadNeurokoreGitHubReleases = (): Promise<PublicRelease[]> => loadPluginGitHubReleases('neurokore')
