import { describe, it, expect } from 'vitest'
import { toDirectImageUrl } from '@/lib/image-cache'

describe('toDirectImageUrl', () => {
  it('converts Google Drive /file/d/ URLs to direct download URLs', () => {
    const url = 'https://drive.google.com/file/d/1aBcDeFgHiJkLmN/view?usp=sharing'
    expect(toDirectImageUrl(url)).toBe(
      'https://drive.google.com/uc?export=view&id=1aBcDeFgHiJkLmN'
    )
  })

  it('converts Google Drive /file/d/ URLs without query params', () => {
    const url = 'https://drive.google.com/file/d/abc123/view'
    expect(toDirectImageUrl(url)).toBe(
      'https://drive.google.com/uc?export=view&id=abc123'
    )
  })

  it('converts Google Drive open?id= URLs', () => {
    const url = 'https://drive.google.com/open?id=xyz789'
    expect(toDirectImageUrl(url)).toBe(
      'https://drive.google.com/uc?export=view&id=xyz789'
    )
  })

  it('converts Google Drive open?id= with extra params', () => {
    const url = 'https://drive.google.com/open?id=xyz789&other=1'
    expect(toDirectImageUrl(url)).toBe(
      'https://drive.google.com/uc?export=view&id=xyz789'
    )
  })

  it('passes through regular image URLs unchanged', () => {
    const url = 'https://example.com/images/photo.jpg'
    expect(toDirectImageUrl(url)).toBe(url)
  })

  it('passes through data URLs unchanged', () => {
    const url = 'data:image/jpeg;base64,/9j/4AAQ...'
    expect(toDirectImageUrl(url)).toBe(url)
  })

  it('passes through relative URLs unchanged', () => {
    const url = '/assets/images/photo.png'
    expect(toDirectImageUrl(url)).toBe(url)
  })
})
