import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseAppKeyboardShortcutsParams {
  isOwner: boolean
}

export function useAppKeyboardShortcuts({
  isOwner,
}: UseAppKeyboardShortcutsParams): void {
  const navigate = useNavigate()
  const prevIsOwnerRef = useRef(false)

  // ── #admin hash → navigate to /admin ────────────────────────────────────
  useEffect(() => {
    const handleAdminHash = () => {
      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        navigate('/admin')
      }
    }
    // Check once on mount
    handleAdminHash()
    window.addEventListener('hashchange', handleAdminHash)
    return () => window.removeEventListener('hashchange', handleAdminHash)
  }, [navigate])

  // ── CMD+K / CTRL+K → navigate to /admin ─────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        navigate('/admin')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  // ── Auto-redirect to /admin after login ──────────────────────────────────
  useEffect(() => {
    if (isOwner && !prevIsOwnerRef.current) {
      navigate('/admin')
    }
    prevIsOwnerRef.current = isOwner
  }, [isOwner, navigate])
}
