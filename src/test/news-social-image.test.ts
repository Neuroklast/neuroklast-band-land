import { afterEach, describe, expect, it, vi } from 'vitest'
import { newsR2SocialSource, newsSocialImageMetadata, newsSocialImagePath } from '@/lib/news-social-image'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('News social image metadata', () => {
  it('uses the same news cover as a first-party 1200x630 JPEG on social networks', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_HOST', 'https://media.neuroklast.net')
    const image = newsSocialImageMetadata(
      'from-the-ashes', 'From The Ashes', 'news/03db361a9a9937ccb9b56ff93cab296c.webp',
      null, 'https://neuroklast.net',
    )
    expect(image.image).toBe(
      'https://neuroklast.net/news/from-the-ashes/social-image?v=03db361a9a9937ccb9b56ff93cab296c.webp',
    )
    expect(image.openGraphImage).toMatchObject({
      url: image.image, alt: 'From The Ashes', type: 'image/jpeg', width: 1200, height: 630,
    })
  })

  it('does not fetch arbitrary remote image URLs and uses a fallback when no R2 cover exists', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_HOST', 'https://media.neuroklast.net')
    expect(newsR2SocialSource(null, 'https://example.com/any-image.jpg')).toBeNull()
    expect(newsR2SocialSource(null, 'http://127.0.0.1/private.jpg')).toBeNull()
    expect(newsSocialImageMetadata('no-cover', 'No cover', null, null, 'https://neuroklast.net'))
      .toEqual({
        image: 'https://neuroklast.net/og-image.png',
        openGraphImage: { url: 'https://neuroklast.net/og-image.png', alt: 'No cover' },
      })
  })

  it('encodes slugs and rejects credentials on R2 image sources', () => {
    vi.stubEnv('NEXT_PUBLIC_R2_PUBLIC_HOST', 'https://media.neuroklast.net')
    expect(newsR2SocialSource(null, 'https://username:password@media.neuroklast.net/news/a.png')).toBeNull()
    const source = newsR2SocialSource('news/cover.png', null)
    expect(source?.origin).toBe('https://media.neuroklast.net')
    expect(newsSocialImagePath('my new post', source!)).toBe('/news/my%20new%20post/social-image?v=cover.png')
  })
})
