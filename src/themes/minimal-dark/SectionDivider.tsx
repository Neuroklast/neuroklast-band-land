import type { SectionDividerSlotProps } from '@/lib/types'

export default function SectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`w-full flex items-center justify-center py-12 ${className || ''}`}>
      <div className="flex items-center gap-4 text-muted-foreground/30 font-mono text-xs">
        <span>+</span>
        <div className="h-px w-24 bg-border"></div>
        <span className="text-accent/50">///</span>
        <div className="h-px w-24 bg-border"></div>
        <span>+</span>
      </div>
    </div>
  )
}
