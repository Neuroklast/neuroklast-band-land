import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className }: SectionDividerSlotProps) {
  return <div className={`w-full my-8 ${className ?? ''}`} aria-hidden="true" />
}

SectionDivider.displayName = 'SectionDivider'
