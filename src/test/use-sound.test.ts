import { describe, it, expect } from 'vitest'
import { toDirectAudioUrl } from '@/hooks/use-sound'

describe('toDirectAudioUrl', () => {
  it('converts Google Drive /file/d/ URLs to direct download URLs', () => {
    const url = 'https://drive.google.com/file/d/1aBcDeFgHiJkLmN/view?usp=sharing'
    expect(toDirectAudioUrl(url)).toBe(
      'https://drive.google.com/uc?export=download&id=1aBcDeFgHiJkLmN'
    )
  })

  it('converts Google Drive open?id= URLs', () => {
    const url = 'https://drive.google.com/open?id=xyz789'
    expect(toDirectAudioUrl(url)).toBe(
      'https://drive.google.com/uc?export=download&id=xyz789'
    )
  })

  it('converts Google Drive uc?export=view URLs', () => {
    const url = 'https://drive.google.com/uc?export=view&id=abc123'
    expect(toDirectAudioUrl(url)).toBe(
      'https://drive.google.com/uc?export=download&id=abc123'
    )
  })

  it('passes through regular URLs unchanged', () => {
    const url = 'https://example.com/audio/song.mp3'
    expect(toDirectAudioUrl(url)).toBe(url)
  })

  it('passes through local asset URLs unchanged', () => {
    const url = '/assets/sounds/click-abc123.wav'
    expect(toDirectAudioUrl(url)).toBe(url)
  })

  it('returns empty string for undefined', () => {
    expect(toDirectAudioUrl(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(toDirectAudioUrl('')).toBe('')
  })

  it('does not route audio URLs through image-proxy', () => {
    const localUrl = '/assets/sounds/click.wav'
    const result = toDirectAudioUrl(localUrl)
    expect(result).not.toContain('image-proxy')

    const remoteUrl = 'https://drive.google.com/file/d/abc123/view'
    const result2 = toDirectAudioUrl(remoteUrl)
    expect(result2).not.toContain('image-proxy')
  })
})
