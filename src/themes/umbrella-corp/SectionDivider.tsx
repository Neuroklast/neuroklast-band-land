import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className = '' }: SectionDividerSlotProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="umbrella-corp-warning-stripe" aria-hidden="true" />
    </div>
  )
}
