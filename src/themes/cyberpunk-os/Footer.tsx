import { type FooterSlotProps } from '@/lib/types';

export function CyberpunkFooter({ socialLinks, siteName, label }: FooterSlotProps) {
  return (
    <footer className="w-full border-t border-[var(--primary)]/30 bg-[var(--background)] font-mono text-xs sm:text-sm text-[var(--foreground-alpha-70)] py-4">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--primary)] animate-pulse" />
          <span className="uppercase tracking-widest text-[var(--primary)]">SYS.STATUS: ONLINE</span>
        </div>

        {socialLinks && Object.values(socialLinks).some(link => link) && (
          <div className="flex items-center gap-6">
            {Object.entries(socialLinks).map(([platform, url]) => {
              if (!url) return null;
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--primary)] transition-colors uppercase tracking-wider"
                >
                  [{platform}]
                </a>
              );
            })}
          </div>
        )}

        <div className="uppercase tracking-wider opacity-50">
          © {new Date().getFullYear()} {siteName || 'NODE_SECURE'} {label ? `// ${label}` : ''}
        </div>

      </div>
    </footer>
  );
}
