import { describe, expect, it } from 'vitest'
import { buildScrubEncodingArgs, SCRUB_VIDEO_MAX_BYTES } from '@/lib/background-video-encoding-config'

describe('background scrub encoding', () => {
  it('encodes H.264 MP4 with short GOP, no B frames, faststart, no audio', () => {
    const args = buildScrubEncodingArgs('input.webm', 'output.mp4', 'desktop')
    expect(args).toContain('libx264')
    expect(args).toContain('yuv420p')
    expect(args).toContain('+faststart')
    expect(args).toContain('0:v:0')
    expect(args).toContain('-an')
    expect(args[args.indexOf('-g') + 1]).toBe('6')
    expect(args[args.indexOf('-bf') + 1]).toBe('0')
    expect(args[args.indexOf('-f') + 1]).toBe('mp4')
    expect(args.at(-1)).toBe('output.mp4')
  })
  it('preserves source aspect ratio and caps desktop/mobile dimensions independently', () => {
    const desktop = buildScrubEncodingArgs('a.mov', 'b.mp4', 'desktop').join(' ')
    const mobile = buildScrubEncodingArgs('a.mov', 'b.mp4', 'mobile').join(' ')
    expect(desktop).toContain("min(1920,iw)")
    expect(desktop).toContain("min(1080,ih)")
    expect(mobile).toContain("min(1080,iw)")
    expect(mobile).toContain("min(1920,ih)")
    expect(mobile).toContain('force_original_aspect_ratio=decrease')
    expect(desktop).toContain('force_divisible_by=2')
  })
  it('keeps output within signed-upload limits', () => {
    expect(SCRUB_VIDEO_MAX_BYTES).toBe(50 * 1024 * 1024)
  })
})
