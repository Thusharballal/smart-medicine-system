import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loader from '../components/common/Loader'
import ErrorBoundary from '../components/common/ErrorBoundary'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import RouteGuard from './RouteGuard'
import RoleGuard from './RoleGuard'

// ── Lazy-loaded pages ─────────────────────────────────────────────────
const HomePage               = lazy(() => import('../pages/public/HomePage'))
const MedicinesPage          = lazy(() => import('../pages/public/MedicinesPage'))
const MedicineDetailPage     = lazy(() => import('../pages/public/MedicineDetailPage'))
const LoginPage              = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage           = lazy(() => import('../pages/auth/RegisterPage'))
const VerifyOtpPage          = lazy(() => import('../pages/auth/VerifyOtpPage'))
const ForgotPasswordPage     = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage      = lazy(() => import('../pages/auth/ResetPasswordPage'))
const UserDashboard          = lazy(() => import('../pages/dashboard/user/UserDashboard'))
const WatchlistPage          = lazy(() => import('../pages/dashboard/user/WatchlistPage'))
const NotificationsPage      = lazy(() => import('../pages/dashboard/user/NotificationsPage'))
const ProfilePage            = lazy(() => import('../pages/dashboard/user/ProfilePage'))
const AccountSettingsPage    = lazy(() => import('../pages/dashboard/user/AccountSettingsPage'))
const NotificationCenterPage = lazy(() => import('../pages/dashboard/user/NotificationCenterPage'))
const ActivityHistoryPage    = lazy(() => import('../pages/dashboard/user/ActivityHistoryPage'))
const NotFoundPage           = lazy(() => import('../pages/NotFoundPage'))
const UnauthorizedPage       = lazy(() => import('../pages/UnauthorizedPage'))

/**
 * AppRoutes – full route tree with lazy-loading infrastructure.
 *
 * Pages are registered with placeholder components until Phase 5 builds them.
 * Real pages are imported via lazy() once the files exist.
 *
 * Req 15.1 – route-based code splitting via React.lazy + Suspense.
 */

// ── Breadcrumb label map ──────────────────────────────────────────────
const ROUTE_LABELS = {
  '/medicines':                        'Medicines',
  '/pharmacy-locator':                 'Find Pharmacy',
  '/about':                            'About',
  '/contact':                          'Contact',
  '/privacy':                          'Privacy Policy',
  '/terms':                            'Terms of Service',
  '/faqs':                             'FAQs',
  '/dashboard/user':                   'My Dashboard',
  '/dashboard/user/watchlist':         'My Watchlist',
  '/dashboard/user/notifications':     'Notifications',
  '/dashboard/user/notification-center': 'Notification Center',
  '/dashboard/user/profile':           'Profile',
  '/dashboard/user/settings':          'Account Settings',
  '/dashboard/user/activity':          'Activity History',
  '/dashboard/owner':                  'Pharmacy Dashboard',
  '/dashboard/admin':                  'Admin Dashboard',
}

// ── Suspense fallback ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader size="lg" label="Loading page…" />
    </div>
  )
}

// ── Placeholder – pages not yet implemented ───────────────────────────
function ComingSoon({ title = 'Coming Soon' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 py-16">
      <div className="h-16 w-16 rounded-full bg-primary-50 dark:bg-primary-950 flex items-center justify-center text-3xl" aria-hidden="true">
        🏗️
      </div>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        This module will be connected to FastAPI in the backend integration phase.
      </p>
    </div>
  )
}

function page(title) { return <ComingSoon title={title} /> }

// ── Route tree ────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ════ Public / Marketing routes ════ */}
          <Route element={<MainLayout routeLabels={ROUTE_LABELS} />}>
            <Route index                    element={<HomePage />} />
            <Route path="medicines"         element={<MedicinesPage />} />
            <Route path="medicines/:id"     element={<MedicineDetailPage />} />
            <Route path="pharmacy-locator"  element={page('Pharmacy Locator')} />
            <Route path="about"             element={page('About')} />
            <Route path="contact"           element={page('Contact')} />
            <Route path="privacy"           element={page('Privacy Policy')} />
            <Route path="terms"             element={page('Terms of Service')} />
            <Route path="faqs"              element={page('FAQs')} />
          </Route>

          {/* ════ Auth routes ════ */}
          <Route element={<AuthLayout />}>
            <Route path="login"           element={<LoginPage />} />
            <Route path="register"        element={<RegisterPage />} />
            <Route path="verify-otp"      element={<VerifyOtpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password"  element={<ResetPasswordPage />} />
          </Route>

          {/* ════ User Dashboard ════ */}
          <Route
            path="dashboard/user"
            element={
              <RouteGuard>
                <RoleGuard allowedRoles={['user']}>
                  <DashboardLayout routeLabels={ROUTE_LABELS} />
                </RoleGuard>
              </RouteGuard>
            }
          >
            <Route index               element={<UserDashboard />} />
            <Route path="watchlist"          element={<WatchlistPage />} />
            <Route path="notifications"      element={<NotificationsPage />} />
            <Route path="notification-center" element={<NotificationCenterPage />} />
            <Route path="profile"            element={<ProfilePage />} />
            <Route path="settings"           element={<AccountSettingsPage />} />
            <Route path="activity"           element={<ActivityHistoryPage />} />
          </Route>

          {/* ════ Pharmacy Owner Dashboard ════ */}
          <Route
            path="dashboard/owner"
            element={
              <RouteGuard>
                <RoleGuard allowedRoles={['pharmacy_owner']}>
                  <DashboardLayout routeLabels={ROUTE_LABELS} />
                </RoleGuard>
              </RouteGuard>
            }
          >
            <Route index             element={page('Pharmacy Dashboard')} />
            <Route path="pharmacy"   element={page('My Pharmacy')} />
            <Route path="inventory"  element={page('Inventory')} />
            <Route path="analytics"  element={page('Analytics')} />
            <Route path="profile"    element={page('Profile Settings')} />
          </Route>

          {/* ════ Admin Dashboard ════ */}
          <Route
            path="dashboard/admin"
            element={
              <RouteGuard>
                <RoleGuard allowedRoles={['admin']}>
                  <DashboardLayout routeLabels={ROUTE_LABELS} />
                </RoleGuard>
              </RouteGuard>
            }
          >
            <Route index                  element={page('Admin Dashboard')} />
            <Route path="users"           element={page('Users')} />
            <Route path="pharmacies"      element={page('Pharmacies')} />
            <Route path="medicines"       element={page('Medicine Database')} />
            <Route path="verifications"   element={page('Verifications')} />
            <Route path="health"          element={page('System Health')} />
            <Route path="settings"        element={page('Settings')} />
          </Route>

          {/* ════ Convenience redirects ════ */}
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="profile"   element={<Navigate to="/dashboard/user/profile" replace />} />
          <Route path="settings"  element={<Navigate to="/dashboard/user/settings" replace />} />

          {/* ════ 404 ════ */}
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          <Route path="*"            element={<NotFoundPage />} />

        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default AppRoutes
