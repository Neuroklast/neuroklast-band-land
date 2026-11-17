import { describe, expect, it } from 'vitest'
import { billingLedgerCsv } from '../csv'

describe('billing ledger export',()=>{
 it('escapes untrusted customer names and formats exact EUR cent totals',()=>{
  const csv=billingLedgerCsv([{
   number:'RE-2026-000001',status:'issued',issue_date:'2026-11-17',
   service_date:'2026-11-14',due_date:'2026-12-01',
   recipient:{name:'=1+1,"scam"'},total_cents:60001,paid_cents:10000,
  }],'2026-11-17')
  expect(csv.startsWith('\uFEFF')).toBe(true)
  expect(csv).toContain('"\'=1+1,""scam"""')
  expect(csv).toContain('"600,01";"100,00";"500,01"')
  expect(csv).toContain('"partial"')
 })
 it('rejects inconsistent payments instead of silently exporting them',()=>{
  expect(()=>billingLedgerCsv([{status:'issued',total_cents:100,paid_cents:101}],'2026-11-17')).toThrow()
 })
})
