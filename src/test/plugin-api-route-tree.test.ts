import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

describe('Next.js API route segments', () => {
  it('uses one dynamic parameter name for plugin API endpoints', () => {
    // Next.js does not allow [slug] and [id] siblings even if suffixes differ.
    const folder = join(process.cwd(), 'app', 'api', 'plugins')
    const paramSegments = readdirSync(folder).filter(name => /^\[.+\]$/.test(name))
    expect(paramSegments).toEqual(['[slug]'])
  })
})
