import { describe, expect, it } from 'vitest'
import { contractDocumentText, contractEmailHtml, contractEmailText } from '@/lib/neurokore/email-format'

describe('NEUROKLAST contract email', () => {
  const data = {
    title: 'Purchase confirmation',
    product: 'NEUROKORE',
    chargedAmount: '€1.00',
    accountUrl: 'https://neuroklast.net/neurokore/account',
    documentText: 'Purchase confirmation\n\nTerms & Conditions\nLegally required information.',
  }
  it('contains the entire contract and a usable licence account link', () => {
    const html = contractEmailHtml(data)
    expect(html).toContain('NK / NEUROKLAST')
    expect(html).toContain('ORDER CONFIRMED')
    expect(html).toContain('VIEW MY LICENCES')
    expect(html).toContain('https://neuroklast.net/neurokore/account')
    expect(html).toContain('Terms &amp; Conditions')
    expect(html).toContain('Legally required information.')
    expect(contractEmailText(['one', 'two'])).toBe('one\ntwo')
    expect(contractDocumentText([{title:'Legal', paragraphs:['One','Two']}])).toBe('Legal\nOne\nTwo')
  })
  it('escapes untrusted text rather than injecting HTML', () => {
    const html = contractEmailHtml({...data, product:'<img src=x onerror=alert(1)>',
      documentText:'<script>bad</script>\n\nTerms & Conditions'})
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<script>bad</script>')
    expect(html).toContain('&lt;script&gt;bad&lt;/script&gt;')
  })
  it('blocks insecure and credential-bearing account URLs', () => {
    expect(() => contractEmailHtml({...data, accountUrl:'http://localhost:3000/'})).toThrow()
    expect(() => contractEmailHtml({...data, accountUrl:'https://user:pw@example.com/'})).toThrow()
  })
})
