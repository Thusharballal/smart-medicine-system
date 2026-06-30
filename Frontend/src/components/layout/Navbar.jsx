import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  RiMenu3Line, RiCloseLine, RiBellLine,
  RiSearchLine, RiSunLine, RiMoonLine,
} from 'react-icons/ri'
import ProfileDropdown from '../common/ProfileDropdown'
import SearchBar from '../common/SearchBar'
import { PMBJPWordmark } from '../brand/PMBJPLogo'

function NotificationBell({ count, onClick }) {
  const display = count > 99 ? '99+' : count
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Notifications${count > 0 ? `, ${display} unread` : ''}`}
      className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 hover:text-gray-700 dark:hover:text-gray-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                 transition-all duration-150"
    >
      <RiBellLine size={20} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center
                     rounded-full bg-danger-600 text-white text-[9px] font-bold px-0.5
                     ring-2 ring-white dark:ring-gray-900 leading-none animate-pulse-glow"
          aria-hidden="true"
        >
          {display}
        </span>
      )}
    </button>
  )
}

function Navbar({
  user = null,
  onLogout,
  unreadCount = 0,
  onNotificationClick,
  onMenuToggle,
  isSidebarOpen = false,
  theme = 'light',
  onThemeToggle,
  onSearch,
  showSearch = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchVisible, setSearchVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handler() { setScrolled(window.scrollY > 4) }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close mobile search on route change
  useEffect(() => { setSearchVisible(false) }, [location.pathname])

  return (
    <header
      className={[
        'sticky top-0 z-40 h-16',
        'transition-all duration-300',
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-nav border-b border-gray-200/60 dark:border-gray-800/60'
          : 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200/40 dark:border-gray-800/40',
      ].join(' ')}
    >
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                   focus:z-50 focus:px-3 focus:py-1.5 focus:bg-primary-600 focus:text-white
                   focus:rounded-lg focus:text-sm focus:shadow-lg"
      >
        Skip to main content
      </a>

      <div className="h-full max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center gap-2">

        {/* Hamburger – mobile */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar-nav"
          className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400
                     hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                     transition-all duration-150 shrink-0"
        >
          {isSidebarOpen
            ? <RiCloseLine  size={21} aria-hidden="true" />
            : <RiMenu3Line  size={21} aria-hidden="true" />}
        </button>

        {/* Logo */}
        <Link
          to="/"
          aria-label="Jan Aushadhi Smart Medicine – Home"
          className="flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
        >
          <PMBJPWordmark
            size={34}
            theme={theme === 'dark' ? 'color' : 'color'}
            showSubtitle={false}
          />
        </Link>

        {/* Desktop search */}
        {(showSearch || searchVisible) && (
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar onSearch={onSearch} size="md" placeholder="Search medicines…" className="w-full" />
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Search toggle */}
          {!showSearch && (
            <button
              type="button"
              onClick={() => setSearchVisible(v => !v)}
              aria-label={searchVisible ? 'Close search' : 'Open search'}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                         transition-all duration-150"
            >
              {searchVisible
                ? <RiCloseLine  size={20} aria-hidden="true" />
                : <RiSearchLine size={20} aria-hidden="true" />}
            </button>
          )}

          {/* Theme toggle */}
          {onThemeToggle && (
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                         transition-all duration-150"
            >
              {theme === 'dark'
                ? <RiSunLine  size={20} aria-hidden="true" />
                : <RiMoonLine size={20} aria-hidden="true" />}
            </button>
          )}

          {/* Notification bell */}
          {user && <NotificationBell count={unreadCount} onClick={onNotificationClick} />}

          {/* Profile / Login */}
          {user ? (
            <ProfileDropdown user={user} onLogout={onLogout} />
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 dark:text-gray-300
                           hover:text-primary-700 dark:hover:text-primary-400
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg px-1
                           transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-white text-sm font-semibold
                           bg-gradient-to-r from-primary-700 to-primary-900
                           hover:from-primary-600 hover:to-primary-800
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                           shadow-sm hover:shadow-glow-primary
                           transition-all duration-150"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search expansion */}
      {searchVisible && !showSearch && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl
                        border-b border-gray-200/60 dark:border-gray-800/60
                        px-4 py-3 md:hidden animate-slide-in-down shadow-lg">
          <SearchBar onSearch={onSearch} size="md" autoFocus placeholder="Search medicines…" className="w-full" />
        </div>
      )}
    </header>
  )
}

export default Navbar
