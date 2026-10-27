import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('supabase schema source', () => {
  it('is a single idempotent schema.sql with no migration files', () => {
    expect(existsSync('supabase/schema.sql')).toBe(true)
    expect(existsSync('supabase/migrations')).toBe(false)
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.products')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.plugin_licenses')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.plugin_releases')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.plugin_release_artifacts')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.plugin_product_secrets')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_activate')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_fulfill')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_record_payment_event')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_claim_confirmation')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.plugin_payment_events')
    expect(sql).toContain('ALTER TABLE public.plugin_payment_events ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.plugin_record_payment_event')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_publish_release')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_delete_product')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.plugin_public_catalog')
    expect(sql).toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.products[\s\S]*TO anon;/)
    expect(sql).toMatch(/GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE[\s\S]*public\.products[\s\S]*TO authenticated, service_role;/)
    expect(sql).not.toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.plugin_licenses[\s\S]*TO anon;/)
    expect(sql).not.toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.plugin_releases[\s\S]*TO anon;/)
  })

  it('renames legacy neurokore tables in place instead of dropping data', () => {
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    expect(sql).toContain("ALTER TABLE public.neurokore_licenses RENAME TO plugin_licenses")
    expect(sql).toContain("ALTER TABLE public.neurokore_releases RENAME TO plugin_releases")
    expect(sql).not.toMatch(/DROP TABLE[^;]*neurokore/i)
  })
})

