const LOADER_SPAN_COUNTS: Record<string, number> = {
  'overlay-loader-boot': 5,
  'overlay-loader-blocks': 5,
  'overlay-loader-holo': 3,
}

export function OverlayShellLoader({
  loaderClass,
  loaderLabel,
  loadingText,
}: {
  loaderClass: string
  loaderLabel: string
  loadingText: string
}) {
  const spanCount = LOADER_SPAN_COUNTS[loaderClass] ?? 0

  return (
    <div className="flex min-h-[min(400px,50vh)] flex-col items-center justify-center gap-4 px-8 py-16">
      {loaderClass ? (
        <div className={loaderClass} aria-hidden>
          {Array.from({ length: spanCount }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      ) : null}
      <span className="progressive-loading-label data-label text-lg">{loadingText}</span>
      {loaderLabel ? (
        <p className="font-mono text-[9px] uppercase tracking-widest text-primary/40">{loaderLabel}</p>
      ) : null}
    </div>
  )
}
