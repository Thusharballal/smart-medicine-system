/**
 * Component: AdminMedicines
 *
 * Description:
 * Master medicine catalog management.
 * Uses real medicine data from the backend/MongoDB.
 */

import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineArchiveBox,
  HiOutlinePlus,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Badge from '../../components/ui/Badge'
import AdminTable from './components/AdminTable'
import medicineService from '../../services/medicineService'

const STATUS_VARIANT = {
  active: 'success',
  archived: 'neutral',
}

function AdminMedicines() {
  const navigate = useNavigate()

  const [medicines, setMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // =====================================================
  // Archive Medicine
  // =====================================================
  const handleArchive = async (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to archive ${row.name}?`
    )

    if (!confirmed) return

    try {
      await medicineService.archive(row.id)

      setMedicines((current) =>
        current.filter((medicine) => medicine.id !== row.id)
      )
    } catch (err) {
      console.error('Failed to archive medicine:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to archive medicine.'
      )
    }
  }

  // =====================================================
  // Table Columns
  // =====================================================
  const COLUMNS = [
    {
      key: 'name',
      label: 'Medicine',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 shrink-0">
            <MdMedication
              size={18}
              className="text-primary-600"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {row.name}
            </p>

            <p className="text-xs text-slate-400 truncate">
              {row.composition}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: 'genericName',
      label: 'Generic',
      hide: 'md',
      render: (row) => (
        <span className="text-xs text-slate-700">
          {row.genericName}
        </span>
      ),
    },

    {
      key: 'category',
      label: 'Category',
      hide: 'lg',
      render: (row) => (
        <span className="text-xs text-slate-700">
          {row.category}
        </span>
      ),
    },

    {
      key: 'manufacturer',
      label: 'Manufacturer',
      hide: 'xl',
      render: (row) => (
        <span className="text-xs text-slate-700">
          {row.manufacturer}
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

    // ===================================================
    // Actions
    // ===================================================
    {
      key: '_actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">

          {/* VIEW */}
          <button
            type="button"
            aria-label={`View ${row.name}`}
            title="View medicine"
            onClick={() =>
              navigate(`/admin/medicines/${row.id}`)
            }
            className="p-1.5 rounded text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
          >
            <HiOutlineEye
              size={16}
              aria-hidden="true"
            />
          </button>

          {/* EDIT */}
          <button
            type="button"
            aria-label={`Edit ${row.name}`}
            title="Edit medicine"
            onClick={() =>
              navigate(`/admin/medicines/${row.id}/edit`)
            }
            className="p-1.5 rounded text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary-500"
          >
            <HiOutlinePencil
              size={16}
              aria-hidden="true"
            />
          </button>
          {/* ARCHIVE */}
          <button
            type="button"
            aria-label={`Archive ${row.name}`}
            title="Archive medicine"
            onClick={() => handleArchive(row)}
            className="p-1.5 rounded text-slate-400 hover:text-warning-600 hover:bg-warning-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warning-400"
          >
            <HiOutlineArchiveBox
              size={16}
              aria-hidden="true"
            />
          </button>

        </div>
      ),
    },
  ]
  // ====================================================
  // Fetch Medicines
  // =====================================================
  useEffect(() => {
    async function fetchMedicines() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await medicineService.getAll()
        const formattedMedicines = response.data.map(
          (medicine) => ({
            ...medicine,
            // Display Jan Aushadhi name as medicine name
            name: medicine.jan_aushadhi_name,

            // Display generic name
            genericName: medicine.generic_name,

            // Convert backend boolean to UI status
            status: medicine.is_archived
              ? 'archived'
              : 'active',
          })
        )
        setMedicines(formattedMedicines)
      } catch (err) {
        console.error(
          'Failed to load medicines:',
          err
        )
        setError(
          err.response?.data?.detail ||
          'Failed to load medicines.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchMedicines()
  }, [])
  // =====================================================
  // UI
  // =====================================================
  return (
    <article className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medicine Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the master medicine catalog.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate('/admin/medicines/add')
          }
          className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          <HiOutlinePlus size={16} />
          Add Medicine
        </button>
      </div>
      {/* Loading */}
      {isLoading && (
        <div className="p-6 text-center text-slate-500">
          Loading medicines...
        </div>
      )}
      {/* Error */}
      {error && (
        <div className="p-6 text-center text-red-600">
          {error}
        </div>
      )}
      {/* Medicine Table */}
      {!isLoading && !error && (
        <AdminTable
          columns={COLUMNS}
          data={medicines}
          searchPlaceholder="Search medicines by name, generic name or category…"
          ariaLabel="Medicine catalog table"
        />
      )}

    </article>
  )
}
export default AdminMedicines