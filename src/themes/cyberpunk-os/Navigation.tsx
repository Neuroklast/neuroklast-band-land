import { type NavigationSlotProps } from '@/lib/types';

export function CyberpunkNavigation({ items, siteName, onNavigate }: NavigationSlotProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/90 backdrop-blur-sm border-b border-[var(--primary)]/30 font-mono text-sm">
      <div className="w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
          <span className="text-[var(--foreground)] font-bold tracking-widest uppercase">{siteName || 'OS_SHELL'}</span>
        </div>

        <ul className="flex items-center gap-8">
          {items.map((item) => {
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate && onNavigate(item.id)}
                  className={`uppercase tracking-wider transition-colors relative group text-[var(--foreground-alpha-70)] hover:text-[var(--foreground)]`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-[1px] bg-[var(--primary)] transition-all duration-300 w-0 group-hover:w-full`} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
