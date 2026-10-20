import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('supabase schema source', () => {
  it('is a single idempotent schema.sql with no migration files', () => {
    expect(existsSync('supabase/schema.sql')).toBe(true)
    expect(existsSync('supabase/migrations')).toBe(false)
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.products')
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS public.neurokore_licenses')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_activate')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.neurokore_fulfill')
  })
})
