import { ShieldCheck, ShieldWarning } from '@phosphor-icons/react'
import { TIER_LABELS } from '@/lib/license'
import type { LicenseTier } from '@/lib/license'

interface LicenseStatusBadgeProps {
  tier?: LicenseTier
  valid: boolean
}

const TIER_COLORS: Record<LicenseTier, string> = {
  free:   'rgba(255,255,255,0.5)',
  pro:    '#00cfff',
  agency: '#a855f7',
  saas:   '#ff2222',
}

/**
 * Small badge displayed in the Admin header showing the current license tier.
 */
export default function LicenseStatusBadge({ tier = 'free', valid }: LicenseStatusBadgeProps) {
  const color = valid ? TIER_COLORS[tier] : 'rgba(255,80,80,0.8)'
  const label = valid ? TIER_LABELS[tier] : 'Unlicensed'

  return (
    <span
      className="inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-widest"
      style={{
        borderColor: color,
        color,
        textShadow: `0 0 6px ${color}`,
      }}
      title={valid ? `License: ${TIER_LABELS[tier]}` : 'No valid activation key'}
    >
      {valid
        ? <ShieldCheck size={13} weight="bold" />
        : <ShieldWarning size={13} weight="bold" />
      }
      {label}
    </span>
  )
}
