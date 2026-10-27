/**
 * Maps durable purchases to the v2 perpetual tier already supported by the
 * native NEUROKORE verifier. Expiring grants and v3 remain renewable leases.
 */
export const PERPETUAL_EXPIRY_UNIX = 253402300799 // 9999-12-31T23:59:59Z

export type ActivationEntitlement = {
  tier: 'alpha' | 'full'
  license_format: 'v2' | 'v3'
  expires_at: string | null
}
export type ActivationTerms = {
  tier: 'alpha' | 'full' | 'perpetual'
  expiresAt: number
}

export function activationTerms(entitlement: ActivationEntitlement, now: number): ActivationTerms {
  const hasPermanentPurchase = entitlement.license_format === 'v2'
    && entitlement.tier === 'full' && entitlement.expires_at === null
  if (hasPermanentPurchase) return { tier: 'perpetual', expiresAt: PERPETUAL_EXPIRY_UNIX }

  const entitlementEnd = entitlement.expires_at === null
    ? now + 30 * 86400 : Math.floor(Date.parse(entitlement.expires_at) / 1000)
  if (!Number.isFinite(entitlementEnd) || entitlementEnd <= now) {
    throw new Error('License entitlement expired or invalid')
  }
  return { tier: entitlement.tier, expiresAt: Math.min(entitlementEnd, now + 30 * 86400) }
}
