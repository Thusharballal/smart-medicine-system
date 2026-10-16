import { useEffect, useState } from 'react'
import {
  HiOutlineUsers,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlass,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentChartBar,
  HiOutlineCog6Tooth,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from 'react-icons/hi2'
import {
  MdLocalPharmacy,
  MdMedication,
  MdOutlineSecurity,
} from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

import {
  ACTIVITY_LOGS,
  USERS,
  PHARMACIES,
  MEDICINES_CATALOG,
  GENERIC_MAPPINGS,
  AUDIT_TRAIL,
  PENDING_PHARMACY_REGS,
  PENDING_GENERIC_MAPPINGS,
  PENDING_MEDICINE_APPROVALS,
  SECURITY_LOGS,
  SYSTEM_SERVICES,
  REPORT_TYPES,
  AI_SERVICES,
  BACKUP_HISTORY,
  ADMIN_NOTIFICATIONS,
} from './data/adminData'

import { ROUTES } from '../../constants/routes'
import adminService from '../../services/adminService'


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [globalSearch, setGlobalSearch] = useState('')

  /* -------------------------------------------------------
     LIVE ADMIN DATA
  ------------------------------------------------------- */

  const [adminUsers, setAdminUsers] = useState([])
  const [adminPharmacies, setAdminPharmacies] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)

  /* -------------------------------------------------------
     LOAD ADMIN STATISTICS
  ------------------------------------------------------- */

  useEffect(() => {
    async function loadAdminStats() {
      try {
        setStatsLoading(true)

        const [usersResponse, pharmaciesResponse] =
          await Promise.all([
            adminService.getUsers(),
            adminService.getPharmacies(),
          ])

        setAdminUsers(
          Array.isArray(usersResponse.data)
            ? usersResponse.data
            : []
        )

        setAdminPharmacies(
          Array.isArray(pharmaciesResponse.data)
            ? pharmaciesResponse.data
            : []
        )
      } catch (error) {
        console.error(
          'Failed to load admin dashboard statistics:',
          error
        )
      } finally {
        setStatsLoading(false)
      }
    }

    loadAdminStats()
  }, [])

  /* -------------------------------------------------------
     LIVE COUNTS
  ------------------------------------------------------- */

  const pendingPharmacies = adminPharmacies.filter(
    pharmacy => pharmacy.status === 'PENDING'
  ).length

  const pendingMappings = GENERIC_MAPPINGS.filter(
    mapping => mapping.status === 'pending'
  ).length

  const unreadNotifs = ADMIN_NOTIFICATIONS.filter(
    notification => !notification.read
  ).length

  /* -------------------------------------------------------
     PLATFORM STATS
  ------------------------------------------------------- */

  const platformStats = [
    {
      label: 'Total Users',
      value: statsLoading ? '—' : adminUsers.length,
      variant: 'primary',
      icon: <HiOutlineUsers size={18} />,
      route: ROUTES.ADMIN.USERS,
      subtitle: 'Registered users',
    },

    {
      label: 'Pharmacies',
      value: statsLoading ? '—' : adminPharmacies.length,
      variant: 'secondary',
      icon: <MdLocalPharmacy size={18} />,
      route: ROUTES.ADMIN.PHARMACIES,
      subtitle: statsLoading
        ? 'Loading...'
        : `${adminPharmacies.filter(
            pharmacy => pharmacy.status === 'APPROVED'
          ).length} approved`,
    },

    {
      label: 'Medicines',
      value: MEDICINES_CATALOG.length,
      variant: 'success',
      icon: <MdMedication size={18} />,
      route: ROUTES.ADMIN.MEDICINES,
      subtitle: `${MEDICINES_CATALOG.filter(
        medicine => medicine.status === 'active'
      ).length} active`,
    },

    {
      label: 'Generic Mappings',
      value: GENERIC_MAPPINGS.length,
      variant: 'info',
      icon: <HiOutlineArrowPath size={18} />,
      route: ROUTES.ADMIN.GENERIC_MAP,
      subtitle: `${GENERIC_MAPPINGS.filter(
        mapping => mapping.status === 'approved'
      ).length} approved`,
    },

    {
      label: 'Daily Searches',
      value: '—',
      variant: 'default',
      icon: <HiOutlineMagnifyingGlass size={18} />,
      route: null,
      subtitle: 'Analytics unavailable',
    },

    {
      label: 'Notifications',
      value: ADMIN_NOTIFICATIONS.length,
      variant: 'warning',
      icon: <HiOutlineBell size={18} />,
      route: ROUTES.ADMIN.NOTIFICATIONS,
      subtitle: `${unreadNotifs} unread`,
    },

    {
      label: 'Platform Health',
      value: '99%',
      variant: 'success',
      icon: <HiOutlineShieldCheck size={18} />,
      route: null,
      subtitle: 'All systems operational',
    },

    {
      label: 'Active Sessions',
      value: '—',
      variant: 'default',
      icon: <HiOutlineUsers size={18} />,
      route: null,
      subtitle: 'Session tracking unavailable',
    },
  ]

  /* -------------------------------------------------------
     TAB CONTENT
  ------------------------------------------------------- */

  const tabContent = {
    overview: (
      <OverviewTab
        pendingPharmacies={pendingPharmacies}
        pendingMappings={pendingMappings}
        platformStats={platformStats}
        adminUsers={adminUsers}
        adminPharmacies={adminPharmacies}
      />
    ),

    users: <UsersTab users={adminUsers} />,

    pharmacies: (
      <PharmaciesTab pharmacies={adminPharmacies} />
    ),

    activity: <ActivityTab />,

    security: <SecurityTab />,

    reports: <ReportsTab />,

    settings: <SettingsTab />,
  }

  /* -------------------------------------------------------
     GLOBAL SEARCH
  ------------------------------------------------------- */

  const handleGlobalSearch = event => {
    event.preventDefault()

    const query = globalSearch.trim().toLowerCase()

    if (!query) {
      return
    }

    if (query.includes('user')) {
      navigate(ROUTES.ADMIN.USERS)
      return
    }

    if (query.includes('pharmacy')) {
      navigate(ROUTES.ADMIN.PHARMACIES)
      return
    }

    if (query.includes('medicine')) {
      navigate(ROUTES.ADMIN.MEDICINES)
      return
    }

    if (
      query.includes('mapping') ||
      query.includes('generic')
    ) {
      navigate(ROUTES.ADMIN.GENERIC_MAP)
      return
    }

    if (query.includes('notification')) {
      navigate(ROUTES.ADMIN.NOTIFICATIONS)
      return
    }

    if (query.includes('report')) {
      navigate(ROUTES.ADMIN.REPORTS)
      return
    }
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* TITLE */}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage users, pharmacies, medicines and
                platform operations.
              </p>
            </div>

            {/* SEARCH */}

            <form
              onSubmit={handleGlobalSearch}
              className="flex w-full max-w-md items-center gap-2"
            >
              <div className="relative flex-1">

                <HiOutlineMagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />

                <input
                  type="text"
                  value={globalSearch}
                  onChange={event =>
                    setGlobalSearch(event.target.value)
                  }
                  placeholder="Search admin sections..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ---------------------------------------------------
            TABS
        --------------------------------------------------- */}

        <div className="mb-6 flex flex-wrap gap-2">

          {[
            {
              id: 'overview',
              label: 'Overview',
              icon: HiOutlineDocumentChartBar,
            },

            {
              id: 'users',
              label: 'Users',
              icon: HiOutlineUsers,
            },

            {
              id: 'pharmacies',
              label: 'Pharmacies',
              icon: MdLocalPharmacy,
            },

            {
              id: 'activity',
              label: 'Activity',
              icon: HiOutlineClipboardDocumentList,
            },

            {
              id: 'security',
              label: 'Security',
              icon: MdOutlineSecurity,
            },

            {
              id: 'reports',
              label: 'Reports',
              icon: HiOutlineDocumentChartBar,
            },

            {
              id: 'settings',
              label: 'Settings',
              icon: HiOutlineCog6Tooth,
            },
          ].map(tab => {
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            )
          })}

        </div>


        {/* ---------------------------------------------------
            TAB CONTENT
        --------------------------------------------------- */}

        {tabContent[activeTab]}

      </main>

    </div>
  )
}


/* =========================================================
   OVERVIEW TAB
========================================================= */

function OverviewTab({
  pendingPharmacies,
  pendingMappings,
  platformStats,
  adminUsers,
  adminPharmacies,
}) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">

      {/* =====================================================
          PLATFORM STATISTICS
      ===================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-gray-900">
            Platform Statistics
          </h2>

          <p className="text-sm text-gray-500">
            Current platform overview.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {platformStats.map(stat => (
            <button
              key={stat.label}
              type="button"
              disabled={!stat.route}
              onClick={() => {
                if (stat.route) {
                  navigate(stat.route)
                }
              }}
              className={`rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition ${
                stat.route
                  ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                  : 'cursor-default'
              }`}
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {stat.subtitle}
                  </p>

                </div>

                <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                  {stat.icon}
                </div>

              </div>

            </button>
          ))}

        </div>

      </section>


      {/* =====================================================
          PENDING ACTIONS
      ===================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-gray-900">
            Pending Actions
          </h2>

          <p className="text-sm text-gray-500">
            Items that may require administrator attention.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <PendingCard
            title="Pharmacy Registrations"
            count={pendingPharmacies}
            description="Pharmacies waiting for approval."
            icon={<MdLocalPharmacy size={20} />}
            onClick={() =>
              navigate(ROUTES.ADMIN.PHARMACIES)
            }
          />

          <PendingCard
            title="Generic Mappings"
            count={pendingMappings}
            description="Generic mappings waiting for review."
            icon={<HiOutlineArrowPath size={20} />}
            onClick={() =>
              navigate(ROUTES.ADMIN.GENERIC_MAP)
            }
          />

          <PendingCard
            title="Medicine Approvals"
            count={PENDING_MEDICINE_APPROVALS.length}
            description="Medicine records waiting for review."
            icon={<MdMedication size={20} />}
            onClick={() =>
              navigate(ROUTES.ADMIN.MEDICINES)
            }
          />

        </div>

      </section>


      {/* =====================================================
          MANAGEMENT MODULES
      ===================================================== */}

      <section>

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-gray-900">
            Management Modules
          </h2>

          <p className="text-sm text-gray-500">
            Quickly access major administration areas.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

          {[
            {
              title: 'User Management',
              desc: `${adminUsers.length} total users`,
              to: ROUTES.ADMIN.USERS,
              icon: HiOutlineUsers,
              count: adminUsers.length,
            },

            {
              title: 'Pharmacy Network',
              desc: `${adminPharmacies.filter(
                pharmacy => pharmacy.status === 'APPROVED'
              ).length} approved`,
              to: ROUTES.ADMIN.PHARMACIES,
              icon: MdLocalPharmacy,
              count: adminPharmacies.length,
            },

            {
              title: 'Medicine Catalog',
              desc: `${MEDICINES_CATALOG.length} medicines`,
              to: ROUTES.ADMIN.MEDICINES,
              icon: MdMedication,
              count: MEDICINES_CATALOG.length,
            },

            {
              title: 'Generic Mapping',
              desc: `${GENERIC_MAPPINGS.length} brand-generic pairs`,
              to: ROUTES.ADMIN.GENERIC_MAP,
              icon: HiOutlineArrowPath,
              count: GENERIC_MAPPINGS.length,
            },
          ].map(module => {

            const Icon = module.icon

            return (
              <button
                key={module.title}
                type="button"
                onClick={() => navigate(module.to)}
                className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon size={21} />
                    </div>

                    <h3 className="font-semibold text-gray-900">
                      {module.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {module.desc}
                    </p>

                  </div>

                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {module.count}
                  </span>

                </div>

              </button>
            )
          })}

        </div>

      </section>


      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-500">
              Latest administrator and platform activity.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.ACTIVITY)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </button>

        </div>


        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          {ACTIVITY_LOGS.slice(0, 5).map((activity, index) => (

            <div
              key={activity.id || index}
              className={`flex items-center gap-4 px-5 py-4 ${
                index !== 0
                  ? 'border-t border-gray-100'
                  : ''
              }`}
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <HiOutlineClock size={17} />
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-medium text-gray-800">
                  {activity.action ||
                    activity.description ||
                    'Activity recorded'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {activity.user ||
                    activity.admin ||
                    activity.timestamp ||
                    'Recent activity'}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  )
}


/* =========================================================
   PENDING CARD
========================================================= */

function PendingCard({
  title,
  count,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div>

          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            {icon}
          </div>

          <h3 className="font-semibold text-gray-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>

        </div>

        <span className="text-2xl font-bold text-gray-900">
          {count}
        </span>

      </div>

    </button>
  )
}


/* =========================================================
   USERS TAB
========================================================= */

function UsersTab({ users }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">

      <PageHeader
        title="User Management"
        description="View registered platform users."
        actionLabel="Open User Management"
        onAction={() =>
          navigate(ROUTES.ADMIN.USERS)
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-5 py-4">

          <h3 className="font-semibold text-gray-900">
            Registered Users
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {users.length} users found.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Name
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Email
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Role
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">

              {users.slice(0, 10).map((user, index) => (

                <tr key={user._id || user.id || index}>

                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {user.full_name || user.name || '—'}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {user.email || '—'}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-600">
                    {user.role || 'USER'}
                  </td>

                  <td className="px-5 py-4">

                    <StatusBadge
                      status={user.status || 'ACTIVE'}
                    />

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   PHARMACIES TAB
========================================================= */

function PharmaciesTab({ pharmacies }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">

      <PageHeader
        title="Pharmacy Network"
        description="View registered pharmacies and their approval status."
        actionLabel="Open Pharmacy Management"
        onAction={() =>
          navigate(ROUTES.ADMIN.PHARMACIES)
        }
      />

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-5 py-4">

          <h3 className="font-semibold text-gray-900">
            Registered Pharmacies
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {pharmacies.length} pharmacies found.
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Pharmacy
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Owner
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  City
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">

              {pharmacies.slice(0, 10).map(
                (pharmacy, index) => (

                  <tr
                    key={
                      pharmacy._id ||
                      pharmacy.id ||
                      index
                    }
                  >

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {pharmacy.pharmacy_name ||
                        pharmacy.name ||
                        '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pharmacy.owner_name ||
                        pharmacy.owner ||
                        '—'}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pharmacy.city || '—'}
                    </td>

                    <td className="px-5 py-4">

                      <StatusBadge
                        status={
                          pharmacy.status ||
                          'PENDING'
                        }
                      />

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   ACTIVITY TAB
========================================================= */

function ActivityTab() {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Activity"
        description="Recent platform activity and administrator actions."
      />

      <div className="space-y-3">

        {ACTIVITY_LOGS.map((activity, index) => (

          <div
            key={activity.id || index}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
              <HiOutlineClipboardDocumentList size={19} />
            </div>

            <div className="min-w-0 flex-1">

              <p className="font-medium text-gray-900">
                {activity.action ||
                  activity.description ||
                  'Activity'}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {activity.user ||
                  activity.admin ||
                  'Administrator'}
              </p>

            </div>

            <HiOutlineClock
              size={18}
              className="text-gray-400"
            />

          </div>

        ))}

      </div>

    </div>
  )
}


/* =========================================================
   SECURITY TAB
========================================================= */

function SecurityTab() {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Security"
        description="Review security events and system status."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <InfoCard
          title="Security Logs"
          value={SECURITY_LOGS.length}
          icon={<MdOutlineSecurity size={20} />}
        />

        <InfoCard
          title="Audit Records"
          value={AUDIT_TRAIL.length}
          icon={
            <HiOutlineClipboardDocumentList
              size={20}
            />
          }
        />

        <InfoCard
          title="System Services"
          value={SYSTEM_SERVICES.length}
          icon={<HiOutlineShieldCheck size={20} />}
        />

      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

        <h3 className="font-semibold text-gray-900">
          Security Events
        </h3>

        <div className="mt-4 space-y-3">

          {SECURITY_LOGS.slice(0, 10).map(
            (log, index) => (

              <div
                key={log.id || index}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
              >

                <MdOutlineSecurity
                  size={18}
                  className="text-gray-500"
                />

                <span className="text-sm text-gray-700">
                  {log.action ||
                    log.description ||
                    'Security event recorded'}
                </span>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   REPORTS TAB
========================================================= */

function ReportsTab() {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Reports"
        description="Available administration and platform reports."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

        {REPORT_TYPES.map((report, index) => (

          <div
            key={report.id || index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HiOutlineDocumentChartBar
                size={20}
              />
            </div>

            <h3 className="font-semibold text-gray-900">
              {report.name ||
                report.title ||
                `Report ${index + 1}`}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {report.description ||
                'Platform administration report.'}
            </p>

          </div>

        ))}

      </div>

    </div>
  )
}


/* =========================================================
   SETTINGS TAB
========================================================= */

function SettingsTab() {
  return (
    <div className="space-y-6">

      <PageHeader
        title="Admin Settings"
        description="Platform administration settings."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <InfoCard
          title="AI Services"
          value={AI_SERVICES.length}
          icon={<MdMedication size={20} />}
        />

        <InfoCard
          title="Backup History"
          value={BACKUP_HISTORY.length}
          icon={
            <HiOutlineClipboardDocumentList
              size={20}
            />
          }
        />

      </div>

    </div>
  )
}


/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

      <div>

        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}

    </div>
  )
}


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>

        </div>

        <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
          {icon}
        </div>

      </div>

    </div>
  )
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const normalizedStatus = String(status).toUpperCase()

  const statusConfig = {
    ACTIVE: {
      className:
        'bg-green-50 text-green-700',
      icon: <HiOutlineCheckCircle size={14} />,
    },

    APPROVED: {
      className:
        'bg-green-50 text-green-700',
      icon: <HiOutlineCheckCircle size={14} />,
    },

    PENDING: {
      className:
        'bg-yellow-50 text-yellow-700',
      icon: <HiOutlineClock size={14} />,
    },

    REJECTED: {
      className:
        'bg-red-50 text-red-700',
      icon: <HiOutlineXMark size={14} />,
    },

    SUSPENDED: {
      className:
        'bg-orange-50 text-orange-700',
      icon: (
        <HiOutlineExclamationTriangle
          size={14}
        />
      ),
    },

    DELETED: {
      className:
        'bg-gray-100 text-gray-700',
      icon: <HiOutlineXMark size={14} />,
    },
  }

  const config =
    statusConfig[normalizedStatus] ||
    {
      className:
        'bg-gray-100 text-gray-700',
      icon: <HiOutlineClock size={14} />,
    }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.icon}
      {normalizedStatus}
    </span>
  )
}


/* =========================================================
   EXPORT
========================================================= */

export default AdminDashboard