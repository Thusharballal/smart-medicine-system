import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import {
  RiDashboardLine, RiSearchLine, RiMapPinLine,
  RiBellLine, RiUser3Line, RiMedicineBottleLine,
  RiStoreLine, RiTeamLine, RiShieldCheckLine,
  RiBarChartLine, RiSettings4Line, RiCloseLine,
} from 'react-icons/ri'
import { PMBJPIcon } from '../brand/PMBJPLogo'

const userNav = [
  { label: 'Overview',         to: '/dashboard/user',                    icon: RiDashboardLine,    end: true   },
  { label: 'My Watchlist',     to: '/dashboard/user/watchlist',          icon: RiMedicineBottleLine             },
  { label: 'Search Medicines', to: '/medicines',                         icon: RiSearchLine                    },
  { label: 'Find Pharmacy',    to: '/pharmacy-locator',                  icon: RiMapPinLine                    },
  { label: 'Notifications',    to: '/dashboard/user/notifications',      icon: RiBellLine                      },
  { label: 'Profile',          to: '/dashboard/user/profile',            icon: RiUser3Line                     },
  { label: 'Settings',         to: '/dashboard/user/settings',           icon: RiSettings4Line                 },
  { label: 'Activity',         to: '/dashboard/user/activity',           icon: RiBarChartLine                  },
]

const ownerNav = [
  { label: 'Overview',         to: '/dashboard/owner',                   icon: RiDashboardLine,    end: true   },
  { label: 'My Pharmacy',      to: '/dashboard/owner/pharmacy',          icon: RiStoreLine                     },
  { label: 'Inventory',        to: '/dashboard/owner/inventory',         icon: RiMedicineBottleLine             },
  { label: 'Analytics',        to: '/dashboard/owner/analytics',         icon: RiBarChartLine                  },
  { label: 'Profile',          to: '/dashboard/owner/profile',           icon: RiUser3Line                     },
]

const adminNav = [
  { label: 'Overview',         to: '/dashboard/admin',                   icon: RiDashboardLine,    end: true   },
  { label: 'Users',            to: '/dashboard/admin/users',             icon: RiTeamLine                      },
  { label: 'Pharmacies',       to: '/dashboard/admin/pharmacies',        icon: RiStoreLine                     },
  { label: 'Medicines',        to: '/dashboard/admin/medicines',         icon: RiMedicineBottleLine             },
  { label: 'Verifications',    to: '/dashboard/admin/verifications',     icon: RiShieldCheckLine               },
  { label: 'System Health',    to: '/dashboard/admin/health',            icon: RiBarChartLine                  },
  { label: 'Settings',         to: '/dashboard/admin/settings',          icon: RiSettings4Line                 },
]

const navByRole = { user: userNav, pharmacy_owner: ownerNav, admin: adminNav }
const roleTitles = { user: 'My Dashboard', pharmacy_owner: 'Pharmacy', admin: 'Admin Panel' }

function NavItem({ item, onClick }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      aria-label={item.label}
      className={({ isActive }) => [
        'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isActive
          ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-400 font-semibold shadow-sm ring-1 ring-primary-200/60 dark:ring-primary-800/40'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          <span className={[
            'shrink-0 p-1.5 rounded-lg transition-colors duration-150',
            isActive
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
              : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
          ].join(' ')} aria-hidden="true">
            <Icon size={15} />
          </span>
          <span className="flex-1 truncate">{item.label}</span>
          {isActive && (
            <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-primary-400" aria-hidden="true" />
          )}
        </>
      )}
    </NavLink>
  )
}

function Sidebar({ role = 'user', isOpen = false, onClose, className = '' }) {
  const navItems = navByRole[role] ?? userNav
  const title    = roleTitles[role] ?? 'Dashboard'
  const overlayRef = useRef(null)

  useEffect(() => {
    function h(e) { if (e.key === 'Escape' && isOpen) onClose?.() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const sidebarContent = (
    <nav
      id="sidebar-nav"
      aria-label="Dashboard navigation"
      className={[
        'h-full flex flex-col',
        'bg-white dark:bg-gray-900',
        'border-r border-gray-200/60 dark:border-gray-800/60',
        'w-64 shrink-0',
        className,
      ].join(' ')}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-4 h-16 shrink-0 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <PMBJPIcon size={26} theme="color" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all"
        >
          <RiCloseLine size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 flex flex-col gap-0.5 scrollbar-thin">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            onClick={() => { if (window.innerWidth < 1024) onClose?.() }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 p-3 flex items-center gap-2.5">
          <PMBJPIcon size={28} theme="color" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-green-800 dark:text-green-400 truncate">PMBJP Initiative</p>
            <p className="text-[10px] text-green-600/70 dark:text-green-600 truncate">Govt. of India</p>
          </div>
        </div>
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop persistent */}
      <div className="hidden lg:flex h-full">{sidebarContent}</div>

      {/* Mobile overlay */}
      <div
        className={['lg:hidden fixed inset-0 z-50 flex', isOpen ? '' : 'pointer-events-none'].join(' ')}
        aria-hidden={!isOpen}
      >
        <div
          className={['absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity duration-300', isOpen ? 'opacity-100' : 'opacity-0'].join(' ')}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          ref={overlayRef}
          className={['relative transition-transform duration-300 ease-spring', isOpen ? 'translate-x-0' : '-translate-x-full'].join(' ')}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  )
}

export default Sidebar
