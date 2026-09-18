'use client'

import { useState, useTransition } from 'react'
import { togglePartnerLogoWhite } from '@/app/admin/_actions/partners'

interface PartnerLogoWhiteToggleProps {
  partnerId: string
  logoWhite: boolean
}

export function PartnerLogoWhiteToggle({
  partnerId,
  logoWhite: initial,
}: PartnerLogoWhiteToggleProps) {
  const [logoWhite, setLogoWhite] = useState(initial)
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    const next = !logoWhite
    setLogoWhite(next)
    startTransition(async () => {
      const result = await togglePartnerLogoWhite(partnerId, next)
      if (result?.error) setLogoWhite(!next)
    })
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      aria-pressed={logoWhite}
      aria-label={logoWhite ? 'White logo on' : 'White logo off'}
      className={`inline-flex min-h-[44px] items-center px-2 text-xs rounded border transition-colors disabled:opacity-50 ${
        logoWhite
          ? 'border-zinc-500 text-white bg-zinc-800'
          : 'border-zinc-700 text-zinc-500'
      }`}
    >
      {logoWhite ? 'White' : 'Colour'}
    </button>
  )
}
