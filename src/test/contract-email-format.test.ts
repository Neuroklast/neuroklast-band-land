import { describe, expect, it } from 'vitest'
import { contractDocumentText, contractEmailText } from '@/lib/neurokore/email-format'

describe('contract confirmation plain text', () => {
  it('separates legal clauses with readable newlines', () => {
    const text = contractDocumentText([
      { title: 'Terms', paragraphs: ['Clause one', 'Clause two'] },
      { title: 'Withdrawal', paragraphs: ['Fourteen days'] },
    ])
    expect(text).toBe('Terms\nClause one\nClause two\n\nWithdrawal\nFourteen days')
    expect(text).not.toContain('\\n')
  })
  it('separates the order summary from the legal annex', () => {
    expect(contractEmailText(['Order #123', '', 'Terms', 'Text']))
      .toBe('Order #123\n\nTerms\nText')
  })
})
