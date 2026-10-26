import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PublicRelease } from '@/lib/plugins/releases'

const state = vi.hoisted(() => ({
  product: null as Record<string, unknown> | null,
  release: null as Record<string, unknown> | null,
  artifacts: [] as Array<Record<string, unknown>>,
  productError: null as { message: string } | null,
  signed: 'https://media.example/signed',
  github: [] as PublicRelease[],
}))

vi.mock('@/lib/plugins/github-releases-server', () => ({ loadNeurokoreGitHubReleases: async () => state.github }))

vi.mock('@/lib/neurokore/server', () => ({
  limit: async () => undefined,
  json: (value: unknown, status = 200) => Response.json(value, { status }),
  db: () => ({
    from(table: string) {
      if (table === 'products') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({ maybeSingle: async () => ({ data: state.product, error: state.productError }) }),
              }),
            }),
          }),
        }
      }
      if (table === 'plugin_releases') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  is: () => ({
                    order: () => ({
                      limit: () => ({ maybeSingle: async () => ({ data: state.release, error: null }) }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'plugin_release_artifacts') {
        return { select: () => ({ eq: async () => ({ data: state.artifacts, error: null }) }) }
      }
      return { insert: async () => ({ error: null }) }
    },
  }),
}))

vi.mock('@/lib/storage/r2', () => ({
  r2StorageProvider: { createSignedDownloadUrl: async () => state.signed },
}))

vi.mock('@/lib/constants', () => ({ MEDIA_BUCKET: 'test-bucket' }))

import { GET } from '@/app/api/plugins/[slug]/download/route'

const sha = 'b'.repeat(64)

function request(query = 'platform=windows-x64') {
  return new Request('https://neuroklast.net/api/plugins/neurokore/download?' + query)
}

function context(slug = 'neurokore') {
  return { params: Promise.resolve({ slug }) }
}

function artifact(overrides: Record<string, unknown> = {}) {
  return {
    id: '00000000-0000-4000-8000-000000000002',
    platform: 'windows-x64',
    package_type: 'installer',
    filename: 'NEUROKORE.exe',
    storage_key: 'releases/neurokore/v1.0.0/windows-x64/NEUROKORE.exe',
    filesize_bytes: 1024,
    sha256: sha,
    validation_status: 'validated',
    ...overrides,
  }
}

beforeEach(() => {
  state.product = {
    id: '00000000-0000-4000-8000-000000000003',
    slug: 'neurokore',
    default_channel: 'stable',
    demo_downloads_enabled: true,
    pricing_mode: 'paid',
  }
  state.release = { id: '00000000-0000-4000-8000-000000000001', version: '1.0.0', channel: 'stable', title: null }
  state.artifacts = [artifact()]
  state.productError = null
  state.github = []
})

describe('public plugin download route', () => {
  function github(version = '1.1.0'): PublicRelease {
    return { id: 'github', source: 'github', version, channel: 'stable', title: null, changelog: null, release_notes: null,
      published_at: '2026-10-26T00:00:00Z', artifacts: (['installer', 'bundle'] as const).map(package_type => ({
        platform: 'windows-x64', architecture: 'x64', package_type,
        filename: `NEUROKORE-${version}-${package_type === 'installer' ? 'Setup.exe' : 'win64.zip'}`,
        filesize_bytes: 200000, sha256: sha, signing_status: 'unverified',
      })) }
  }

  it('serves the newer official GitHub installer and the explicitly selected ZIP', async () => {
    state.github = [github()]
    const installer = await GET(request(), context())
    expect(installer.headers.get('location')).toBe('https://github.com/Neuroklast/NeuroCore/releases/download/v1.1.0/NEUROKORE-1.1.0-Setup.exe')
    const bundle = await GET(request('platform=windows-x64&package=bundle'), context())
    expect(bundle.headers.get('location')).toContain('NEUROKORE-1.1.0-win64.zip')
  })

  it('does not bypass disabled downloads or replace a newer R2 installer', async () => {
    state.github = [github('0.9.0')]
    expect((await GET(request(), context())).headers.get('location')).toBe(state.signed)
    state.github = [github()]
    state.product = { ...state.product!, demo_downloads_enabled: false }
    expect((await GET(request(), context())).status).toBe(403)
  })

  it('offers GitHub releases without a manually uploaded CMS release, only for NEUROKORE', async () => {
    state.release = null
    state.github = [github()]
    expect((await GET(request(), context())).status).toBe(307)
    state.product = { ...state.product!, slug: 'other-plugin' }
    expect((await GET(request(), context('other-plugin'))).status).toBe(404)
  })

  it('updates legacy numeric-only beta versions on the website', async () => {
    state.release = { ...state.release!, version: '0.8.0', channel: 'beta' }
    state.github = [{ ...github('0.8.0-beta.1'), channel: 'beta' }]
    const response = await GET(request('platform=windows-x64&channel=beta'), context())
    expect(response.headers.get('location')).toContain('NEUROKORE-0.8.0-beta.1-Setup.exe')
  })

  it('redirects an anonymous visitor to a short-lived R2 URL', async () => {
    const response = await GET(request(), context())
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(state.signed)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('refuses an unknown slug, platform or channel', async () => {
    expect((await GET(request(), context('Bad Slug'))).status).toBe(404)
    expect((await GET(request('platform=amiga'), context())).status).toBe(400)
    expect((await GET(request('platform=windows-x64&channel=nightly'), context())).status).toBe(400)
  })

  it('returns 404 when the plugin is not public', async () => {
    state.product = null
    expect((await GET(request(), context())).status).toBe(404)
  })

  it('refuses downloads when they are disabled for the plugin', async () => {
    state.product = { ...state.product!, demo_downloads_enabled: false }
    expect((await GET(request(), context())).status).toBe(403)
  })

  it('returns 404 when no published release exists', async () => {
    state.release = null
    expect((await GET(request(), context())).status).toBe(404)
  })

  it('returns 404 when the platform has no validated artifact', async () => {
    state.artifacts = [artifact({ platform: 'linux-x64' })]
    expect((await GET(request(), context())).status).toBe(404)
    state.artifacts = [artifact({ validation_status: 'pending' })]
    expect((await GET(request(), context())).status).toBe(404)
  })

  it('refuses an artifact with an unsafe storage path', async () => {
    state.artifacts = [artifact({ storage_key: '../secret.exe' })]
    expect((await GET(request(), context())).status).toBe(409)
  })

  it('returns a clean 503 when the database fails', async () => {
    state.productError = { message: 'down' }
    expect((await GET(request(), context())).status).toBe(503)
  })
})
