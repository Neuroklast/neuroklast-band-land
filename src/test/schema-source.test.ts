import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('supabase schema source', () => {
  it('is a single idempotent schema.sql with no migration files', () => {
    expect(existsSync('supabase/schema.sql')).toBe(true)
    expect(existsSync('supabase/migrations')).toBe(false)
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.products')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.neurokore_licenses')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.neurokore_releases')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.neurokore_release_artifacts')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_activate')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_fulfill')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_publish_release')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_public_releases')
    expect(sql).toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.products[\s\S]*TO anon;/)
    expect(sql).toMatch(/GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE[\s\S]*public\.products[\s\S]*TO authenticated, service_role;/)
    expect(sql).not.toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.neurokore_licenses[\s\S]*TO anon;/)
    expect(sql).not.toMatch(/GRANT SELECT ON TABLE[\s\S]*public\.neurokore_releases[\s\S]*TO anon;/)
  })
})
