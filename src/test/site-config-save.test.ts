import { describe, expect, it } from 'vitest'
import {
  mergeSiteConfigValue,
  replacedConfigStoragePaths,
} from '@/lib/site-config-save'

describe('mergeSiteConfigValue', () => {
  it('preserves existing keys not in the incoming payload', () => {
    expect(
      mergeSiteConfigValue(
        { genres: ['Industrial'], headline: 'OLD', logoUrl: '/brand/x.svg' },
        { headline: 'NEW', tagline: 't' },
      ),
    ).toEqual({
      genres: ['Industrial'],
      headline: 'NEW',
      logoUrl: '/brand/x.svg',
      tagline: 't',
    })
  })

  it('clears keys set to null', () => {
    expect(
      mergeSiteConfigValue(
        { video_url: 'https://old.mp4', video_storage_path: 'background/videos/old.mp4' },
        { video_url: null, video_storage_path: 'background/videos/new.mp4' },
      ),
    ).toEqual({ video_storage_path: 'background/videos/new.mp4' })
  })

  it('replaces arrays wholesale', () => {
    expect(mergeSiteConfigValue([{ id: 'a' }], [{ id: 'b' }])).toEqual([{ id: 'b' }])
  })
})

describe('replacedConfigStoragePaths', () => {
  it('returns previous background video path when replaced', () => {
    expect(
      replacedConfigStoragePaths(
        'background',
        { video_storage_path: 'background/videos/old.mp4' },
        { video_storage_path: 'background/videos/new.mp4' },
      ),
    ).toEqual(['background/videos/old.mp4'])
  })

  it('ignores bundled brand paths and unchanged keys', () => {
    expect(
      replacedConfigStoragePaths(
        'loadingScreen',
        { logoStoragePath: '/brand/x.svg' },
        { logoStoragePath: 'site/loading-logo/new.webp' },
      ),
    ).toEqual([])
    expect(
      replacedConfigStoragePaths(
        'background',
        { video_storage_path: 'background/videos/same.mp4' },
        { video_storage_path: 'background/videos/same.mp4' },
      ),
    ).toEqual([])
  })

  it('returns replaced terminal command file paths', () => {
    expect(
      replacedConfigStoragePaths(
        'terminal',
        { commands: [{ fileStoragePath: 'terminal/old.zip' }] },
        { commands: [{ fileStoragePath: 'terminal/new.zip' }] },
      ),
    ).toEqual(['terminal/old.zip'])
  })
})
