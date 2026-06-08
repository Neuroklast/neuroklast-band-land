import { type SectionDividerSlotProps } from '@/lib/types';

export function CyberpunkSectionDivider({ className }: SectionDividerSlotProps) {
  return (
    <div className={`w-full py-12 flex items-center justify-center font-mono relative overflow-hidden ${className || ''}`}>
      <div className="absolute left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-[var(--primary)]" />

      <div className="px-6 flex items-center gap-3">
        <span className="text-[var(--primary)] text-sm opacity-50">{'//'}</span>
        <span className="uppercase tracking-widest text-sm font-bold text-[var(--foreground)]">
          SECTOR_DIVIDER
        </span>
        <span className="text-[var(--primary)] text-sm opacity-50">{'//'}</span>
      </div>

      <div className="absolute right-0 w-1/3 h-[1px] bg-gradient-to-l from-transparent via-[var(--primary)]/50 to-[var(--primary)]" />
    </div>
  );
}
