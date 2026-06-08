import { type OverlayTransitionSlotProps } from '@/lib/types';

// Wrapper component to handle the children prop correctly
export function CyberpunkOverlayTransition({ show, onComplete }: OverlayTransitionSlotProps) {
  // As an effect overlay wrapper, we usually get children injected by the render tree.
  // The interface only defines show/onComplete, so we mock children for the transition
  return (
    <div
      className={`transition-all duration-500 origin-top
        ${show ? 'opacity-100 scale-y-100 filter-none' : 'opacity-0 scale-y-0 grayscale blur-sm pointer-events-none'}
      `}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
        position: 'fixed',
        inset: 0,
        zIndex: 100
      }}
      onTransitionEnd={onComplete}
    >
      {/* Occasional screen tear / scanline flash effect when transitioning in */}
      {show && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-[var(--primary)]/10 mix-blend-screen animate-pulse mix-blend-overlay" style={{ animationDuration: '0.2s', animationIterationCount: 2 }} />
      )}
    </div>
  );
}
