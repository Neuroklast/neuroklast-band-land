import { type CardSlotProps } from '@/lib/types';

export function CyberpunkCard({ className, children }: CardSlotProps) {
  return (
    <div
      className={`group relative bg-[var(--background)] border border-[var(--primary)]/30 hover:border-[var(--primary)] transition-colors overflow-hidden font-mono text-left ${className || ''}`}
    >
      {/* Glitch frame corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--primary)]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--primary)]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--primary)]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--primary)]" />

      {children}
    </div>
  );
}
