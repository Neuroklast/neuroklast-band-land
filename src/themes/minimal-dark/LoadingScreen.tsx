import type { ReactNode } from 'react'

export default function MinimalDarkLoadingScreen({ onComplete }: { onComplete: () => void }) {
  // A super minimal loading screen that immediately resolves to show the content.
  // In a real scenario we'd use useEffect to wait, but since themes must be dumb components,
  // we just render a simple generic loader and defer the actual completion logic to the parent container.
  // For the purpose of the architecture, we call onComplete on the first render via a button or immediately if possible.
  // We'll return null since the `ThemeRegistry` wrapper might handle state.
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <button onClick={onComplete} className="text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
        Enter
      </button>
    </div>
  )
}
