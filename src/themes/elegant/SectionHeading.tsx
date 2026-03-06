import type { SectionHeadingSlotProps } from '@/lib/types'

/**
 * Elegant theme section heading — serif typography with gentle underline.
 * No typing effect or glitch animation; just a clean fade-in.
 */
export default function ElegantSectionHeading({ title, prefix }: SectionHeadingSlotProps) {
  return (
    <div className="mb-8">
      {prefix && (
        <span className="text-primary/50 text-xs uppercase tracking-widest font-mono mr-2">
          {prefix}
        </span>
      )}
      <h2 className="font-serif text-2xl md:text-3xl text-foreground/90 italic border-b border-primary/20 pb-3 inline-block">
        {title}
      </h2>
    </div>
  )
}
