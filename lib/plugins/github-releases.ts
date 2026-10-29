import { z } from 'zod'
import { publicReleaseSchema, type PackageType, type Platform, type PublicArtifact, type PublicRelease } from './releases'

const versionPattern = /^v?(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)(?:[.-](\d+))?)?$/
const releaseSchema = z.object({
  id: z.number().int().positive().max(0xffffffffffff),
  tag_name: z.string().max(64),
  draft: z.literal(false),
  prerelease: z.boolean(),
  published_at: z.iso.datetime(),
  body: z.string().nullable().optional(),
  assets: z.array(z.object({ name: z.string(), size: z.number().int().positive(), state: z.literal('uploaded'),
    digest: z.string(), browser_download_url: z.string() })).max(100),
})

function versionParts(version: string): number[] | null {
  const match = versionPattern.exec(version)
  if (!match) return null
  const stage = match[4] === 'alpha' ? 0 : match[4] === 'beta' ? 1 : match[4] === 'rc' ? 2 : 3
  const parts = [Number(match[1]), Number(match[2]), Number(match[3]), stage, Number(match[5] ?? 0)]
  return parts.every(Number.isSafeInteger) ? parts : null
}

/**
 * Compares supported plugin versions, including alpha, beta and RC stages.
 */
export function comparePluginVersions(left: string, right: string): number {
  const a = versionParts(left), b = versionParts(right)
  if (!a || !b) return 0
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return Math.sign(a[index] - b[index])
  }
  return 0
}

/**
 * Honors the channel on legacy CMS versions that omit a prerelease suffix.
 */
export function comparePublicReleaseVersions(left: Pick<PublicRelease, 'version' | 'channel'>, right: Pick<PublicRelease, 'version' | 'channel'>): number {
  const normalized = (release: Pick<PublicRelease, 'version' | 'channel'>) =>
    release.channel !== 'stable' && /^\d+\.\d+\.\d+$/.test(release.version)
      ? `${release.version}-${release.channel}` : release.version
  return comparePluginVersions(normalized(left), normalized(right))
}

function assetUrl(version: string, filename: string): string {
  return `https://github.com/Neuroklast/vst-releases/releases/download/neurokore-v${version}/${filename}`
}

/**
 * Selects complete public NEUROKORE releases without trusting external URLs.
 */
export function parseNeurokoreGitHubReleases(value: unknown): PublicRelease[] {
  if (!Array.isArray(value)) return []
  const releases: PublicRelease[] = []
  for (const input of value) {
    const parsed = releaseSchema.safeParse(input)
    if (!parsed.success) continue
    const item = parsed.data
    if (!item.tag_name.startsWith('neurokore-v') || !versionParts(item.tag_name.slice('neurokore-'.length))) continue
    const version = item.tag_name.slice('neurokore-v'.length)
    if (item.prerelease !== version.includes('-')) continue
    const artifact = (filename: string, packageType: PackageType): PublicArtifact | null => {
      const find = (name: string) => {
        const matches = item.assets.filter(asset => asset.name === name)
        const asset = matches[0]
        return matches.length === 1 && asset && asset.size <= 524288000 && /^sha256:[\da-f]{64}$/i.test(asset.digest)
          && asset.browser_download_url === assetUrl(version, name) ? asset : null
      }
      const file = find(filename)
      if (!file || !find(filename + '.sha256')) return null
      return { platform: 'windows-x64', architecture: 'x64', package_type: packageType, filename,
        filesize_bytes: file.size, sha256: file.digest.slice(7).toLowerCase(), signing_status: 'unverified' }
    }
    const installer = artifact(`NEUROKORE-${version}-Setup.exe`, 'installer')
    if (!installer) continue
    const bundle = artifact(`NEUROKORE-${version}-win64.zip`, 'bundle')
    releases.push(publicReleaseSchema.parse({ source: 'github',
      id: `d7680219-83f1-4c18-a000-${item.id.toString(16).padStart(12, '0')}`, version,
      channel: version.includes('-alpha') ? 'alpha' : version.includes('-') ? 'beta' : 'stable',
      title: `NEUROKORE ${version}`, changelog: null, release_notes: item.body?.replace(/<!-- neurokore-source-commit:[0-9a-f]{40} -->\s*/g, '').slice(0, 12000) || null,
      published_at: item.published_at, artifacts: bundle ? [installer, bundle] : [installer] }))
  }
  return mergePublicReleaseDownloads([], releases)
}

/**
 * Preserves the latest download for each channel, platform and package type.
 */
export function mergePublicReleaseDownloads(cms: readonly PublicRelease[], github: readonly PublicRelease[]): PublicRelease[] {
  const slots = new Set<string>()
  const result: PublicRelease[] = []
  const ordered = [...cms, ...github].sort((a, b) => comparePublicReleaseVersions(b, a)
    || Number(a.source === 'github') - Number(b.source === 'github')
    || (b.published_at ?? '').localeCompare(a.published_at ?? ''))
  for (const release of ordered) {
    const artifacts = release.artifacts.filter(artifact => {
      const key = `${release.channel}:${artifact.platform}:${artifact.package_type}`
      if (slots.has(key)) return false
      slots.add(key)
      return true
    })
    if (artifacts.length) result.push({ ...release, artifacts })
  }
  return result
}

/**
 * Resolves an official GitHub asset without accepting a caller-supplied URL.
 */
export function githubArtifactUrl(release: PublicRelease, platform: Platform, packageType?: PackageType): string | null {
  if (release.source !== 'github' || !versionParts(release.version) || platform !== 'windows-x64') return null
  const candidates = release.artifacts.filter(item => item.platform === platform && (!packageType || item.package_type === packageType))
  const selected = candidates.find(item => item.package_type === 'installer') ?? candidates.find(item => item.package_type === 'bundle')
  if (!selected) return null
  const filename = `NEUROKORE-${release.version}-${selected.package_type === 'installer' ? 'Setup.exe' : 'win64.zip'}`
  return selected.filename === filename ? assetUrl(release.version, filename) : null
}
