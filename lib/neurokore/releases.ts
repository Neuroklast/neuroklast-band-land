import { z } from 'zod'

export const RELEASE_CHANNELS = ['stable', 'beta', 'alpha'] as const
export type ReleaseChannel = (typeof RELEASE_CHANNELS)[number]

export const RELEASE_STATUSES = ['draft', 'validated', 'published', 'withdrawn'] as const
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number]

export const PLATFORMS = ['windows-x64', 'macos-arm64', 'macos-x64', 'linux-x64'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PACKAGE_TYPES = ['installer', 'vst3', 'au', 'standalone', 'bundle'] as const
export type PackageType = (typeof PACKAGE_TYPES)[number]

export const SIGNING_STATUSES = ['unsigned', 'signed', 'notarized'] as const
export type SigningStatus = (typeof SIGNING_STATUSES)[number]

/** Download preference: a single installable package beats loose plugin binaries. */
const PACKAGE_PRIORITY: readonly PackageType[] = ['installer', 'bundle', 'vst3', 'au', 'standalone']

export const PLATFORM_META: Record<Platform, { label: string }> = {
  'windows-x64': { label: 'Windows' },
  'macos-arm64': { label: 'macOS (Apple Silicon)' },
  'macos-x64': { label: 'macOS (Intel)' },
  'linux-x64': { label: 'Linux' },
}

export const CHANNEL_LABEL: Record<ReleaseChannel, string> = {
  stable: 'Stable',
  beta: 'Beta',
  alpha: 'Alpha',
}

export const PACKAGE_LABEL: Record<PackageType, string> = {
  installer: 'Installer',
  vst3: 'VST3',
  au: 'Audio Unit',
  standalone: 'Standalone',
  bundle: 'Bundle',
}

export const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/)

export const versionSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.-]+)?$/, 'Use a version like 1.4.0 or 1.4.0-beta.2')

export const storageKeySchema = z.string().refine(safeReleaseStorageKey, 'Invalid release storage path')

export const publicArtifactSchema = z.object({
  platform: z.enum(PLATFORMS),
  architecture: z.enum(['x64', 'arm64']),
  package_type: z.enum(PACKAGE_TYPES),
  filename: z.string().min(1).max(255),
  filesize_bytes: z.number().int().positive(),
  sha256: sha256Schema,
  signing_status: z.enum(SIGNING_STATUSES),
})

export const publicReleaseSchema = z.object({
  id: z.uuid(),
  version: z.string().min(1),
  channel: z.enum(RELEASE_CHANNELS),
  title: z.string().nullable(),
  changelog: z.string().nullable(),
  release_notes: z.string().nullable(),
  published_at: z.string().nullable(),
  artifacts: z.array(publicArtifactSchema),
})

export type PublicArtifact = z.infer<typeof publicArtifactSchema>
export type PublicRelease = z.infer<typeof publicReleaseSchema>

export function parsePublicReleases(value: unknown): PublicRelease[] {
  return z.array(publicReleaseSchema).parse(value ?? [])
}

export type ArtifactLike = {
  platform: Platform
  package_type: PackageType
  sha256: string
  filesize_bytes: number
  validation_status: 'pending' | 'validated' | 'failed'
}

/** A publishable artifact has a real size and a checksum and passed validation. */
export function artifactReady(artifact: ArtifactLike): boolean {
  return (
    artifact.validation_status === 'validated' &&
    sha256Schema.safeParse(artifact.sha256).success &&
    Number.isInteger(artifact.filesize_bytes) &&
    artifact.filesize_bytes > 0
  )
}

/** Every artifact must be validated; a release with none is never publishable. */
export function releaseArtifactsReady(artifacts: readonly ArtifactLike[]): boolean {
  return artifacts.length > 0 && artifacts.every(artifactReady)
}

/** Only published, non-withdrawn releases may be served. */
export function releaseDownloadable(status: ReleaseStatus, artifacts: readonly ArtifactLike[]): boolean {
  return status === 'published' && releaseArtifactsReady(artifacts)
}

/** Choose the best artifact for a platform, or null when none is ready. */
export function pickArtifact<T extends ArtifactLike>(artifacts: readonly T[], platform: Platform): T | null {
  const ready = artifacts.filter((artifact) => artifact.platform === platform && artifactReady(artifact))
  for (const type of PACKAGE_PRIORITY) {
    const match = ready.find((artifact) => artifact.package_type === type)
    if (match) return match
  }
  return null
}

/**
 * Storage keys are server-authored, but publishing must not accept arbitrary
 * files or URLs as trusted installers.
 */
export function safeReleaseStorageKey(key: string): boolean {
  if (!key.startsWith('releases/')) return false
  if (key.length > 512 || key.includes('\\') || key.includes('..')) return false
  if (!/^releases\/[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(key)) return false
  if (key.endsWith('/') || key.includes('//')) return false
  return !/^[a-z][a-z0-9+.-]*:/i.test(key)
}

/** Canonical key for an uploaded build. The admin never types a path. */
export function releaseStorageKey(version: string, platform: Platform, filename: string): string {
  const safe = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
  if (!safe.test(version) || !safe.test(filename)) throw new Error('Invalid release path')
  return `releases/neurokore/v${version}/${platform}/${filename}`
}

/** Group artifacts by platform in a stable order for the public download page. */
export function artifactsByPlatform(release: PublicRelease): Array<{ platform: Platform; artifacts: PublicArtifact[] }> {
  return PLATFORMS.map((platform) => ({
    platform,
    artifacts: release.artifacts
      .filter((artifact) => artifact.platform === platform)
      .sort((a, b) => PACKAGE_PRIORITY.indexOf(a.package_type) - PACKAGE_PRIORITY.indexOf(b.package_type)),
  })).filter((group) => group.artifacts.length > 0)
}

/** Latest published release per channel, newest first inside each channel. */
export function latestByChannel(releases: readonly PublicRelease[]): PublicRelease[] {
  const seen = new Set<ReleaseChannel>()
  return [...releases]
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
    .filter((release) => {
      if (seen.has(release.channel)) return false
      seen.add(release.channel)
      return true
    })
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 || Number.isInteger(value) ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}
