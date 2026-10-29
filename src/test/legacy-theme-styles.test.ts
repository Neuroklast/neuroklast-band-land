import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('legacy theme CSS compatibility', () => {
  it.each(['glitch-noir', 'neuroklast-industrial', 'umbrella-corp'])(
    'uses only the canonical stylesheet for %s',
    (theme) => {
      const entrypoint = readFileSync(`src/themes/${theme}/index.ts`, 'utf8')
      const canonical = `themes/${theme}/styles.css`
      expect(entrypoint).toContain(`import '../../../${canonical}'`)
      expect(existsSync(canonical)).toBe(true)
      expect(existsSync(`src/themes/${theme}/styles.css`)).toBe(false)
      expect(readFileSync(canonical, 'utf8').length).toBeGreaterThan(0)
    },
  )
})
