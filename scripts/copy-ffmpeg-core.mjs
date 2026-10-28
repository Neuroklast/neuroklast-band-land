import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
// The package exports its entrypoint but not package.json.
const coreDir = dirname(require.resolve('@ffmpeg/core'))
// Never place GPL FFmpeg binaries in Next.js public/: every public file bypasses admin auth.\nconst outputDir = join(process.cwd(), '.ffmpeg-admin-assets')\n// Remove assets left by previous builds; never publish this legacy URL again.\nrmSync(join(process.cwd(), 'public/vendor/ffmpeg-core'), { recursive: true, force: true })
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
console.log('Prepared private admin-only FFmpeg assets; none are copied to public/.')
