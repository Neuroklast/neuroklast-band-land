import { type FooterSlotProps } from '@/lib/types'
import { Separator } from '@/components/ui/separator'

export default function MinimalDarkFooter({
  siteName,
  onImpressum,
  onDatenschutz,
}: FooterSlotProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-background border-t border-border/40 py-12 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground tracking-widest uppercase">
        <div>
          &copy; {currentYear} {siteName || 'Artist'}.
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onImpressum}
            className="hover:text-primary transition-colors"
          >
            Impressum
          </button>
          <Separator orientation="vertical" className="h-4" />
          <button
            onClick={onDatenschutz}
            className="hover:text-primary transition-colors"
          >
            Datenschutz
          </button>
        </div>
      </div>
    </footer>
  )
}
