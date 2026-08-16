import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import UserLayout from '../layouts/UserLayout'
import PharmacyLayout from '../layouts/PharmacyLayout'
import AdminLayout from '../layouts/AdminLayout'
import PublicRoute from './PublicRoute'
import ProtectedRoute from './ProtectedRoute'
import { USER_ROLES } from '../constants/app'
import { Spinner } from '../components/feedback'
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="md" color="primary" label="Loading page…" />
    </div>
  )
}

import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyOtpPage from '../pages/auth/VerifyOtpPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import AdminLoginPage from '../pages/auth/AdminLoginPage'
import AdminMedicineEdit from '../pages/admin/AdminMedicineEdit'
import AdminMedicineDetails from '../pages/admin/AdminMedicineDetails'
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import SessionExpiredPage from '../pages/errors/SessionExpiredPage'
const HomePage = lazy(() => import('../pages/home/HomePage'))
const UserDashboard = lazy(() => import('../pages/dashboard/UserDashboard'))
const MedicineSearchPage = lazy(() => import('../pages/search/MedicineSearchPage'))
const SearchResultsPage = lazy(() => import('../pages/results/SearchResultsPage'))
const MedicineDetailsPage = lazy(() => import('../pages/medicine/MedicineDetailsPage'))
const GenericRecommendationPage = lazy(() => import('../pages/generic/GenericRecommendationPage'))
const NearbyPharmaciesPage = lazy(() => import('../pages/pharmacies/NearbyPharmaciesPage'))
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'))
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
const PharmacyDashboard = lazy(() => import('../pages/pharmacy/PharmacyDashboard'))
const InventoryDashboard = lazy(() => import('../pages/pharmacy/InventoryDashboard'))
const InventoryPage = lazy(() => import('../pages/pharmacy/InventoryPage'))
const MedicineFormPage = lazy(() => import('../pages/pharmacy/MedicineFormPage'))
const ImportStockPage = lazy(() => import('../pages/pharmacy/ImportStockPage'))
const BillingPage = lazy(() => import('../pages/pharmacy/BillingPage'))
const BillHistoryPage = lazy(() => import('../pages/pharmacy/BillHistoryPage'))
const PharmacyReportsPage = lazy(() => import('../pages/pharmacy/PharmacyReportsPage'))
const AdvancedInventoryPage = lazy(() => import('../pages/pharmacy/AdvancedInventoryPage'))
const SupplierManagementPage = lazy(() => import('../pages/pharmacy/SupplierManagementPage'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
const AdminPharmacies = lazy(() => import('../pages/admin/AdminPharmacies'))
const AdminMedicines = lazy(() => import('../pages/admin/AdminMedicines'))
const AdminGenericMapping = lazy(() => import('../pages/admin/AdminGenericMapping'))
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'))
const AdminReports = lazy(() => import('../pages/admin/AdminReports'))
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'))
const AdminActivity = lazy(() => import('../pages/admin/AdminActivity'))
const AdminRoles = lazy(() => import('../pages/admin/AdminRoles'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
function AppRouter() {
  const location = useLocation()
  useEffect(() => {
    console.log('🌐 NAVIGATION EVENT')
    console.log('   - New pathname:', location.pathname)
    console.log('   - Full location:', location)
  }, [location])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify-otp" element={<VerifyOtpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>
    <Route
      element={
        <ProtectedRoute
          allowedRoles={[USER_ROLES.USER]}
        />
      }
    >
      <Route element={<UserLayout />}>
        {/* User Dashboard */}
        <Route
          path="dashboard"
          element={<UserDashboard />}
        />
        {/* Medicine Search */}
        <Route
          path="search"
          element={<MedicineSearchPage />}
        />
        {/* Search Results */}
        <Route
          path="search/results"
          element={<SearchResultsPage />}
        />
        {/* Medicine Details */}
        <Route
          path="medicine/:id"
          element={<MedicineDetailsPage />}
        />
        {/* Generic / Jan Aushadhi Recommendation */}
        <Route
          path="medicine/:id/generic"
          element={<GenericRecommendationPage />}
        />
        {/* Nearby Pharmacies */}
        <Route
          path="pharmacies/nearby"
          element={<NearbyPharmaciesPage />}
        />
        {/* Notifications */}
        <Route
          path="notifications"
          element={<NotificationsPage />}
        />
        {/* Profile */}
        <Route
          path="profile"
          element={<ProfilePage />}
        />
      </Route>
    </Route>
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  USER_ROLES.USER,
                  USER_ROLES.ADMIN,
                ]}
              />
            }
          >
            <Route element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route
                path="notifications"
                element={<NotificationsPage />}
              />
              <Route
                path="profile"
                element={<ProfilePage />}
              />
            </Route>
          </Route>
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.PHARMACY_OWNER]}
            />
          }
        >
          <Route element={<PharmacyLayout />}>
            <Route
              path="pharmacy/dashboard"
              element={<PharmacyDashboard />}
            />
            <Route
              path="pharmacy/inventory-dashboard"
              element={<InventoryDashboard />}
            />
            <Route
              path="pharmacy/inventory"
              element={<InventoryPage />}
            />
            <Route
              path="pharmacy/inventory/advanced"
              element={<AdvancedInventoryPage />}
            />
            <Route
              path="pharmacy/suppliers"
              element={<SupplierManagementPage />}
            />
            <Route
              path="pharmacy/inventory/add"
              element={<MedicineFormPage />}
            />
            <Route
              path="pharmacy/inventory/edit/:id"
              element={<MedicineFormPage />}
            />
            <Route
              path="pharmacy/import-stock"
              element={<ImportStockPage />}
            />
            <Route
              path="pharmacy/billing"
              element={<BillingPage />}
            />
            <Route
              path="pharmacy/bill-history"
              element={<BillHistoryPage />}
            />
            <Route
              path="pharmacy/reports"
              element={<PharmacyReportsPage />}
            />
            <Route
              path="pharmacy/prescriptions"
              element={<InventoryPage />}
            />
            <Route
              path="pharmacy/profile"
              element={<ProfilePage />}
            />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMIN]}
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route
              path="admin/dashboard"
              element={<AdminDashboard />}
            />
            <Route
              path="admin/users"
              element={<AdminUsers />}
            />
            <Route
              path="admin/pharmacies"
              element={<AdminPharmacies />}
            />
            <Route
              path="admin/medicines"
              element={<AdminMedicines />}
            />
            <Route
              path="admin/medicines/:id"
              element={<AdminMedicineDetails />}
            />
            <Route
              path="admin/medicines/:id/edit"
              element={<AdminMedicineEdit />}
            />
            <Route
              path="admin/generic-mapping"
              element={<AdminGenericMapping />}
            />
            <Route
              path="admin/analytics"
              element={<AdminAnalytics />}
            />
            <Route
              path="admin/reports"
              element={<AdminReports />}
            />
            <Route
              path="admin/notifications"
              element={<AdminNotifications />}
            />
            <Route
              path="admin/activity"
              element={<AdminActivity />}
            />
            <Route
              path="admin/roles"
              element={<AdminRoles />}
            />
            <Route
              path="admin/settings"
              element={<AdminSettings />}
            />
          </Route>
        </Route>
        <Route
          path="unauthorized"
          element={<UnauthorizedPage />}
        />
        <Route
          path="session-expired"
          element={<SessionExpiredPage />}
        />
        <Route
          path="admin/login"
          element={<AdminLoginPage />}
        />
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </Suspense>
  )
}
export default AppRouter