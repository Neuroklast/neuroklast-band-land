import { describe, expect, it } from 'vitest'
import {
  collectGoogleDriveFileIds,
  collectGoogleDriveFolderIds,
  extractGoogleDriveFolderId,
} from '@/lib/drive-migrate'
import { extractGoogleDriveFileId } from '@/lib/remote-image-url'
import { rewriteDriveUrls, unwrapBandConfig } from '@/lib/band-config-migrate'

describe('drive-migrate', () => {
  it('extracts file and folder ids', () => {
    expect(extractGoogleDriveFileId('https://drive.google.com/file/d/abc123XYZ/view')).toBe('abc123XYZ')
    expect(extractGoogleDriveFolderId('https://drive.google.com/drive/folders/folder99')).toBe('folder99')
  })

  it('walks nested band config for drive urls', () => {
    const config = {
      logoUrl: 'https://drive.google.com/file/d/logo1/view',
      biography: {
        members: [{ name: 'A', photo: 'https://drive.google.com/uc?id=member1' }],
      },
      galleryDriveFolderUrl: 'https://drive.google.com/drive/folders/gal1',
    }
    expect(collectGoogleDriveFileIds(config).sort()).toEqual(['logo1', 'member1'])
    expect(collectGoogleDriveFolderIds(config)).toEqual(['gal1'])
  })
})

describe('unwrapBandConfig', () => {
  it('accepts siteName configs and KV wrappers', () => {
    expect(unwrapBandConfig({ siteName: 'NK', gigs: [] }).siteName).toBe('NK')
    expect(unwrapBandConfig({ result: { siteName: 'NK' } }).siteName).toBe('NK')
    expect(unwrapBandConfig({ key: 'site-config', value: { siteName: 'NK' } }).siteName).toBe('NK')
  })
})

describe('rewriteDriveUrls', () => {
  it('replaces strings that contain a migrated file id', () => {
    const map = new Map([['abc', 'https://cdn.example/abc.webp']])
    const next = rewriteDriveUrls(
      { photo: 'https://drive.google.com/file/d/abc/view' },
      map,
    ) as { photo: string }
    expect(next.photo).toBe('https://cdn.example/abc.webp')
  })
})
