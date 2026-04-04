import { type HeroSlotProps } from '@/lib/types';
import { useTranslation } from 'react-i18next';

export function CyberpunkHero({ name, genres }: HeroSlotProps) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full h-[80vh] flex flex-col items-center justify-center overflow-hidden border-b border-[var(--primary)]/30 bg-[var(--background)]">
      {/* Background Matrix/Grid overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             backgroundPosition: 'center center'
           }}
      />

      {/* Glitch Overlay Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjZmZmIiAvPgo8L3N2Zz4=')]"></div>

      <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-start font-mono">
        <div className="text-[var(--primary)] text-sm mb-4 tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--primary)] animate-pulse"></span>
          SYS.BOOT_SEQ // KERNEL_ACTIVE
        </div>

        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-[var(--foreground)] relative group">
          <span className="absolute -left-1 top-0 text-[var(--primary)] opacity-50 translate-x-[2px] group-hover:animate-ping mix-blend-screen" aria-hidden="true">{name || t('hero.defaultArtist', 'ARTIST NAME')}</span>
          <span className="absolute -left-1 top-0 text-[var(--accent)] opacity-50 -translate-x-[2px] group-hover:animate-ping mix-blend-screen" aria-hidden="true">{name || t('hero.defaultArtist', 'ARTIST NAME')}</span>
          <span className="relative z-10">{name || t('hero.defaultArtist', 'ARTIST NAME')}</span>
        </h1>

        {genres && genres.length > 0 && (
          <div className="mt-6 border-l-2 border-[var(--primary)] pl-4 py-1">
            <p className="text-xl md:text-2xl text-[var(--foreground-alpha-80)]">
              {genres.join(' // ')}
            </p>
          </div>
        )}

        <div className="mt-12 flex gap-4">
          <button className="px-6 py-2 bg-[var(--primary)]/10 border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-colors uppercase text-sm tracking-wider flex items-center gap-2">
            [ INITIALIZE ]
          </button>
        </div>
      </div>
    </div>
  );
}
