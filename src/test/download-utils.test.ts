import { describe, it, expect } from 'vitest'
import { extractDriveFileId } from '@/lib/download'

describe('extractDriveFileId', () => {
  it('extracts file ID from /file/d/ URL', () => {
    expect(extractDriveFileId('https://drive.google.com/file/d/abc123XYZ/view?usp=sharing'))
      .toBe('abc123XYZ')
  })

  it('extracts file ID from /open?id= URL', () => {
    expect(extractDriveFileId('https://drive.google.com/open?id=def456'))
      .toBe('def456')
  })

  it('extracts file ID from /uc?id= URL', () => {
    expect(extractDriveFileId('https://drive.google.com/uc?id=ghi789&export=download'))
      .toBe('ghi789')
  })

  it('returns null for non-Drive URLs', () => {
    expect(extractDriveFileId('https://example.com/file.zip')).toBeNull()
    expect(extractDriveFileId('https://github.com/file')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(extractDriveFileId('')).toBeNull()
  })

  it('handles IDs with dashes and underscores', () => {
    expect(extractDriveFileId('https://drive.google.com/file/d/abc_123-XYZ/view'))
      .toBe('abc_123-XYZ')
  })
})
