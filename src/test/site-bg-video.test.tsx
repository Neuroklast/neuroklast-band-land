import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/device-capability', () => ({
  shouldDisableVideoBackground: () => false,
  prefersReducedMotion: () => false,
}))

vi.mock('@/contexts/LenisContext', () => ({
  useLenisContext: () => ({ lenis: null }),
}))

vi.mock('@/lib/scroll-video-sync', () => ({
  attachScrollVideoSync: () => () => {},
}))

import { SiteBgVideo } from '@/app/_components/public/SiteBgVideo'

describe('SiteBgVideo opacity', () => {
  it('applies the configured opacity to the video wrapper', async () => {
    const { container } = render(<SiteBgVideo opacity={0.8} />)
    await act(async () => {})
    const wrap = container.querySelector('[data-draft-target="bg-video-wrap"]') as HTMLElement
    expect(wrap).toBeTruthy()
    expect(wrap.style.opacity).toBe('0.8')
  })
})
