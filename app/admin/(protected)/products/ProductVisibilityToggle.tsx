'use client'

import { useState, useTransition } from 'react'
import { toggleProductVisibility } from '@/app/admin/_actions/products'

export function ProductVisibilityToggle({
  productId,
  active: initialActive,
}: {
  productId: string
  active: boolean
}) {
  const [active, setActive] = useState(initialActive)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !active
    setActive(next)
    startTransition(async () => {
      const result = await toggleProductVisibility(productId, next)
      if (result?.error) setActive(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-label={active ? 'Hide product on site' : 'Show product on site'}
      className={`text-xs px-2 py-0.5 rounded border transition-colors disabled:opacity-50 ${
        active
          ? 'border-green-700/50 text-green-400'
          : 'border-zinc-700 text-zinc-500'
      }`}
    >
      {active ? 'Visible' : 'Hidden'}
    </button>
  )
}
