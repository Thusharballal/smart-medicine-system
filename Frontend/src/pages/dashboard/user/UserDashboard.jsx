import React, { useState, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiSearchLine, RiUpload2Line, RiMapPinLine,
  RiBellLine, RiHeartLine, RiMedicineBottleLine,
  RiMoneyDollarCircleLine, RiTimeLine, RiLightbulbLine,
  RiBarChartLine,
} from 'react-icons/ri'
import { useAuth } from '../../../contexts/AuthContext'
import { useMedicine } from '../../../contexts/MedicineContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useToast } from '../../../components/common/Toast'
import DashboardCard from '../../../components/dashboard/DashboardCard'
import MedicineCard from '../../../components/medicine/MedicineCard'
import NotificationCard from '../../../components/notifications/NotificationCard'
import Button from '../../../components/common/Button'
import EmptyState from '../../../components/common/EmptyState'
import {
  MOCK_RECENT_SEARCHES, MOCK_MONTHLY_SAVINGS, HEALTH_TIPS,
} from '../../../mocks/medicines'

/* ── Savings bar chart (pure CSS / SVG, no extra library) ──────────── */
function SavingsChart({ data }) {
  const max = Math.max(...data.map((d) => d.saving), 1)
  return (
    <div className="w-full" aria-label="Monthly savings bar chart">
      <div className="flex items-end gap-2 h-32">
        {data.map((d, i) => {
          const pct = Math.round((d.saving / max) * 100)
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 leading-none">
                ₹{d.saving}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-primary-700 to-primary-500 dark:from-primary-600 dark:to-primary-400 transition-all duration-700"
                style={{ height: `${Math.max(pct, 4)}%` }}
                role="presentation"
                title={`${d.month}: ₹${d.saving} saved`}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">{d.month}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Quick action button ─────────────────────────────────────────────── */
function QuickAction({ icon: Icon, label, to, color = 'primary' }) {
  const navigate = useNavigate()
  const styles = {
    primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:hover:bg-primary-900',
    accent:  'bg-accent-50  text-accent-700  hover:bg-accent-100  dark:bg-accent-950  dark:text-accent-400  dark:hover:bg-accent-900',
    warning: 'bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-950 dark:text-warning-400 dark:hover:bg-warning-900',
  }
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${styles[color]}`}
      aria-label={label}
    >
      <Icon size={24} aria-hidden="true" />
      <span className="text-xs font-medium text-center leading-snug">{label}</span>
    </button>
  )
}

function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { watchlist, recentSearches, removeFromWatchlist, clearRecentSearches } = useMedicine()
  const { notifications, unreadCount, markRead } = useNotifications()
  const { toast } = useToast()

  const tip = useMemo(() => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)], [])

  const totalSaving = useMemo(() =>
    MOCK_MONTHLY_SAVINGS.reduce((s, d) => s + d.saving, 0), [])

  const displayName = user?.displayName ?? 'User'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function handleRemoveWatchlist(id, name) {
    removeFromWatchlist(id)
    toast(`Removed "${name}" from watchlist.`, { variant: 'info' })
  }

  const recentList = recentSearches.length > 0 ? recentSearches : MOCK_RECENT_SEARCHES

  return (
    <div className="space-y-6 pb-8">

      {/* ── Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary-900 to-blue-800 dark:from-primary-950 dark:to-blue-950 p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-white/70 text-sm">{greeting},</p>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
              <RiTimeLine size={12} aria-hidden="true" />
              Last login: Today at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        {/* Health tip */}
        <div className="flex items-start gap-2.5 bg-white/10 rounded-xl px-4 py-3 max-w-xs">
          <RiLightbulbLine size={18} className="text-yellow-300 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-white/80 leading-relaxed">{tip}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Medicines Searched"
          value={(recentList.length) + 12}
          icon={<RiSearchLine size={20} />}
          accent="primary"
          trend={{ value: '+3', direction: 'up', label: 'this week' }}
        />
        <DashboardCard
          title="Saved Medicines"
          value={watchlist.length}
          icon={<RiHeartLine size={20} />}
          accent="danger"
        />
        <DashboardCard
          title="Total Savings (₹)"
          value={`₹${totalSaving.toLocaleString()}`}
          icon={<RiMoneyDollarCircleLine size={20} />}
          accent="accent"
          trend={{ value: '+₹510', direction: 'up', label: 'this month' }}
        />
        <DashboardCard
          title="Nearby Pharmacies"
          value={9}
          icon={<RiMapPinLine size={20} />}
          accent="warning"
        />
      </div>

      {/* ── Quick Actions ── */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={RiSearchLine}  label="Search Medicine"        to="/medicines"          color="primary" />
          <QuickAction icon={RiUpload2Line} label="Upload Prescription"    to="/medicines"          color="primary" />
          <QuickAction icon={RiMapPinLine}  label="Find Nearby Pharmacy"   to="/pharmacy-locator"   color="accent"  />
          <QuickAction icon={RiBellLine}    label="View Notifications"     to="/dashboard/user/notifications" color="warning" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: Recent Searches + Notifications ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Searches */}
          <section aria-labelledby="recent-searches-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="recent-searches-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Searches
              </h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-danger-500 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {recentList.slice(0, 8).map((r) => (
                <Link
                  key={r.id}
                  to={`/medicines?q=${encodeURIComponent(r.query)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:border-primary-300 dark:hover:border-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <RiSearchLine size={11} aria-hidden="true" />
                  {r.query}
                </Link>
              ))}
            </div>
          </section>

          {/* Saved Medicines */}
          <section aria-labelledby="saved-medicines-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="saved-medicines-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saved Medicines
              </h2>
              <Link to="/dashboard/user/watchlist" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                View all →
              </Link>
            </div>
            {watchlist.length === 0 ? (
              <EmptyState
                icon={<RiHeartLine size={30} />}
                title="No saved medicines"
                description="Save medicines from the search results to track prices and find cheaper alternatives."
                action={{ label: 'Search Medicines', onClick: () => {} }}
                className="py-8 rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {watchlist.slice(0, 4).map((med) => (
                  <MedicineCard
                    key={med.id}
                    medicine={{ ...med, isInWatchlist: true }}
                    onWatchlistToggle={() => handleRemoveWatchlist(med.id, med.name)}
                    onFindAlternative={(m) => navigate(`/medicines/${m.id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right column: Savings Chart + Notifications ── */}
        <div className="space-y-6">

          {/* Monthly Savings Chart */}
          <section aria-labelledby="savings-chart-heading" className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="savings-chart-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <RiBarChartLine size={16} className="text-primary-600" aria-hidden="true" />
                Monthly Savings
              </h2>
              <span className="text-xs text-accent-600 dark:text-accent-400 font-semibold">₹{totalSaving} total</span>
            </div>
            <SavingsChart data={MOCK_MONTHLY_SAVINGS} />
          </section>

          {/* Notifications Preview */}
          <section aria-labelledby="notifications-heading">
            <div className="flex items-center justify-between mb-3">
              <h2 id="notifications-heading" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-danger-100 text-danger-700 dark:bg-danger-950 dark:text-danger-300">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <Link to="/dashboard/user/notifications" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                View all →
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
