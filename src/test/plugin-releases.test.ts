import { describe, expect, it } from 'vitest'
import {
  artifactsByPlatform,
  findProduct,
  formatBytes,
  isFreeDownload,
  latestByChannel,
  parsePublicCatalog,
  parsePublicReleases,
  pickArtifact,
  releaseArtifactsReady,
  releaseDownloadable,
  releaseStorageKey,
  safeReleaseStorageKey,
  slugifyProductTitle,
  type ArtifactLike,
  type PublicRelease,
} from '../../lib/plugins/releases'

const sha = 'a'.repeat(64)

function artifact(overrides: Partial<ArtifactLike> = {}): ArtifactLike {
  return {
    platform: 'windows-x64',
    package_type: 'installer',
    sha256: sha,
    filesize_bytes: 1024,
    validation_status: 'validated',
    ...overrides,
  }
}

function release(overrides: Partial<PublicRelease> = {}): PublicRelease {
  return {
    id: '00000000-0000-4000-8000-000000000000',
    version: '1.0.0',
    channel: 'stable',
    title: null,
    changelog: null,
    release_notes: null,
    published_at: '2026-01-01T00:00:00.000Z',
    artifacts: [],
    ...overrides,
  }
}

describe('artifact readiness', () => {
  it('accepts a validated checksummed artifact', () => {
    expect(releaseArtifactsReady([artifact()])).toBe(true)
  })

  it('rejects empty, pending, failed, short hash and zero size', () => {
    expect(releaseArtifactsReady([])).toBe(false)
    expect(releaseArtifactsReady([artifact({ validation_status: 'pending' })])).toBe(false)
    expect(releaseArtifactsReady([artifact({ validation_status: 'failed' })])).toBe(false)
    expect(releaseArtifactsReady([artifact({ sha256: 'abc' })])).toBe(false)
    expect(releaseArtifactsReady([artifact({ filesize_bytes: 0 })])).toBe(false)
    expect(releaseArtifactsReady([artifact({ filesize_bytes: -1 })])).toBe(false)
  })

  it('requires every artifact to be ready', () => {
    expect(releaseArtifactsReady([artifact(), artifact({ platform: 'linux-x64', validation_status: 'pending' })])).toBe(false)
  })

  it('only serves published releases', () => {
    expect(releaseDownloadable('published', [artifact()])).toBe(true)
    expect(releaseDownloadable('draft', [artifact()])).toBe(false)
    expect(releaseDownloadable('validated', [artifact()])).toBe(false)
    expect(releaseDownloadable('withdrawn', [artifact()])).toBe(false)
  })
})

describe('pickArtifact', () => {
  it('prefers a single installer over loose plugin binaries', () => {
    const picked = pickArtifact([
      artifact({ package_type: 'vst3' }),
      artifact({ package_type: 'installer' }),
      artifact({ package_type: 'standalone' }),
    ], 'windows-x64')
    expect(picked?.package_type).toBe('installer')
  })

  it('ignores other platforms and unvalidated artifacts', () => {
    expect(pickArtifact([artifact({ platform: 'linux-x64' })], 'windows-x64')).toBeNull()
    expect(pickArtifact([artifact({ validation_status: 'pending' })], 'windows-x64')).toBeNull()
  })
})

describe('storage paths', () => {
  it('builds a canonical key and accepts it', () => {
    const key = releaseStorageKey('neurokore', '1.4.0', 'windows-x64', 'NEUROKORE-1.4.0-Windows.exe')
    expect(key).toBe('releases/neurokore/v1.4.0/windows-x64/NEUROKORE-1.4.0-Windows.exe')
    expect(safeReleaseStorageKey(key)).toBe(true)
  })

  it('rejects traversal, schemes, empty segments and foreign prefixes', () => {
    expect(safeReleaseStorageKey('releases/../secret')).toBe(false)
    expect(safeReleaseStorageKey('https://evil.example/x.exe')).toBe(false)
    expect(safeReleaseStorageKey('/releases/x')).toBe(false)
    expect(safeReleaseStorageKey('releases//x')).toBe(false)
    expect(safeReleaseStorageKey('uploads/x.exe')).toBe(false)
    expect(safeReleaseStorageKey('releases/x\\y')).toBe(false)
    expect(safeReleaseStorageKey('releases/a:b')).toBe(false)
  })

  it('refuses unsafe filenames when deriving a key', () => {
    expect(() => releaseStorageKey('neurokore', '1.0.0', 'linux-x64', '../x.deb')).toThrow()
    expect(() => releaseStorageKey('neurokore', '1.0.0 beta', 'linux-x64', 'x.deb')).toThrow()
  })
})

describe('public catalogue shaping', () => {
  it('groups artifacts by platform in product order', () => {
    const groups = artifactsByPlatform(release({
      artifacts: [
        {
          platform: 'linux-x64', architecture: 'x64', package_type: 'standalone',
          filename: 'a', filesize_bytes: 10, sha256: sha, signing_status: 'unsigned',
        },
        {
          platform: 'windows-x64', architecture: 'x64', package_type: 'vst3',
          filename: 'b', filesize_bytes: 10, sha256: sha, signing_status: 'unsigned',
        },
        {
          platform: 'windows-x64', architecture: 'x64', package_type: 'installer',
          filename: 'c', filesize_bytes: 10, sha256: sha, signing_status: 'unsigned',
        },
      ],
    }))
    expect(groups.map((group) => group.platform)).toEqual(['windows-x64', 'linux-x64'])
    expect(groups[0].artifacts.map((item) => item.package_type)).toEqual(['installer', 'vst3'])
  })

  it('keeps only the newest release per channel', () => {
    const stableNew = release({ id: '00000000-0000-4000-8000-000000000001', published_at: '2026-02-01T00:00:00.000Z' })
    const stableOld = release({ id: '00000000-0000-4000-8000-000000000002', published_at: '2026-01-01T00:00:00.000Z' })
    const beta = release({ id: '00000000-0000-4000-8000-000000000003', channel: 'beta', published_at: '2026-03-01T00:00:00.000Z' })
    expect(latestByChannel([stableOld, beta, stableNew]).map((item) => item.id))
      .toEqual([beta.id, stableNew.id])
  })

  it('parses the RPC payload and rejects malformed rows', () => {
    const payload = [{
      id: '00000000-0000-4000-8000-000000000000',
      version: '1.0.0',
      channel: 'stable',
      title: null,
      changelog: null,
      release_notes: null,
      published_at: null,
      artifacts: [],
    }]
    expect(parsePublicReleases(payload)).toHaveLength(1)
    expect(() => parsePublicReleases([{ ...payload[0], channel: 'nightly' }])).toThrow()
  })

  it('formats sizes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB')
    expect(formatBytes(0)).toBe('-')
  })
})


describe('public catalog', () => {
  const product = {
    id: '00000000-0000-4000-8000-000000000000',
    slug: 'neurokore',
    title: 'NEUROKORE',
    short_description: null,
    description: null,
    features: [{ title: 'Circuit', body: 'Board' }],
    system_requirements: ['Windows 10'],
    media: [{ kind: 'image', url: 'https://cdn.example/a.png' }],
    pricing_mode: 'paid',
    sales_enabled: false,
    demo_downloads_enabled: true,
    license_required: true,
    default_channel: 'stable',
    display_order: 0,
    releases: [{
      id: '00000000-0000-4000-8000-000000000001',
      version: '1.0.0',
      channel: 'stable',
      title: null,
      changelog: null,
      release_notes: null,
      published_at: null,
      artifacts: [],
    }],
  }

  it('parses a catalog payload and finds a product by slug', () => {
    const catalog = parsePublicCatalog([product])
    expect(catalog).toHaveLength(1)
    expect(findProduct(catalog, 'neurokore')?.title).toBe('NEUROKORE')
    expect(findProduct(catalog, 'missing')).toBeNull()
  })

  it('rejects an invalid pricing mode or slug', () => {
    expect(() => parsePublicCatalog([{ ...product, pricing_mode: 'donation' }])).toThrow()
    expect(() => parsePublicCatalog([{ ...product, slug: 'Neuro Kore' }])).toThrow()
  })

  it('treats free products as no-licence downloads', () => {
    expect(isFreeDownload(parsePublicCatalog([{ ...product, pricing_mode: 'free', license_required: false }])[0])).toBe(true)
  })
})
describe('slug generation', () => {
  it('derives a safe slug from a product name', () => {
    expect(slugifyProductTitle('NEUROMETER')).toBe('neurometer')
    expect(slugifyProductTitle('  Neuro Boost 2.0  ')).toBe('neuro-boost-2-0')
    expect(slugifyProductTitle('Neuro / Sub')).toBe('neuro-sub')
    expect(slugifyProductTitle('---')).toBe('')
  })
})

