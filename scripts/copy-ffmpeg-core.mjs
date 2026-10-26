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
// Serve the UMD wrapper and its Worker directly: Turbopack cannot bundle
// @ffmpeg/ffmpeg's dynamic ESM Worker URL during production builds.
// Node's conditional export resolves the empty ESM entry; locate the package's UMD assets explicitly.
const wrapperPackageRoot = dirname(dirname(dirname(require.resolve('@ffmpeg/ffmpeg'))))
const wrapperDir = join(wrapperPackageRoot, 'dist/umd')
for (const name of ['ffmpeg.js', '814.ffmpeg.js']) {
  const source = join(wrapperDir, name)
  if (!existsSync(source)) throw new Error('Missing @ffmpeg/ffmpeg asset: ' + source)
  copyFileSync(source, join(outputDir, name))
}
console.log('Prepared same-origin FFmpeg wrapper, worker, and core assets.')
