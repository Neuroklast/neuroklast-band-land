import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
// The package exports its entrypoint but not package.json.
const coreDir = dirname(require.resolve('@ffmpeg/core'))
const outputDir = join(process.cwd(), 'public/vendor/ffmpeg-core')
mkdirSync(outputDir, { recursive: true })

for (const name of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  const source = join(coreDir, name)
  if (!existsSync(source)) throw new Error('Missing @ffmpeg/core asset: ' + source)
  copyFileSync(source, join(outputDir, name))
}
console.log('Prepared same-origin FFmpeg core for background video encoding.')
