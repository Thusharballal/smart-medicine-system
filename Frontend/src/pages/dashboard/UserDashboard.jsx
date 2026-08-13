import DashboardHeader          from './sections/DashboardHeader'
import QuickStats               from './sections/QuickStats'
import QuickActions             from './sections/QuickActions'
import SavedMedicinesSection    from './sections/SavedMedicinesSection'
import SearchHistorySection     from './sections/SearchHistorySection'
import FavoritePharmaciesSection from './sections/FavoritePharmaciesSection'
import NotificationCenter       from './sections/NotificationCenter'
import MedicineReminderSection  from './sections/MedicineReminderSection'
import HealthcareTimeline       from './sections/HealthcareTimeline'
import AccountSettingsPreview   from './sections/AccountSettingsPreview'
import Divider                  from '../../components/ui/Divider'

function UserDashboard() {
  return (
    <article aria-label="User Dashboard" className="flex flex-col gap-5">

      {/* ======================================================
          Dashboard Overview
         ====================================================== */}
      <DashboardHeader />

      {/* ======================================================
          Quick Statistics
         ====================================================== */}
      <QuickStats />

      {/* ======================================================
          Quick Actions
         ====================================================== */}
      <QuickActions />

      <Divider className="my-0" />

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

        {/* ── Left column: main content ──────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* ======================================================
              Saved Medicines
             ====================================================== */}
          <SavedMedicinesSection />

          {/* ======================================================
              Search History
             ====================================================== */}
          <SearchHistorySection />

          {/* ======================================================
              Favorite Pharmacies
             ====================================================== */}
          <FavoritePharmaciesSection />

          {/* ======================================================
              Notifications
             ====================================================== */}
          <NotificationCenter />

          {/* ======================================================
              Medicine Reminder
             ====================================================== */}
          <MedicineReminderSection />

        </div>

        {/* ── Right column: sticky sidebar ───────────────────── */}
        <div className="lg:sticky lg:top-16 flex flex-col gap-5">

          {/* ======================================================
              Healthcare Timeline
             ====================================================== */}
          <HealthcareTimeline />

          {/* ======================================================
              Account Settings Preview
             ====================================================== */}
          <AccountSettingsPreview />

        </div>
      </div>

    </article>
  )
}

export default UserDashboard
