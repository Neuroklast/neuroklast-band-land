import { describe, expect, it } from 'vitest'
import { availablePublicDownload } from '@/lib/plugins/public-download'
import type { PublicRelease } from '@/lib/plugins/releases'

function release(channel: PublicRelease['channel'], hasArtifact: boolean): PublicRelease {
  return {
    id: channel,
    channel,
    version: '0.9.0',
    title: null,
    changelog: null,
    release_notes: null,
    published_at: '2026-10-22T12:00:00Z',
    artifacts: hasArtifact ? [{
      platform: 'windows-x64',
      architecture: 'x64',
      package_type: 'installer',
      filename: 'plugin.zip',
      filesize_bytes: 1024,
      sha256: 'a'.repeat(64),
      signing_status: 'unsigned',
    }] : [],
  }
}

describe('public product download availability', () => {
  it('does not advertise a download when no build exists', () => {
    expect(availablePublicDownload({ demo_downloads_enabled: true, releases: [] })).toBeNull()
  })

  it('does not advertise a download when downloads are disabled', () => {
    expect(availablePublicDownload({
      demo_downloads_enabled: false,
      releases: [release('stable', true)],
    })).toBeNull()
  })

  it('does not advertise a release without downloadable artifacts', () => {
    expect(availablePublicDownload({
      demo_downloads_enabled: true,
      releases: [release('stable', false)],
    })).toBeNull()
  })

  it('prefers an installable stable release over a beta', () => {
    expect(availablePublicDownload({
      demo_downloads_enabled: true,
      releases: [release('beta', true), release('stable', true)],
    })?.channel).toBe('stable')
  })

  it('advertises a beta when no stable build is ready', () => {
    expect(availablePublicDownload({
      demo_downloads_enabled: true,
      releases: [release('stable', false), release('beta', true)],
    })?.channel).toBe('beta')
  })
})
