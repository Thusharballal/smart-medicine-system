/**
 * Protected Route
 *
 * Wraps any route that requires the user to be authenticated.
 * If the user is not logged in they are redirected to /login,
 * and the original destination is preserved in location.state
 * so the app can redirect back after a successful login.
 *
 * Optionally accepts an `allowedRoles` prop — if provided, the
 * component also checks whether the current user's role is
 * included in the list, and redirects to /unauthorized otherwise.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../constants/routes'
import { Spinner } from '../components/feedback'

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, currentUser, isLoading } = useAuth()
  const location = useLocation()
  // ══════════════════════════════════════════════════════════════════════════
  // TRACE LOGGING - DO NOT REMOVE
  // ══════════════════════════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════════════════════")
  console.log("🔒 ProtectedRoute EXECUTION")
  console.log("═══════════════════════════════════════════════════════════════")
  console.log("📍 Current URL:", location.pathname)
  console.log("📍 Full Location:", location)
  console.log("─────────────────────────────────────────────────────────────")
  console.log("👤 isAuthenticated:", isAuthenticated)
  console.log("⏳ isLoading:", isLoading)
  console.log("👤 currentUser:", currentUser)
  console.log("👤 currentUser?.role:", currentUser?.role)
  console.log("👤 typeof currentUser?.role:", typeof currentUser?.role)
  console.log("─────────────────────────────────────────────────────────────")
  console.log("🔐 allowedRoles:", allowedRoles)
  console.log("🔐 typeof allowedRoles:", typeof allowedRoles)
  console.log("🔐 Array.isArray(allowedRoles):", Array.isArray(allowedRoles))
  console.log("─────────────────────────────────────────────────────────────")
  
  if (allowedRoles && currentUser?.role) {
    const roleMatch = allowedRoles.includes(currentUser.role)
    console.log("✅ Role Match Test:", roleMatch)
    console.log("   - currentUser.role:", JSON.stringify(currentUser.role))
    console.log("   - allowedRoles:", JSON.stringify(allowedRoles))
    console.log("   - allowedRoles[0]:", JSON.stringify(allowedRoles[0]))
    console.log("   - Comparison:", currentUser.role === allowedRoles[0])
    console.log("   - includes() result:", allowedRoles.includes(currentUser.role))
  }
  console.log("═══════════════════════════════════════════════════════════════")
  // Show minimal loading indicator during auth state rehydration
  // Prevents redirect flash on page refresh
  if (isLoading) {
    console.log("🔄 REDIRECT REASON: isLoading = true")
    console.log("🔄 ACTION: Showing loading spinner")
    console.log("═══════════════════════════════════════════════════════════════")
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner size="md" color="primary" label="Checking authentication…" />
      </div>
    )
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    console.log("🚫 REDIRECT REASON: !isAuthenticated")
    console.log("🚫 REDIRECT TO: /login")
    console.log("🚫 FILE: ProtectedRoute.jsx")
    console.log("🚫 LINE: 47")
    console.log("═══════════════════════════════════════════════════════════════")
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Role check — redirect to /unauthorized if role not allowed
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    console.log("🚫 REDIRECT REASON: Role check failed")
    console.log("🚫 REDIRECT TO: /unauthorized")
    console.log("🚫 FILE: ProtectedRoute.jsx")
    console.log("🚫 LINE: 52")
    console.log("🚫 CONDITION: allowedRoles && !allowedRoles.includes(currentUser?.role)")
    console.log("🚫 DETAILS:")
    console.log("   - allowedRoles:", allowedRoles)
    console.log("   - currentUser?.role:", currentUser?.role)
    console.log("   - allowedRoles.includes(currentUser?.role):", allowedRoles.includes(currentUser?.role))
    console.log("═══════════════════════════════════════════════════════════════")
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />
  }

  console.log("✅ AUTHORIZATION SUCCESS")
  console.log("✅ Rendering <Outlet /> - child routes will render")
  console.log("═══════════════════════════════════════════════════════════════")
  return <Outlet />
}

export default ProtectedRoute
