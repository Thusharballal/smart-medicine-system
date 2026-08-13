import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import medicineService from '../../services/medicineService'
function AdminMedicineDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // =====================================================
  // Fetch Medicine
  // =====================================================
  useEffect(() => {
    async function fetchMedicine() {
      try {
        setIsLoading(true)
        setError(null)
        const response =
          await medicineService.getById(id)

        setMedicine(response.data)
      } catch (err) {
        console.error(
          'Failed to load medicine:',
          err
        )

        setError(
          err.response?.data?.detail ||
          'Failed to load medicine.'
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchMedicine()
  }, [id])
  // =====================================================
  // Loading
  // =====================================================
  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading medicine...
      </div>
    )
  }
  // =====================================================
  // Error
  // =====================================================
  if (error) {
    return (
      <article className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-center text-red-600">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate('/admin/medicines')
          }
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to Medicine Catalog
        </button>
      </article>
    )
  }
  if (!medicine) {
    return null
  }
  // =====================================================
  // Details Page
  // =====================================================
  return (
    <article className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medicine Details
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View master medicine information.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/medicines/${medicine.id}/edit`
            )
          }
          className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Edit Medicine
        </button>
      </div>
      {/* Medicine Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Jan Aushadhi Name */}
          <div>
            <p className="text-xs text-slate-500">
              Jan Aushadhi Name
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {medicine.jan_aushadhi_name || '—'}
            </p>
          </div>
          {/* Generic Name */}
          <div>
            <p className="text-xs text-slate-500">
              Generic Name
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {medicine.generic_name || '—'}
            </p>
          </div>
          {/* Brand Names */}
          <div>
            <p className="text-xs text-slate-500">
              Brand Names
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {(medicine.brand_names || []).join(', ') || '—'}
            </p>
          </div>
          {/* Composition */}
          <div>
            <p className="text-xs text-slate-500">
              Composition
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {medicine.composition || '—'}
            </p>
          </div>
          {/* Strength */}
          <div>
            <p className="text-xs text-slate-500">
              Strength
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {medicine.strength || '—'}
            </p>
          </div>
          {/* Dosage Form */}
          <div>
            <p className="text-xs text-slate-500">
              Dosage Form
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {medicine.dosage_form || '—'}
            </p>
          </div>
          {/* Manufacturer */}
          <div>
            <p className="text-xs text-slate-500">
              Manufacturer
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {medicine.manufacturer || '—'}
            </p>
          </div>
          {/* Category */}
          <div>
            <p className="text-xs text-slate-500">
              Category
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {medicine.category || '—'}
            </p>
          </div>
          {/* Price */}
          <div>
            <p className="text-xs text-slate-500">
              Price
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              ₹{medicine.price ?? '—'}
            </p>
          </div>
          {/* Status */}
          <div>
            <p className="text-xs text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {medicine.is_archived
                ? 'Archived'
                : 'Active'}
            </p>
          </div>
        </div>
        {/* Description */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500">
            Description
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {medicine.description ||
              'No description available.'}
          </p>
        </div>
      </div>
      {/* Back */}
      <button
        type="button"
        onClick={() =>
          navigate('/admin/medicines')
        }
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to Medicine Catalog
      </button>
    </article>
  )
}
export default AdminMedicineDetails