import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const schema = readFileSync(join(process.cwd(), 'supabase', 'schema.sql'), 'utf8')

describe('NEUROKORE database deployment safety', () => {
  it('has valid dollar-quoted sandbox cleanup SQL', () => {
    const start = schema.indexOf('CREATE OR REPLACE FUNCTION public.plugin_delete_sandbox_license(')
    const end = schema.indexOf('CREATE OR REPLACE FUNCTION public.plugin_publish_release(', start)
    expect(start).toBeGreaterThan(0)
    expect(end).toBeGreaterThan(start)
    const fn = schema.slice(start, end)
    expect(fn).toContain('AS $$')
    expect(fn).toContain('END;\n$$;')
    expect(fn).toContain('test_deleted_at')
    expect(fn).toContain('cs_test_')
    expect(schema).not.toMatch(/AS \\$\n/)
  })
  it('restricts database fulfilment and sandbox deletion to service_role', () => {
    expect(schema).toContain(
      'REVOKE ALL ON FUNCTION public.plugin_fulfill(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;'
    )
    expect(schema).toContain(
      'REVOKE ALL ON FUNCTION public.plugin_delete_sandbox_license(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;'
    )
    expect(schema).toContain(
      'GRANT EXECUTE ON FUNCTION public.plugin_delete_sandbox_license(uuid, uuid, uuid) TO service_role;'
    )
  })
  it('locks down privileged Supabase auth signup trigger', () => {
    expect(schema).toContain("$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';")
    expect(schema).toContain(
      'REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;'
    )
  })
})
