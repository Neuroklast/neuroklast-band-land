/** Client-side heuristic to infer a release type from its title. */

type ReleaseType = 'remix' | 'compilation' | 'ep' | 'single'

/**
 * Maps an internal release type value to its user-facing display label.
 * Each format has its own label so singles and EPs remain distinguishable.
 * Returns the raw value for any unknown input so callers can apply a fallback.
 */
export function displayReleaseType(type: string): string {
  switch (type) {
    case 'album':
      return 'Album'
    case 'ep': return 'EP'
    case 'single': return 'Single'
    case 'song': return 'Song'
    case 'remix':
      return 'Remix'
    case 'compilation':
      return 'Compilation'
    default:
      return type
  }
}

/**
 * Infers a release type from the given title string using keyword matching.
 * Returns undefined when no recognisable keyword is found — callers should
 * NOT fall back to 'album'; that requires track-count data only available
 * on the server.
 */
export function inferReleaseTypeFromTitle(title: string): ReleaseType | undefined {
  const lower = title.toLowerCase()

  if (
    lower.includes('remix') ||
    lower.includes('remixed') ||
    lower.includes('remixes') ||
    lower.includes('rmx')
  ) {
    return 'remix'
  }

  if (
    lower.includes('compilation') ||
    lower.includes('best of') ||
    lower.includes('greatest hits')
  ) {
    return 'compilation'
  }

  if (
    lower.includes(' ep') ||
    lower.includes('(ep)') ||
    lower.includes('- ep')
  ) {
    return 'ep'
  }

  if (lower.includes('single')) {
    return 'single'
  }

  return undefined
}
