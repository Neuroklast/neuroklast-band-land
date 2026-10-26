import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('privacy and compliance invariants', () => {
  it('does not expose anonymous telemetry inserts through the Data API', () => {
    const schema = read('supabase/schema.sql')
    expect(schema).toContain('REVOKE INSERT ON TABLE public.analytics_events FROM PUBLIC, anon, authenticated')
    expect(schema).toContain('DROP POLICY IF EXISTS "anon insert analytics"')
    expect(schema).not.toMatch(/GRANT INSERT ON TABLE public.analytics_events TO anon/i)
    expect(schema).not.toMatch(/grant insert on public.analytics_events to anon/i)
  })

  it('checks signed consent before server-side telemetry writes', () => {
    const route = read('app/api/analytics/route.ts')
    expect(route.indexOf('verifyAnalyticsConsent(')).toBeLessThan(route.indexOf("from('analytics_events').insert"))
    expect(route).toContain('const supabase = db()')
    expect(route).not.toContain("const supabase = createPublicClient()\n    const { error } = await supabase.from('analytics_events')")
  })

  it('never injects runtime Google Fonts stylesheets', () => {
    for (const file of ['public/theme-restore.js', 'app/layout.tsx', 'src/lib/theme-application.ts', 'src/lib/font-loader.ts']) {
      expect(read(file)).not.toContain('https://fonts.googleapis.com')
      expect(read(file)).not.toContain('https://fonts.gstatic.com')
    }
  })
})
