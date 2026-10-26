/** Scrubbing encode profile. Keep this separate from ffmpeg.wasm for fast unit tests. */
export const SCRUB_VIDEO_MAX_BYTES = 50 * 1024 * 1024

export type BackgroundVideoVariant = 'desktop' | 'mobile'

export function buildScrubEncodingArgs(input: string, output: string, variant: BackgroundVideoVariant): string[] {
  // Avoid upscaling, preserve aspect ratio and guarantee even dimensions for yuv420p.
  const width = variant === 'mobile' ? 1080 : 1920
  const height = variant === 'mobile' ? 1920 : 1080
  const scale = "scale=w='min(" + width + ",iw)':h='min(" + height + ",ih)':force_original_aspect_ratio=decrease:force_divisible_by=2"
  return [
    '-hide_banner', '-y', '-i', input,
    '-map', '0:v:0', '-an',
    '-vf', 'fps=30,' + scale,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '25',
    '-pix_fmt', 'yuv420p', '-g', '6', '-keyint_min', '6',
    '-sc_threshold', '0', '-bf', '0', '-threads', '1',
    '-movflags', '+faststart', '-f', 'mp4', output,
  ]
}
