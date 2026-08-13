import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import medicineService from '../../services/medicineService'
function AdminMedicineEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')
  useEffect(() => {
    async function fetchMedicine() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await medicineService.getById(id)
        setMedicine(response.data)
      } catch (err) {
        console.error('Failed to load medicine:', err)

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
  function handleChange(event) {
    const { name, value } = event.target
    setMedicine((current) => ({
      ...current,
      [name]: value,
    }))
  }
  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setIsSaving(true)
      setError(null)
      setSuccess('')
    await medicineService.update(id, {
      generic_name: medicine.generic_name,
      jan_aushadhi_name: medicine.jan_aushadhi_name,
      brand_names: medicine.brand_names || [],
      composition: medicine.composition,
      strength: medicine.strength,
      dosage_form: medicine.dosage_form,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      description: medicine.description,
      price: Number(medicine.price),
    })
    setSuccess('Medicine updated successfully.')
    setTimeout(() => {
      navigate('/admin/medicines')
    }, 1500)
    } catch (err) {
      console.error('Failed to update medicine:', err)
      setError(
        err.response?.data?.detail ||
        'Failed to update medicine.'
      )
    } finally {
      setIsSaving(false)
    }
  }
  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading medicine...
      </div>
    )
  }
  if (error && !medicine) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    )
  }
  if (!medicine) {
    return null
  }
  return (
    <article className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Medicine
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the medicine information.
        </p>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-600">
          {success}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
      >

        {/* Read-only master fields */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Generic Name
          </label>
            <input
            name="jan_aushadhi_name"
            value={medicine.jan_aushadhi_name || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jan Aushadhi Name
          </label>
          <input
                name="jan_aushadhi_name"
                value={medicine.jan_aushadhi_name || ''}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />  
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Strength
          </label>
          <input
            name="strength"
            value={medicine.strength || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        {/* Editable fields */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Brand Names
          </label>
          <input
            value={(medicine.brand_names || []).join(', ')}
            onChange={(event) =>
              setMedicine((current) => ({
                ...current,
                brand_names: event.target.value
                  .split(',')
                  .map((name) => name.trim())
                  .filter(Boolean),
              }))
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            placeholder="Crocin, Calpol"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Composition
          </label>
          <input
            name="composition"
            value={medicine.composition || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Dosage Form
          </label>
          <input
            name="dosage_form"
            value={medicine.dosage_form || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Manufacturer
          </label>
          <input
            name="manufacturer"
            value={medicine.manufacturer || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <input
            name="category"
            value={medicine.category || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Price
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={medicine.price ?? ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={medicine.description || ''}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin/medicines')}
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                'Saving...'
              ) : success ? (
                '✓ Saved'
              ) : (
                'Save Changes'
              )}
            </button>
        </div>
      </form>
    </article>
  )
}
export default AdminMedicineEdit