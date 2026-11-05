import { describe, expect, it } from 'vitest'
import { hasFilledHoneypot, isUnsolicitedSalesPitch } from '@/lib/contact-spam'

describe('contact spam screening', () => {
  it('rejects the sales pitches shown in the admin inbox', () => {
    expect(isUnsolicitedSalesPitch({
      subject: '5 minutes vs 30: 100x more likely to reach a lead',
      message: 'We make sure you get leads. Our AI voice agent books appointments. 14 days free. Unsubscribe here.',
    })).toBe(true)
    expect(isUnsolicitedSalesPitch({
      subject: 'A free way to find new B2B clients',
      message: 'We can find you B2B clients with our outreach platform.',
    })).toBe(true)
  })

  it('allows genuine enquiries including commercial offers', () => {
    expect(isUnsolicitedSalesPitch({
      subject: 'Booking request',
      message: 'Can Neuroklast play our festival in December? Here is our website.',
    })).toBe(false)
    expect(isUnsolicitedSalesPitch({
      subject: 'Licensing support',
      message: 'I cannot activate my licence. Can you help?',
    })).toBe(false)
    expect(isUnsolicitedSalesPitch({
      subject: 'Press interview',
      message: 'We would like to interview the band for our music magazine.',
    })).toBe(false)
  })

  it('silently catches both decoy fields', () => {
    const form = new FormData()
    expect(hasFilledHoneypot(form)).toBe(false)
    form.set('website', 'https://spammer.example')
    expect(hasFilledHoneypot(form)).toBe(true)
    form.delete('website')
    form.set('_hp', 'test')
    expect(hasFilledHoneypot(form)).toBe(true)
  })
})
