import { describe, expect, it } from 'vitest'
import { releaseSchema, releasesResponseSchema } from '../../lib/plugins/release-schema'

describe('release admin schema', () => {
  const artifact = {
    id: '00000000-0000-4000-8000-000000000001',
    platform: 'windows-x64',
    architecture: 'x64',
    package_type: 'installer',
    filename: 'NEUROKORE.exe',
    storage_key: 'releases/neurokore/v1.0.0/windows-x64/NEUROKORE.exe',
    filesize_bytes: 1024,
    sha256: 'a'.repeat(64),
    signing_status: 'unsigned',
    validation_status: 'validated',
  }

  it('reads the relation name the API actually returns', () => {
    const parsed = releaseSchema.parse({
      id: '00000000-0000-4000-8000-000000000002',
      version: '1.0.0',
      channel: 'stable',
      status: 'draft',
      title: null,
      changelog: null,
      release_notes: null,
      git_commit_sha: null,
      created_at: '2026-01-01T00:00:00.000Z',
      validated_at: null,
      published_at: null,
      withdrawn_at: null,
      plugin_release_artifacts: [artifact],
    })
    expect(parsed.plugin_release_artifacts).toHaveLength(1)
    expect(parsed.plugin_release_artifacts[0].filename).toBe('NEUROKORE.exe')
  })

  it('accepts the full API response shape', () => {
    expect(releasesResponseSchema.parse({ releases: [] }).releases).toEqual([])
  })
})
