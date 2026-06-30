import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RiShieldLine, RiArrowLeftLine, RiHomeLine } from 'react-icons/ri'

/**
 * UnauthorizedPage – shown when a user tries to access
 * a route their role is not permitted to view.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-danger-50 dark:bg-danger-950 mb-6" aria-hidden="true">
          <RiShieldLine size={40} className="text-danger-500 dark:text-danger-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You don't have permission to view this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <RiArrowLeftLine size={16} aria-hidden="true" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-medium hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <RiHomeLine size={16} aria-hidden="true" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
