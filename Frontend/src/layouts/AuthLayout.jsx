import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { RiSunLine, RiMoonLine, RiExternalLinkLine } from 'react-icons/ri'
import ErrorBoundary from '../components/common/ErrorBoundary'
import { PMBJPWordmark, PMBJPBadge, PMBJPTagline } from '../components/brand/PMBJPLogo'

/**
 * AuthLayout – Jan Aushadhi branded auth pages.
 * Features the official PMBJP scheme name, green colour scheme,
 * and government attribution — as appropriate for a Final Year Project.
 */
function AuthLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(160deg, #030712 0%, #0d1f12 50%, #030712 100%)'
          : 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 30%, #eff6ff 70%, #dbeafe 100%)',
      }}
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }}
        />
      </div>

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all"
      >
        {theme === 'dark' ? <RiSunLine size={20} aria-hidden="true" /> : <RiMoonLine size={20} aria-hidden="true" />}
      </button>

      {/* ── PMBJP Brand Header ─────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center mb-8 gap-2">
        <Link
          to="/"
          aria-label="Jan Aushadhi Smart Medicine – Home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-2xl"
        >
          <PMBJPWordmark size={44} theme={theme === 'dark' ? 'color' : 'color'} showSubtitle />
        </Link>
        <PMBJPBadge theme={theme === 'dark' ? 'white' : 'color'} />
        <PMBJPTagline theme={theme === 'dark' ? 'white' : 'color'} />
      </div>

      {/* ── Auth Card ───────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-md rounded-3xl p-8"
        style={{
          background: theme === 'dark' ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: theme === 'dark'
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.08)',
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </div>

      {/* ── Official attribution footer ──────────────────────────────── */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-1.5">
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          Under the{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-400">
            Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)
          </span>
        </p>
        <a
          href="https://janaushadhi.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit official Jan Aushadhi website (opens in new tab)"
          className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-500 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 rounded"
        >
          janaushadhi.gov.in
          <RiExternalLinkLine size={11} aria-hidden="true" />
        </a>
        <p className="text-[10px] text-gray-400 dark:text-gray-600">
          Department of Pharmaceuticals · Ministry of Chemicals &amp; Fertilizers · GoI
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
