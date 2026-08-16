import { HiOutlineCalendar } from 'react-icons/hi2'
import Avatar from '../../../components/ui/Avatar'
import { useAuth } from '../../../contexts/AuthContext'

function DashboardHeader() {
  const { currentUser } = useAuth()

  const name =
    currentUser?.full_name ||
    currentUser?.name ||
    'User'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening'

  return (
    <section aria-labelledby="dashboard-welcome">

      {/* =====================================================
          Dashboard Welcome Header
         ===================================================== */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">

        {/* Background pattern */}
        <div
          aria-hidden="true"
          className="
            absolute inset-0
            bg-[radial-gradient(white_1px,transparent_1px)]
            [background-size:28px_28px]
            opacity-5
            pointer-events-none
          "
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          {/* =================================================
              User Information
             ================================================= */}
          <div className="flex items-center gap-4 min-w-0">

            <Avatar
              name={name}
              size="xl"
              online
            />

            <div className="min-w-0">

              <p className="text-primary-200 text-sm">
                {greeting},
              </p>

              <h1
                id="dashboard-welcome"
                className="
                  text-2xl sm:text-3xl
                  font-extrabold
                  text-white
                  leading-tight
                  truncate
                "
              >
                {name}
              </h1>

              <div className="flex items-center gap-1.5 text-primary-200 text-xs mt-1">

                <HiOutlineCalendar
                  size={12}
                  aria-hidden="true"
                />

                <span>{today}</span>

              </div>

            </div>
          </div>

          {/* =================================================
              Account Information
             ================================================= */}
          <div className="flex flex-col items-start sm:items-end gap-2">

            <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10">

              <p className="text-[10px] text-primary-200 uppercase tracking-wider">
                Account
              </p>

              <p className="text-sm font-semibold text-white capitalize">
                {currentUser?.role?.replaceAll('_', ' ') || 'User'}
              </p>

            </div>

          </div>

        </div>
      </div>

    </section>
  )
}

export default DashboardHeader