import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiUser3Line,
  RiDashboardLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
  RiArrowDownSLine,
  RiShieldUserLine,
} from 'react-icons/ri'

/**
 * ProfileDropdown – authenticated user account menu.
 *
 * Props:
 *   user – {
 *     displayName: string,
 *     email: string,
 *     role: 'user' | 'pharmacy_owner' | 'admin',
 *     avatarUrl?: string
 *   }
 *   onLogout    – () => void
 *   className
 */

const roleLabels = {
  user: 'Patient',
  pharmacy_owner: 'Pharmacy Owner',
  admin: 'Administrator',
}

const dashboardPaths = {
  user: '/dashboard/user',
  pharmacy_owner: '/dashboard/owner',
  admin: '/dashboard/admin',
}

function Avatar({ user, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'U'

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={`${user.displayName} avatar`}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-gray-700`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-primary-900 dark:bg-primary-700 text-white font-semibold flex items-center justify-center ring-2 ring-white dark:ring-gray-700`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function ProfileDropdown({ user, onLogout, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)
  const navigate = useNavigate()

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!menuRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  function handleLogout() {
    setIsOpen(false)
    onLogout?.()
  }

  const dashboardPath = dashboardPaths[user?.role] ?? '/dashboard/user'

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open account menu"
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1
                   hover:bg-gray-100 dark:hover:bg-gray-700
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600
                   transition-colors"
      >
        <Avatar user={user} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
          {user?.displayName ?? 'Account'}
        </span>
        <RiArrowDownSLine
          size={16}
          className={`text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account menu"
          className={[
            'absolute right-0 top-full mt-2 z-50',
            'w-64 rounded-xl bg-white dark:bg-gray-800',
            'shadow-lg ring-1 ring-gray-200 dark:ring-gray-700',
            'animate-fade-in overflow-hidden',
          ].join(' ')}
        >
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-700">
            <Avatar user={user} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {user?.role && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-primary-900 dark:text-primary-400">
                  <RiShieldUserLine size={11} aria-hidden="true" />
                  {roleLabels[user.role] ?? user.role}
                </span>
              )}
            </div>
          </div>

          {/* Menu items */}
          <nav aria-label="Account navigation" className="py-1.5">
            <Link
              to={dashboardPath}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                         focus-visible:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-700"
            >
              <RiDashboardLine size={16} className="text-gray-400" aria-hidden="true" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                         focus-visible:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-700"
            >
              <RiSettings4Line size={16} className="text-gray-400" aria-hidden="true" />
              Profile Settings
            </Link>
          </nav>

          {/* Divider + logout */}
          <div className="border-t border-gray-100 dark:border-gray-700 py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 dark:text-danger-400
                         hover:bg-danger-50 dark:hover:bg-danger-950 transition-colors
                         focus-visible:outline-none focus-visible:bg-danger-50 dark:focus-visible:bg-danger-950"
            >
              <RiLogoutBoxRLine size={16} aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
