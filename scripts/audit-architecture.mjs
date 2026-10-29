#!/usr/bin/env node
// Read-only architecture inventory. Does not delete or rewrite files.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'

const root = process.cwd()
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 10 * 1024 * 1024 })
  .toString('utf8').split('\0').filter(Boolean)
const runtimeRoots = ['api/', 'app/', 'components/', 'contexts/', 'hooks/', 'layouts/', 'lib/', 'services/', 'themes/']
const codeExt = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const legacyRoot = resolve(root, 'src')
const hashes = new Map()
const forbiddenImports = []

function isInLegacy(path) {
  return path === legacyRoot || path.startsWith(legacyRoot + sep)
}

for (const path of files) {
  const bytes = readFileSync(resolve(root, path))
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (!hashes.has(digest)) hashes.set(digest, [])
  hashes.get(digest).push(path)

  if (!runtimeRoots.some(prefix => path.startsWith(prefix)) || !codeExt.has(extname(path))) continue
  const text = bytes.toString('utf8')
  // Match regular imports, side-effect imports, require and dynamic import.
  const expressions = /(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\(|\bimport\s*)['"]([^'"]+)['"]/g
  for (const match of text.matchAll(expressions)) {
    const specifier = match[1]
    let target
    if (specifier.startsWith('@/src/')) {
      target = resolve(root, specifier.slice(2))
    } else if (specifier.startsWith('.')) {
      target = resolve(root, dirname(path), specifier)
    } else {
      continue
    }
    if (isInLegacy(target)) forbiddenImports.push({ file: path, import: specifier })
  }
}

const legacy = files.filter(path => path.startsWith('src/'))
const legacyTests = legacy.filter(path => /\.(?:test|spec)\.[jt]sx?$/.test(path))
const mirrors = legacy.filter(path => files.includes(path.slice(4)))
const identical = [...hashes.values()].filter(paths => paths.length > 1)
const duplicateMirrors = identical.flatMap(paths =>
  paths.filter(path => path.startsWith('src/') && paths.includes(path.slice(4)))
)
const summary = {
  trackedFiles: files.length,
  legacyFiles: legacy.length,
  legacyTests: legacyTests.length,
  legacyOtherFiles: legacy.length - legacyTests.length,
  legacyNameMirrors: mirrors.length,
  byteIdenticalLegacyMirrors: duplicateMirrors.length,
  exactDuplicateGroups: identical.length,
  forbiddenRuntimeImports: forbiddenImports,
}
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n')
} else {
  console.log('Architecture inventory:', JSON.stringify(summary, null, 2))
  if (identical.length) console.log('Exact duplicate groups (inspect, do not auto-delete):', identical.slice(0, 20))
}
if (process.argv.includes('--check') && forbiddenImports.length) {
  console.error('Runtime modules must not import legacy src/ modules. CSS and test fixtures remain supported.')
  process.exitCode = 1
}
