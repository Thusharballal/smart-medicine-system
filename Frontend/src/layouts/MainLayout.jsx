import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Breadcrumb from '../components/common/Breadcrumb'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNotifications } from '../contexts/NotificationContext'
import ErrorBoundary from '../components/common/ErrorBoundary'

/**
 * MainLayout – wraps all public-facing pages.
 *
 * Structure:
 *   <Navbar>
 *     <main id="main-content">
 *       <Breadcrumb>
 *       <Outlet />  ← page rendered here
 *     </main>
 *   <Footer>
 *
 * Req 10.1 – top nav on all pages.
 * Req 10.6 – breadcrumb trail on all pages.
 * Req 10.7 – footer on public pages.
 */
function MainLayout({ routeLabels }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950"
      lang="en"
    >
      <Navbar
        user={user}
        onLogout={logout}
        unreadCount={unreadCount}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setIsMobileMenuOpen((o) => !o)}
        isSidebarOpen={isMobileMenuOpen}
      />

      <main
        id="main-content"
        className="flex-1 w-full"
        tabIndex={-1}
      >
        {/* Breadcrumb is shown on inner pages; on the home page it renders nothing */}
        <Breadcrumb routeLabels={routeLabels} className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-4" />

        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
