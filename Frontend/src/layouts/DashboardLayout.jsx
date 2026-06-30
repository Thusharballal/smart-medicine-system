import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Sidebar from '../components/layout/Sidebar'
import Breadcrumb from '../components/common/Breadcrumb'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNotifications } from '../contexts/NotificationContext'
import ErrorBoundary from '../components/common/ErrorBoundary'

/**
 * DashboardLayout – wraps all three role dashboards.
 *
 * Structure (desktop >= 1024 px):
 *   <Navbar>
 *   <div class="flex">
 *     <Sidebar (persistent)>
 *     <main id="main-content">
 *       <Breadcrumb>
 *       <Outlet />
 *
 * Structure (< 1024 px):
 *   <Navbar (with hamburger)>
 *   <Sidebar (collapsible overlay)>
 *   <main id="main-content">
 *
 * Req 10.4 – persistent sidebar on dashboard pages.
 * Req 10.5 – collapsible overlay on < 1024 px.
 *
 * Props:
 *   routeLabels – { path: label } map for Breadcrumb
 */
function DashboardLayout({ routeLabels }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogout={logout}
        unreadCount={unreadCount}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          role={user?.role ?? 'user'}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto scrollbar-thin"
          tabIndex={-1}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
            <Breadcrumb routeLabels={routeLabels} className="mb-4" />

            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
