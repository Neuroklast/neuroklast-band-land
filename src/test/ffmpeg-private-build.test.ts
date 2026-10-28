import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

describe('FFmpeg internal-only packaging rules', () => {
  it('never writes an FFmpeg core into public static assets', () => {
    const copyScript = readFileSync(root + '/scripts/copy-ffmpeg-core.mjs', 'utf8')
    expect(copyScript).toContain("'.ffmpeg-admin-assets'")
    expect(copyScript).toContain('rmSync(')
    expect(copyScript).not.toContain("const outputDir = join(process.cwd(), 'public/")
  })

  it('has an explicit server-only output file trace for the protected route', () => {
    const config = readFileSync(root + '/next.config.mjs', 'utf8')
    expect(config).toContain("'/api/admin/ffmpeg/[asset]': ['./.ffmpeg-admin-assets/*']")
    const browser = readFileSync(root + '/lib/background-video-encode.ts', 'utf8')
    expect(browser).toContain("'/api/admin/ffmpeg/ffmpeg-core.wasm'")
    expect(browser).not.toContain("'/vendor/ffmpeg-core/")
  })
})
