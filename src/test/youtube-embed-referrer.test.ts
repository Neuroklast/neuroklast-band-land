import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../..')
const readSource = (path: string): string => readFileSync(resolve(root, path), 'utf8')

describe('YouTube iframe referrer policy (player error 153)', () => {
  it.each([
    'components/YouTubeEmbed.tsx',
    'src/components/YouTubeEmbed.tsx',
    'src/components/widgets/YouTubeWidget.tsx',
  ])('%s sends the embedding site origin to YouTube', (path) => {
    const source = readSource(path)
    expect(source).toMatch(/<iframe\b[\s\S]*?referrerPolicy="strict-origin-when-cross-origin"/)
    expect(source).not.toContain('referrerPolicy="no-referrer"')
  })

  it('keeps the global Referrer-Policy aligned', () => {
    expect(readSource('security-headers.mjs')).toContain(
      "key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'",
    )
  })

  it('keeps the current homepage player behind explicit two-click consent', () => {
    const source = readSource('components/YouTubeEmbed.tsx')
    expect(source).toContain('onConsent={() => setConsented(true)}')
    expect(source).toContain('holdIncoming={consented}')
    expect(readSource('app/_components/public/MusicHighlightsSection.tsx')).toContain(
      "import YouTubeEmbed from '@/components/YouTubeEmbed'",
    )
  })
})
