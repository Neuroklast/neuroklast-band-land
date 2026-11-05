/**
 * Low-false-positive screening for unsolicited sales pitches on the public
 * contact form. Legitimate booking/press/support enquiries should pass.
 * This is a cheap first layer, not a substitute for Turnstile.
 */
export function isUnsolicitedSalesPitch(input: {
  subject: string
  message: string
}): boolean {
  const subject = input.subject.toLowerCase()
  const body = input.message.toLowerCase()
  const text = subject + '\n' + body

  // Bulk outreach messages commonly carry an unsubscribe footer. A link to an
  // unsubscribe page in a first-contact enquiry is a strong spam indicator.
  if (/\b(unsubscribe|opt[ -]?out)\b/i.test(text) &&
      /\b(lead|sales|client|customer|agency|marketing|demo|trial|b2b)\b/i.test(text)) {
    return true
  }

  const leadPitch =
    /\b(lead generation|lead gen|qualified leads|more leads|b2b clients?|new b2b customers?|find new b2b clients?|booked meetings?|appointment setting|sales pipeline)\b/i.test(text)
  const salesOffer =
    /\b(free trial|days free|no credit card|we (?:can|will|help|make sure)|our (?:ai|service|platform|agency)|get more clients|increase (?:your )?(?:sales|revenue|conversions)|free way to find)\b/i.test(text)
  const coldOutreach =
    /\b(demo|sales call|lead|prospects?|outreach|marketing automation|growth agency|b2b)\b/i.test(text)
  const promotionalSubject =
    /\b(free way|more leads|new clients|b2b clients|boost (?:your )?sales|100x more likely)\b/i.test(subject)

  return (leadPitch && salesOffer) ||
    (promotionalSubject && coldOutreach)
}

/** Bait fields are not user inputs. Genuine senders never see or fill them. */
export function hasFilledHoneypot(formData: FormData): boolean {
  return ['_hp', 'website'].some((key) => {
    const value = formData.get(key)
    return typeof value === 'string' && value.trim().length > 0
  })
}
