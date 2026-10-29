import 'server-only'
import { parseNeurokoreGitHubReleases } from './github-releases'
import type { PublicRelease } from './releases'

/**
 * Loads cached public releases and preserves CMS downloads if GitHub fails.
 */
export async function loadNeurokoreGitHubReleases(): Promise<PublicRelease[]> {
  try {
    const response = await fetch('https://api.github.com/repos/Neuroklast/vst-releases/releases?per_page=40', {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'neuroklast.net' },
      next: { revalidate: 300, tags: ['neurokore-github-releases'] },
      signal: AbortSignal.timeout(5000), redirect: 'error',
    })
    if (!response.ok) return []
    return parseNeurokoreGitHubReleases(await response.json())
  } catch {
    return []
  }
}
