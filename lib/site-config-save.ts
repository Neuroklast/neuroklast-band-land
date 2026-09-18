const CONFIG_STORAGE_PATH_KEYS: Record<string, string[]> = {
  background: ['storage_path', 'video_storage_path', 'video_mobile_storage_path'],
  appearance: ['faviconStoragePath'],
  hero: ['logoImageStoragePath', 'backgroundImageStoragePath', 'titleImageStoragePath'],
  loadingScreen: ['logoStoragePath'],
}

export function isBundledOrLocalMediaPath(path: string): boolean {
  const trimmed = path.trim()
  return (
    trimmed.startsWith('/brand/') ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('brand/') ||
    trimmed.startsWith('assets/')
  )
}

export function mergeSiteConfigValue(existing: unknown, incoming: unknown): unknown {
  if (Array.isArray(incoming)) return incoming
  if (!incoming || typeof incoming !== 'object') return incoming
  if (!existing || typeof existing !== 'object' || Array.isArray(existing)) return incoming

  const merged: Record<string, unknown> = { ...(existing as Record<string, unknown>) }
  for (const [key, value] of Object.entries(incoming as Record<string, unknown>)) {
    if (value === null) {
      delete merged[key]
    } else {
      merged[key] = value
    }
  }
  return merged
}

function terminalFilePaths(value: unknown): string[] {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
  const commands = Array.isArray(source.commands) ? source.commands : []
  return commands
    .map((cmd) =>
      cmd && typeof cmd === 'object' && typeof (cmd as { fileStoragePath?: unknown }).fileStoragePath === 'string'
        ? (cmd as { fileStoragePath: string }).fileStoragePath.trim()
        : '',
    )
    .filter(Boolean)
}

export function replacedConfigStoragePaths(
  key: string,
  previous: unknown,
  next: unknown,
): string[] {
  if (key === 'terminal') {
    const prevPaths = new Set(terminalFilePaths(previous))
    const nextPaths = new Set(terminalFilePaths(next))
    return [...prevPaths].filter((path) => !nextPaths.has(path) && !isBundledOrLocalMediaPath(path))
  }
  const fields = CONFIG_STORAGE_PATH_KEYS[key]
  if (!fields) return []
  const prevObj =
    previous && typeof previous === 'object' && !Array.isArray(previous)
      ? (previous as Record<string, unknown>)
      : {}
  const nextObj =
    next && typeof next === 'object' && !Array.isArray(next)
      ? (next as Record<string, unknown>)
      : {}

  const paths: string[] = []
  for (const field of fields) {
    const oldPath = prevObj[field]
    const newPath = nextObj[field]
    if (typeof oldPath !== 'string' || !oldPath.trim()) continue
    if (isBundledOrLocalMediaPath(oldPath)) continue
    if (oldPath === newPath) continue
    paths.push(oldPath.trim())
  }
  return paths
}
