import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar, TopBar } from '../components/navigation'
import { USER_NAV } from '../constants/navConfig'
import { useAuth } from '../contexts/AuthContext'
import DemoBanner from '../components/common/DemoBanner'
import notificationService from '../services/notificationService'
function UserLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const {
    currentUser,
    logout,
    isDemo,
  } = useAuth()
  // ==========================================================
  // Load unread notification count
  // ==========================================================
  useEffect(() => {
    let mounted = true
    async function loadUnreadCount() {
      // Don't call the backend before authentication is ready
      if (!currentUser) {
        if (mounted) {
          setNotifCount(0)
        }
        return
      }
      try {
        const response =
          await notificationService.getUnreadCount()
        if (mounted) {
          setNotifCount(
            response.data?.unread_count ?? 0
          )
        }
      } catch (error) {
        console.error(
          'Failed to load notification count:',
          error
        )
        if (mounted) {
          setNotifCount(0)
        }
      }
    }
    loadUnreadCount()
    return () => {
      mounted = false
    }
  }, [currentUser])
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        navItems={USER_NAV}
        collapsed={collapsed}
        onCollapse={() =>
          setCollapsed((c) => !c)
        }
        mobileOpen={mobileOpen}
        onMobileClose={() =>
          setMobileOpen(false)
        }
        user={currentUser}
        onLogout={logout}
      />
      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          onMenuOpen={() =>
            setMobileOpen(true)
          }
          user={currentUser}
          onLogout={logout}
          showSearch
          notifCount={notifCount}
        />
        {/* Demo mode banner */}
        {isDemo && <DemoBanner />}
        <main
          id="main-content"
          className="
            flex-1
            overflow-y-auto
            p-4
            sm:p-6
            page-enter
          "
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
export default UserLayout