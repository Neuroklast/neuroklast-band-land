import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { requiresAdminMfaPage } from '@/lib/admin-mfa-policy'

/** Keep navigation protection synchronized with every strict admin() Server Component. */
function strictAdminPages(dir: string): string[] {
  const pages: string[] = []
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, item.name)
    if (item.isDirectory()) pages.push(...strictAdminPages(path))
    else if (item.name === 'page.tsx' && /\bawait\s+admin\s*\(/.test(readFileSync(path, 'utf8'))) pages.push(path)
  }
  return pages
}

describe('strict admin MFA page registry completeness', () => {
  it('covers every route page invoking the strict MFA guard', () => {
    const root = join(process.cwd(), 'app', 'admin', '(protected)')
    const missing = strictAdminPages(root)
      .map(path => '/admin/' + relative(root, path)
        .split(sep).join('/')
        .replace(/\/page\.tsx$/, '')
        .replace(/\[[^/]+\]/g, 'example-id'))
      .filter(path => !requiresAdminMfaPage(path, 'GET'))
    expect(missing).toEqual([])
  })
})
