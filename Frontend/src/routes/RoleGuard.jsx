import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * RoleGuard – redirects authenticated users who access a dashboard
 * route outside their assigned role (Req 5.9).
 *
 * Props:
 *   allowedRoles – string | string[]  roles permitted to view this route
 *   children
 */

const dashboardByRole = {
  user:            '/dashboard/user',
  pharmacy_owner:  '/dashboard/owner',
  admin:           '/dashboard/admin',
}

function RoleGuard({ allowedRoles, children }) {
  const { role } = useAuth()

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!allowed.includes(role)) {
    // If user has a known role, redirect to their own dashboard.
    // If role is completely unknown (e.g. trying to access admin as user), show unauthorized.
    const ownDashboard = dashboardByRole[role]
    return <Navigate to={ownDashboard ?? '/unauthorized'} replace />
  }

  return children
}

export default RoleGuard
