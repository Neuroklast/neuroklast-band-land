#!/usr/bin/env node
/**
 * Guard against accidentally reintroducing expensive builds in GitHub Actions.
 * Builds and Lighthouse must be run locally by the maintainer; Vercel still
 * builds after main merges as part of the production deploy.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const workflowDir = '.github/workflows'
const prohibited = [
  /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?build\b/i,
  /\b(?:npx\s+)?next\s+build\b/i,
  /\b(?:npx\s+)?vercel\s+build\b/i,
  /\b(?:npm|pnpm|yarn|bun)\s+exec\s+(?:next|vercel)\s+build\b/i,
]

const violations = []
for (const name of readdirSync(workflowDir).filter(name => /\.ya?ml$/.test(name))) {
  const file = join(workflowDir, name)
  const lines = readFileSync(file, 'utf8').split('\n')
  for (const [index, line] of lines.entries()) {
    if (prohibited.some(regex => regex.test(line))) {
      violations.push(`${file}:${index + 1}`)
    }
  }
}

if (violations.length > 0) {
  console.error('GitHub Actions must not perform production builds. Run locally:', violations.join(', '))
  process.exitCode = 1
} else {
  console.log('GitHub Actions build policy: OK (local builds only)')
}
