import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('rate_limits schema', () => {
  it('hides the table from the public API', () => {
    const sql = readFileSync('supabase/schema.sql', 'utf8')
    expect(sql).toContain('ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY')
    expect(sql).toContain('REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated')
    expect(sql).toContain('CREATE OR REPLACE FUNCTION public.claim_sync_job_tick')
    expect(sql).toContain('Sweep expired keys only when a new key appears')
    expect(sql).toContain('A sweep from another new key can delete this expired row')
    expect(sql).not.toMatch(/DELETE FROM public\.rate_limits WHERE reset_at <= v_now;\s*\n\s*INSERT/)
    const claimFn = sql.slice(sql.indexOf('CREATE OR REPLACE FUNCTION public.claim_sync_job_tick'))
    const claimBody = claimFn.slice(0, claimFn.indexOf('$$;'))
    expect(claimBody).toContain("'{processing}'")
    expect(claimBody).toContain("'{processingSince}'")
    expect(claimBody).not.toMatch(/\bstatus\s*=/)
    expect(claimBody).not.toMatch(/\bphase\s*=/)
    expect(sql).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.consume_rate_limit\(text, integer, integer\)\s+TO service_role, postgres;/,
    )
  })
})
