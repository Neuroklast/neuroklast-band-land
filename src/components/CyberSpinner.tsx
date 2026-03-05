/**
 * CyberSpinner – lightweight loading indicator used as a Suspense fallback for
 * lazy-loaded admin components.  Styled entirely with CSS variables so it
 * respects the active theme automatically.
 */
export default function CyberSpinner({ label = 'LOADING' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 px-4 text-primary/60 font-mono text-xs tracking-widest">
      <svg
        className="animate-spin"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2 A10 10 0 0 1 22 12" />
      </svg>
      <span>{label}</span>
    </div>
  )
}
