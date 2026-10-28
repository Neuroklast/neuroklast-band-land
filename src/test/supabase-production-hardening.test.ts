import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const schema = readFileSync('supabase/schema.sql', 'utf8')

describe('production database least privilege', () => {
  it('does not grant browser roles direct access to event analytics', () => {
    expect(schema).toContain(
      'REVOKE ALL ON TABLE public.analytics_events FROM PUBLIC, anon, authenticated;')
    expect(schema).toContain(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.analytics_events TO service_role;')
  })
  it('keeps privileged catalog queries server-side and private', () => {
    const catalog = readFileSync('lib/plugins/public-catalog.ts', 'utf8')
    expect(catalog).toContain("import 'server-only'")
    expect(catalog).toContain("const supabase = db()")
    expect(catalog).not.toContain('createPublicClient')
    expect(schema).toContain(
      'REVOKE ALL ON FUNCTION public.plugin_public_catalog() FROM PUBLIC, anon, authenticated;')
    expect(schema).toContain(
      'GRANT EXECUTE ON FUNCTION public.plugin_public_catalog() TO service_role;')
  })
  it('makes anonymous product catalogue access read-only', () => {
    expect(schema).toContain(
      'REVOKE INSERT, UPDATE, DELETE ON TABLE public.products FROM PUBLIC, anon;')
  })
  it('keeps the flagged foreign-key indexes in the canonical schema', () => {
    const pairs = [
      ['mcp_content_requests','requested_by'],
      ['mcp_content_requests','reviewed_by'],
      ['mcp_oauth_clients','created_by'],
      ['mcp_oauth_clients','updated_by'],
      ['mcp_oauth_mfa_grants','client_id'],
      ['plugin_admin_audit','actor'],
      ['plugin_admin_audit','product_id'],
      ['plugin_download_events','artifact_id'],
      ['plugin_download_events','release_id'],
      ['plugin_download_events','product_id'],
      ['plugin_licenses','created_by'],
      ['plugin_orders','license_id'],
      ['plugin_orders','user_id'],
      ['plugin_releases','published_by'],
      ['privacy_requests','completed_by'],
      ['privacy_requests','identity_verified_by'],
      ['sync_jobs','created_by'],
    ] as const
    for (const [table, column] of pairs) {
      expect(schema).toContain(
        `CREATE INDEX IF NOT EXISTS idx_${table}_${column}_fk ON public.${table} (${column});`)
    }
  })
})
