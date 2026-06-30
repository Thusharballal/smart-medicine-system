import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loader from '../components/common/Loader'

/**
 * RouteGuard – protects routes that require authentication.
 *
 * Spec Req 5.8:
 *   Redirects unauthenticated visitors to /login,
 *   preserving the originally requested path as a `redirect` query parameter.
 *
 * Props:
 *   children – the protected route element
 */
function RouteGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" label="Checking authentication…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  return children
}

export default RouteGuard
