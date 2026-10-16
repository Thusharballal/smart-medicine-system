import { useEffect, useMemo, useState } from 'react'
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineNoSymbol,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { MdLocalPharmacy } from 'react-icons/md'

import Badge from '../../components/ui/Badge'
import AdminTable from './components/AdminTable'
import adminService from '../../services/adminService'

const STATUS_VARIANT = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
}

function AdminPharmacies() {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // Pharmacy selected for View modal
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)

  async function loadPharmacies() {
    try {
      setLoading(true)
      setError('')

      const response = await adminService.getPharmacies()

      const data = Array.isArray(response.data)
        ? response.data
        : []

      setPharmacies(data)
    } catch (err) {
      console.error('Failed to load pharmacies:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to load pharmacies.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPharmacies()
  }, [])

  const tableData = useMemo(() => {
    return pharmacies.map((pharmacy) => ({
      id: pharmacy._id,

      name: pharmacy.pharmacy_name,
      owner: pharmacy.owner_name,

      license: pharmacy.drug_license_number,

      location: [
        pharmacy.city,
        pharmacy.state,
      ]
        .filter(Boolean)
        .join(', '),

      status: pharmacy.status,

      medicines: '—',

      email: pharmacy.email,
      phone: pharmacy.phone_number,
      address: pharmacy.address,
      pin_code: pharmacy.pin_code,
      kendra_code: pharmacy.kendra_code,

      // Keep original data available
      original: pharmacy,
    }))
  }, [pharmacies])

  async function handleAction(action, pharmacyId, pharmacyName) {
    const confirmed = window.confirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} ${pharmacyName}?`
    )

    if (!confirmed) return

    try {
      setActionLoading(pharmacyId)

      if (action === 'approve') {
        await adminService.approvePharmacy(pharmacyId)
      }

      if (action === 'reject') {
        await adminService.rejectPharmacy(pharmacyId)
      }

      if (action === 'suspend') {
        await adminService.suspendPharmacy(pharmacyId)
      }

      if (action === 'activate') {
        await adminService.activatePharmacy(pharmacyId)
      }

      await loadPharmacies()
    } catch (err) {
      console.error(`Failed to ${action} pharmacy:`, err)

      window.alert(
        err.response?.data?.detail ||
        `Failed to ${action} pharmacy.`
      )
    } finally {
      setActionLoading(null)
    }
  }

  function handleView(pharmacy) {
    setSelectedPharmacy(pharmacy)
  }

  function closeModal() {
    setSelectedPharmacy(null)
  }

  const columns = [
    {
      key: 'name',
      label: 'Pharmacy',

      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-50 shrink-0">
            <MdLocalPharmacy
              size={16}
              className="text-secondary-600"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
              {row.name}
            </p>

            <p className="text-[10px] text-slate-400">
              {row.owner}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: 'license',
      label: 'License',
      hide: 'lg',

      render: (row) => (
        <span className="text-xs font-mono text-slate-500">
          {row.license || '—'}
        </span>
      ),
    },

    {
      key: 'location',
      label: 'Location',
      hide: 'md',

      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.location || '—'}
        </span>
      ),
    },

    {
      key: 'status',
      label: 'Status',

      render: (row) => (
        <Badge
          variant={STATUS_VARIANT[row.status] ?? 'neutral'}
          dot
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },

    {
      key: 'medicines',
      label: 'Medicines',
      hide: 'xl',

      render: (row) => (
        <span className="text-xs font-bold text-slate-700">
          {row.medicines}
        </span>
      ),
    },

    {
      key: '_actions',
      label: 'Actions',

      render: (row) => {
        const isLoading = actionLoading === row.id

        return (
          <div className="flex items-center gap-1">

            {/* APPROVE + REJECT */}
            {row.status === 'PENDING' && (
              <>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleAction(
                      'approve',
                      row.id,
                      row.name
                    )
                  }
                  aria-label={`Approve ${row.name}`}
                  title="Approve"
                  className="p-1.5 rounded text-slate-400 hover:text-success-600 hover:bg-success-50 disabled:opacity-40 transition-colors"
                >
                  <HiOutlineCheckCircle
                    size={14}
                    aria-hidden="true"
                  />
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleAction(
                      'reject',
                      row.id,
                      row.name
                    )
                  }
                  aria-label={`Reject ${row.name}`}
                  title="Reject"
                  className="p-1.5 rounded text-slate-400 hover:text-danger-500 hover:bg-danger-50 disabled:opacity-40 transition-colors"
                >
                  <HiOutlineXCircle
                    size={14}
                    aria-hidden="true"
                  />
                </button>
              </>
            )}

            {/* VIEW */}
            <button
              type="button"
              onClick={() => handleView(row)}
              aria-label={`View ${row.name}`}
              title="View details"
              className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <HiOutlineEye
                size={14}
                aria-hidden="true"
              />
            </button>

            {/* SUSPEND */}
            {row.status === 'APPROVED' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleAction(
                    'suspend',
                    row.id,
                    row.name
                  )
                }
                aria-label={`Suspend ${row.name}`}
                title="Suspend"
                className="p-1.5 rounded text-slate-400 hover:text-warning-600 hover:bg-warning-50 disabled:opacity-40 transition-colors"
              >
                <HiOutlineNoSymbol
                  size={14}
                  aria-hidden="true"
                />
              </button>
            )}

            {/* ACTIVATE */}
            {row.status === 'SUSPENDED' && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleAction(
                    'activate',
                    row.id,
                    row.name
                  )
                }
                aria-label={`Activate ${row.name}`}
                title="Activate"
                className="p-1.5 rounded text-slate-400 hover:text-success-600 hover:bg-success-50 disabled:opacity-40 transition-colors"
              >
                <HiOutlineCheckCircle
                  size={14}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <article
        aria-label="Pharmacy Management"
        className="flex flex-col gap-5"
      >
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Pharmacy Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Loading pharmacies...
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-sm text-slate-500">
            Loading pharmacy records...
          </p>
        </div>
      </article>
    )
  }

  if (error) {
    return (
      <article
        aria-label="Pharmacy Management"
        className="flex flex-col gap-5"
      >
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Pharmacy Management
          </h1>

          <p className="text-xs text-danger-500 mt-0.5">
            {error}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-sm text-danger-500 mb-4">
            {error}
          </p>

          <button
            type="button"
            onClick={loadPharmacies}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </article>
    )
  }

  return (
    <>
      <article
        aria-label="Pharmacy Management"
        className="flex flex-col gap-5"
      >
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Pharmacy Management
          </h1>

          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered pharmacies and their approval status.
          </p>
        </div>

        <AdminTable
          columns={columns}
          data={tableData}
          searchPlaceholder="Search pharmacies by name, owner, location…"
          ariaLabel="Pharmacy management table"
        />
      </article>

      {/* ========================= */}
      {/* PHARMACY DETAILS MODAL     */}
      {/* ========================= */}

      {selectedPharmacy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pharmacy-details-title"
        >
          {/* Background overlay */}
          <button
            type="button"
            aria-label="Close pharmacy details"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm cursor-default"
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-50">
                  <MdLocalPharmacy
                    size={20}
                    className="text-secondary-600"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    id="pharmacy-details-title"
                    className="text-base font-bold text-slate-900"
                  >
                    Pharmacy Details
                  </h2>

                  <p className="text-xs text-slate-400">
                    Complete pharmacy information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <HiOutlineXMark
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">

              {/* Pharmacy name + status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedPharmacy.name || 'Not available'}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Owner: {selectedPharmacy.owner || 'Not available'}
                  </p>
                </div>

                <Badge
                  variant={
                    STATUS_VARIANT[selectedPharmacy.status] ??
                    'neutral'
                  }
                  dot
                  size="sm"
                >
                  {selectedPharmacy.status || 'UNKNOWN'}
                </Badge>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Owner
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedPharmacy.owner || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Email
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1 break-all">
                    {selectedPharmacy.email || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Phone
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedPharmacy.phone || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Drug License Number
                  </p>

                  <p className="text-sm font-mono font-medium text-slate-800 mt-1">
                    {selectedPharmacy.license || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    Kendra Code
                  </p>

                  <p className="text-sm font-mono font-medium text-slate-800 mt-1">
                    {selectedPharmacy.kendra_code || 'Not available'}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                    PIN Code
                  </p>

                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {selectedPharmacy.pin_code || 'Not available'}
                  </p>
                </div>

              </div>

              {/* Address */}
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Address
                </p>

                <p className="text-sm font-medium text-slate-800 mt-1">
                  {selectedPharmacy.address || 'Not available'}
                </p>
              </div>

              {/* Location */}
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                  Location
                </p>

                <p className="text-sm font-medium text-slate-800 mt-1">
                  {selectedPharmacy.location || 'Not available'}
                </p>
              </div>

              {/* Coordinates */}
              {selectedPharmacy.original && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                      Latitude
                    </p>

                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {selectedPharmacy.original.latitude ?? 'Not available'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                      Longitude
                    </p>

                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {selectedPharmacy.original.longitude ?? 'Not available'}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default AdminPharmacies