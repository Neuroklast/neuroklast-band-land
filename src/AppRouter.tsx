/**
 * @file AppRouter.tsx
 *
 * Root React Router configuration for the band site.
 *
 * Routes:
 *   /          — public band site (App)
 *   /admin/*   — standalone admin interface (protected by AdminRoute)
 *   *          — fallback redirect to /
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import CyberSpinner from '@/components/CyberSpinner'

const App = lazy(() => import('@/App'))
const AdminRoute = lazy(() => import('@/components/AdminRoute'))

export default function AppRouter() {
  return (
    <Suspense fallback={<CyberSpinner />}>
      <Routes>
        {/* Public band site */}
        <Route path="/" element={<App />} />

        {/* Standalone admin panel — protected by AdminRoute auth guard */}
        <Route path="/admin/*" element={<AdminRoute />} />

        {/* Fallback — redirect unknown paths to the band site */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
