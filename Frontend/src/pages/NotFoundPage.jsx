import React from 'react'
import { Link } from 'react-router-dom'
import { RiSearchLine, RiHomeLine } from 'react-icons/ri'

/**
 * NotFoundPage – 404 error page shown for all unmatched routes.
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-8xl font-black text-primary-100 dark:text-primary-950 select-none mb-2" aria-hidden="true">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Page Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/medicines"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <RiSearchLine size={16} aria-hidden="true" />
            Search Medicines
          </Link>
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
