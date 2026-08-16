import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'

import DashboardHeader from './sections/DashboardHeader'
import QuickStats from './sections/QuickStats'
import QuickActions from './sections/QuickActions'
import SavedMedicinesSection from './sections/SavedMedicinesSection'
import SearchHistorySection from './sections/SearchHistorySection'
import FavoritePharmaciesSection from './sections/FavoritePharmaciesSection'
import NotificationCenter from './sections/NotificationCenter'
import MedicineReminderSection from './sections/MedicineReminderSection'
import HealthcareTimeline from './sections/HealthcareTimeline'
import AccountSettingsPreview from './sections/AccountSettingsPreview'
import Divider from '../../components/ui/Divider'
import { ROUTES } from '../../constants/routes'

function UserDashboard() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // ============================================================
  // Medicine Search
  // ============================================================
  const handleSearch = (event) => {
    event.preventDefault()

    const query = searchQuery.trim()

    if (!query) {
      return
    }

    navigate(
      `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(query)}`
    )
  }

  return (
    <article
      aria-label="User Dashboard"
      className="w-full max-w-7xl mx-auto flex flex-col gap-5"
    >

      {/* ========================================================
          Dashboard Header
         ======================================================== */}
      <DashboardHeader />

      {/* ========================================================
          PRIMARY MEDICINE SEARCH

          This is the main search for the user.
          It is intentionally placed near the top of the dashboard
          for quick access.
         ======================================================== */}
      <section
        aria-labelledby="dashboard-search-heading"
        className="w-full"
      >
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">

          {/* Search heading */}
          <div className="mb-3">
            <h2
              id="dashboard-search-heading"
              className="text-base sm:text-lg font-semibold text-slate-900"
            >
              Search Medicines
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Search by medicine name, brand, generic medicine, or composition.
            </p>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >

            {/* Input */}
            <div className="relative flex-1">

              <HiOutlineMagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for a medicine..."
                aria-label="Search for a medicine"
                className="
                  w-full
                  h-11
                  pl-10
                  pr-4
                  rounded-xl
                  border
                  border-slate-300
                  bg-slate-50
                  text-sm
                  text-slate-900
                  placeholder:text-slate-400
                  outline-none
                  transition
                  focus:bg-white
                  focus:border-primary-500
                  focus:ring-2
                  focus:ring-primary-500/20
                "
              />

            </div>

            {/* Search button */}
            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                h-11
                px-5
                rounded-xl
                bg-primary-600
                text-white
                text-sm
                font-semibold
                shadow-sm
                transition
                hover:bg-primary-700
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary-500
                focus-visible:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <HiOutlineMagnifyingGlass
                size={18}
                aria-hidden="true"
              />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================
          Quick Statistics
         ======================================================== */}
      <section aria-label="Quick statistics">
        <QuickStats />
      </section>

      {/* ========================================================
          Quick Actions
         ======================================================== */}
      <section aria-label="Quick actions">
        <QuickActions />
      </section>

      <Divider className="my-0" />

      {/* ========================================================
          Main Dashboard Content
         ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">

        {/* ======================================================
            Left / Main Column
           ====================================================== */}
        <div className="min-w-0 flex flex-col gap-5">

          {/* Saved Medicines */}
          <section aria-label="Saved medicines">
            <SavedMedicinesSection />
          </section>

          {/* Recent Search History */}
          <section aria-label="Search history">
            <SearchHistorySection />
          </section>

          {/* Favorite Pharmacies */}
          <section aria-label="Favorite pharmacies">
            <FavoritePharmaciesSection />
          </section>

          {/* Notifications */}
          <section aria-label="Notifications">
            <NotificationCenter />
          </section>

          {/* Medicine Reminders */}
          <section aria-label="Medicine reminders">
            <MedicineReminderSection />
          </section>

        </div>

        {/* ======================================================
            Right Sidebar
           ====================================================== */}
        <aside
          aria-label="Dashboard sidebar"
          className="
            min-w-0
            flex
            flex-col
            gap-5
            xl:sticky
            xl:top-4
          "
        >

          {/* Healthcare Timeline */}
          <section aria-label="Healthcare timeline">
            <HealthcareTimeline />
          </section>

          {/* Account Settings */}
          <section aria-label="Account settings">
            <AccountSettingsPreview />
          </section>

        </aside>

      </div>

    </article>
  )
}

export default UserDashboard