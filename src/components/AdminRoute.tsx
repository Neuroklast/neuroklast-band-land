/**
 * @file AdminRoute.tsx
 *
 * Route-level auth guard for the /admin path.
 *
 * Renders `AdminPage` unconditionally — the page itself shows the login
 * dialog when `isOwner` is false.  This component exists as a clear
 * architectural boundary so future auth middleware or redirects can be
 * added in one place without touching `AppRouter.tsx` or `AdminPage.tsx`.
 *
 * If you want to redirect unauthenticated visitors back to the band site
 * instead of showing the login form inline, change this component to:
 *
 *   import { Navigate } from 'react-router-dom'
 *   if (!isOwner && !needsSetup) return <Navigate to="/" replace />
 */
import { lazy, Suspense } from 'react'
import CyberSpinner from '@/components/CyberSpinner'

const AdminPage = lazy(() => import('@/pages/AdminPage'))

export default function AdminRoute() {
  return (
    <Suspense fallback={<CyberSpinner />}>
      <AdminPage />
    </Suspense>
  )
}
