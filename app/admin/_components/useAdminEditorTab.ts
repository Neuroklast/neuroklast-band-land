'use client'

import { useCallback, useEffect, useState } from 'react'

/** Tabs in the URL, with back/forward support and without remounting draft fields. */
export function useAdminEditorTab<Id extends string>(
  allowed: readonly Id[],
  fallback: Id,
): readonly [Id, (tab: Id) => void] {
  const [active, setActive] = useState<Id>(fallback)

  useEffect(() => {
    const sync = () => {
      const tab = new URLSearchParams(window.location.search).get('tab') as Id | null
      setActive(tab && allowed.includes(tab) ? tab : fallback)
    }
    sync()
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [allowed, fallback])

  const select = useCallback((tab: Id) => {
    if (!allowed.includes(tab)) return
    setActive(tab)
    const url = new URL(window.location.href)
    if (tab === fallback) url.searchParams.delete('tab')
    else url.searchParams.set('tab', tab)
    window.history.pushState(null, '', url.toString())
  }, [allowed, fallback])

  return [active, select] as const
}
