#!/usr/bin/env node
/**
 * Read-only inventory of static imports into legacy src/.
 *
 * This is evidence for manual review, not a dead-code detector: string-built
 * dynamic imports, filesystem references, runtime assets and framework magic
 * are intentionally not interpreted as proof that a module is unused.
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { extname, posix } from 'node:path'

const paths = execFileSync('git', ['ls-files', '-z'], { maxBuffer: 12 * 1024 * 1024 })
  .toString('utf8').split('\0').filter(Boolean)
const tracked = new Set(paths)
const codeExt = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css'])
const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json',
  '/index.ts', '/index.tsx', '/index.js', '/index.jsx']

function classify(path) {
  if (/\.(?:test|spec)\.[jt]sx?$/.test(path) || path.startsWith('e2e/') || path.startsWith('src/test/')) return 'test'
  return path.startsWith('src/') ? 'legacy' : 'canonical'
}

function resolveImport(from, specifier) {
  let path
  if (specifier.startsWith('@/')) path = specifier.slice(2)
  else if (specifier.startsWith('.')) path = posix.normalize(posix.join(posix.dirname(from), specifier))
  else return null
  // Never allow a relative import to escape the repository.
  if (path.startsWith('../') || path === '..') return null
  return extensions.map(ext => path + ext).find(candidate => tracked.has(candidate)) ?? null
}

function staticImports(text, css) {
  const expressions = css
    ? /@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g
    : /(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\(|\bimport\s*)['"]([^'"]+)['"]/g
  return [...text.matchAll(expressions)].map(match => match[1])
}

const references = new Map()
let inspected = 0
for (const from of paths) {
  if (!codeExt.has(extname(from))) continue
  inspected++
  const body = readFileSync(from, 'utf8')
  for (const specifier of staticImports(body, extname(from) === '.css')) {
    const resolved = resolveImport(from, specifier)
    if (!resolved) continue
    if (!references.has(resolved)) references.set(resolved, [])
    references.get(resolved).push({ from, type: classify(from) })
  }
}

const mirrors = paths.filter(path => path.startsWith('src/') && tracked.has(path.slice(4))
  && codeExt.has(extname(path)))
const exactMirrors = mirrors.filter(path => {
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
  return hash(path) === hash(path.slice(4))
})
const report = {
  scannedFiles: inspected,
  legacyFiles: paths.filter(path => path.startsWith('src/')).length,
  sameNameMirrors: mirrors.length,
  exactMirrors: exactMirrors.length,
  exactMirrorReferences: exactMirrors.map(path => ({
    legacy: path,
    canonical: path.slice(4),
    staticImporters: references.get(path) ?? [],
  })),
  // No automatic deletion: these may be loaded through non-literal references.
  exactMirrorsWithoutStaticImporters: exactMirrors.filter(path => !references.has(path)),
  directlyImportedLegacy: [...references.entries()]
    .filter(([path]) => path.startsWith('src/'))
    .map(([path, importers]) => ({ path, importers })),
}
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n')
} else {
  const { exactMirrorReferences, directlyImportedLegacy, ...counts } = report
  console.log('Legacy source dependency inventory:', JSON.stringify({
    ...counts,
    directlyImportedLegacyCount: directlyImportedLegacy.length,
    reviewedExactMirrors: exactMirrorReferences,
  }, null, 2))
}
