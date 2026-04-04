import { type OverlayModalSlotProps } from '@/lib/types';
import { ReactNode } from 'react';

// Simplified helper component for default rendering since we don't know the exact overlay data structure here
function DefaultOverlayContent({ overlay }: { overlay: any }) {
  return (
    <div className="text-[var(--foreground)] p-4">
      <h2 className="text-2xl font-bold mb-4">{overlay.type.toUpperCase()} DATA</h2>
      <pre className="text-xs overflow-auto max-h-[60vh] bg-black/50 p-4 border border-[var(--border)]">
        {JSON.stringify(overlay.data, null, 2)}
      </pre>
    </div>
  );
}

export function CyberpunkOverlayModal({ overlay, onClose }: OverlayModalSlotProps) {
  if (!overlay) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 font-mono">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-[var(--background)] border border-[var(--primary)] shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] flex flex-col max-h-[90vh]">

        {/* Terminal Window Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--primary)]/10 border-b border-[var(--primary)] text-[var(--primary)] text-sm tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--primary)] animate-pulse" />
            <span>ROOT_ACCESS // OVERRIDE</span>
          </div>
          <button
            onClick={onClose}
            className="hover:text-[var(--accent)] hover:bg-[var(--primary)]/20 px-2 py-1 transition-colors"
          >
            [X] CLOSE
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <DefaultOverlayContent overlay={overlay} />
        </div>

        {/* Glitch accents */}
        <div className="absolute -left-1 top-10 w-1 h-8 bg-[var(--primary)]" />
        <div className="absolute -right-1 bottom-10 w-1 h-8 bg-[var(--primary)]" />
      </div>
    </div>
  );
}
