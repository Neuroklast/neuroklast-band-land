import type { SectionHeadingSlotProps } from '@/lib/types'

/**
 * Minimal theme section heading — clean sans-serif, no effects.
 */
export default function MinimalSectionHeading({ title, prefix }: SectionHeadingSlotProps) {
  return (
    <h2 className="text-xl font-semibold text-foreground/80 tracking-wide mb-6 pb-2 border-b border-border/40">
      {prefix && <span className="text-foreground/40 mr-2 text-sm">{prefix}</span>}
      {title}
    </h2>
  )
}
