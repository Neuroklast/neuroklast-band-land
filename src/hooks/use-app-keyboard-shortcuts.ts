import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseAppKeyboardShortcutsParams {
  isOwner: boolean
}

export function useAppKeyboardShortcuts({
  isOwner,
}: UseAppKeyboardShortcutsParams): void {
  const router = useRouter()
  const prevIsOwnerRef = useRef(false)

  // ── #admin hash → navigate to /admin ────────────────────────────────────
  useEffect(() => {
    const handleAdminHash = () => {
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        router.push('/admin')
      }
    }
    // Check once on mount
    handleAdminHash()
    window.addEventListener('hashchange', handleAdminHash)
    return () => window.removeEventListener('hashchange', handleAdminHash)
  }, [router])

  // ── CMD+K / CTRL+K → navigate to /admin ─────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        router.push('/admin')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // ── Auto-redirect to /admin after login ──────────────────────────────────
  useEffect(() => {
    if (isOwner && !prevIsOwnerRef.current) {
      router.push('/admin')
    }
    prevIsOwnerRef.current = isOwner
  }, [isOwner, router])
}
