import { type BackgroundEffectsSlotProps } from '@/lib/types';

export function CyberpunkBackgroundEffects({ className }: BackgroundEffectsSlotProps) {
  return (
    <div className={`relative min-h-screen w-full bg-[var(--background)] ${className || ''}`}>
      {/* Scanlines */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* Vignette */}
      <div className="fixed inset-0 z-40 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
    </div>
  );
}
