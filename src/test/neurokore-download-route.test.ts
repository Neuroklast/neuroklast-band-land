import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  release: null as Record<string, unknown> | null,
  artifacts: [] as Array<Record<string, unknown>>,
  releaseError: null as { message: string } | null,
  signed: 'https://media.example/signed',
}))

vi.mock('@/lib/neurokore/server', () => ({
  limit: async () => undefined,
  json: (value: unknown, status = 200) => Response.json(value, { status }),
  db: () => ({
    from(table: string) {
      if (table === 'neurokore_releases') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                is: () => ({
                  order: () => ({
                    limit: () => ({
                      maybeSingle: async () => ({ data: state.release, error: state.releaseError }),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }
      }
      if (table === 'neurokore_release_artifacts') {
        return {
          select: () => ({
            eq: async () => ({ data: state.artifacts, error: null }),
          }),
        }
      }
      return { insert: async () => ({ error: null }) }
    },
  }),
}))

vi.mock('@/lib/storage/r2', () => ({
  r2StorageProvider: { createSignedDownloadUrl: async () => state.signed },
}))

vi.mock('@/lib/constants', () => ({ MEDIA_BUCKET: 'test-bucket' }))

import { GET } from '@/app/api/neurokore/download/route'

const sha = 'b'.repeat(64)

function request(query = 'platform=windows-x64&channel=stable') {
  return new Request('https://neuroklast.net/api/neurokore/download?' + query)
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
  state.release = { id: '00000000-0000-4000-8000-000000000001', version: '1.0.0', channel: 'stable', title: null }
  state.artifacts = [artifact()]
  state.releaseError = null
})

describe('public download route', () => {
  it('redirects an anonymous visitor to a short-lived R2 URL', async () => {
    const response = await GET(request())
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(state.signed)
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('refuses an unknown platform or channel', async () => {
    expect((await GET(request('platform=amiga&channel=stable'))).status).toBe(400)
    expect((await GET(request('platform=windows-x64&channel=nightly'))).status).toBe(400)
  })

  it('returns 404 when no published release exists', async () => {
    state.release = null
    expect((await GET(request())).status).toBe(404)
  })

  it('returns 404 when the platform has no validated artifact', async () => {
    state.artifacts = [artifact({ platform: 'linux-x64' })]
    expect((await GET(request())).status).toBe(404)
    state.artifacts = [artifact({ validation_status: 'pending' })]
    expect((await GET(request())).status).toBe(404)
  })

  it('refuses an artifact with an unsafe storage path', async () => {
    state.artifacts = [artifact({ storage_key: '../secret.exe' })]
    const response = await GET(request())
    expect(response.status).toBe(409)
  })

  it('returns a clean 503 when the database fails', async () => {
    state.releaseError = { message: 'down' }
    expect((await GET(request())).status).toBe(503)
  })
})
