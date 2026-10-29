'use client'

import { useState, useTransition } from 'react'

interface AdminVisibilityToggleProps {
  id: string
  initialActive: boolean
  onToggle: (id: string, active: boolean) => Promise<unknown>
  showLabel: string
  hideLabel: string
  hoverHighlight?: boolean
}

/**
 * Shared optimistic visibility control. Domain-specific authorization, updates
 * and cache invalidation remain in each existing server action.
 */
export function AdminVisibilityToggle({
  id,
  initialActive,
  onToggle,
  showLabel,
  hideLabel,
  hoverHighlight = false,
}: AdminVisibilityToggleProps) {
  const [active, setActive] = useState(initialActive)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !active
    setActive(next)
    startTransition(async () => {
      try {
        const result = await onToggle(id, next)
        if (result && typeof result === 'object' && 'error' in result && result.error) {
          setActive(!next)
        }
      } catch {
        // Keep a failed network action from leaving an unsaved visible state.
        setActive(!next)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? hideLabel : showLabel}
      className={`text-xs px-2 py-0.5 rounded border transition-colors disabled:opacity-50 ${
        active
          ? `border-green-700/50 text-green-400${hoverHighlight ? ' hover:border-green-600' : ''}`
          : `border-zinc-700 text-zinc-500${hoverHighlight ? ' hover:text-zinc-300' : ''}`
      }`}
    >
      {active ? 'Visible' : 'Hidden'}
    </button>
  )
}
