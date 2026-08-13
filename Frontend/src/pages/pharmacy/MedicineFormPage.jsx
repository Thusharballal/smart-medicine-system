import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import medicineService from '../../services/medicineService'
import batchService from '../../services/batchService'
import Input from '../../components/forms/Input'
import Select from '../../components/forms/Select'
import Button from '../../components/ui/Button'
import { ROUTES } from '../../constants/routes'
function MedicineFormPage() {
  const navigate = useNavigate()
  const [medicines, setMedicines] = useState([])
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMedicineId, setSelectedMedicineId] = useState('')
  const [form, setForm] = useState({
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity_received: '',
    purchase_price: '',
    mrp: '',
    supplier_name: '',
    invoice_number: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // =====================================================
  // Load existing medicine master data
  // =====================================================
  useEffect(() => {
    async function fetchMedicines() {
      try {
        setIsLoadingMedicines(true)
        setError('')

        const response = await medicineService.getAll()

        setMedicines(response.data || [])
      } catch (err) {
        console.error('Failed to load medicines:', err)

        setError(
          err.response?.data?.detail ||
          'Failed to load medicines.'
        )
      } finally {
        setIsLoadingMedicines(false)
      }
    }

    fetchMedicines()
  }, [])

  // =====================================================
  // Handle form changes
  // =====================================================
  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  // =====================================================
  // Submit
  // =====================================================
  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!selectedMedicineId) {
      setError('Please select a medicine.')
      return
    }

    if (!form.batch_number.trim()) {
      setError('Batch number is required.')
      return
    }

    if (!form.manufacturing_date) {
      setError('Manufacturing date is required.')
      return
    }
    if (!form.expiry_date) {
      setError('Expiry date is required.')
      return
    }
    if (new Date(form.expiry_date) <= new Date(form.manufacturing_date)) {
      setError('Expiry date must be after manufacturing date.')
      return
    }
    if (!form.quantity_received || Number(form.quantity_received) <= 0) {
      setError('Quantity must be greater than 0.')
      return
    }
    if (!form.purchase_price || Number(form.purchase_price) <= 0) {
      setError('Purchase price must be greater than 0.')
      return
    }
    if (!form.mrp || Number(form.mrp) <= 0) {
      setError('MRP must be greater than 0.')
      return
    }
    if (!form.supplier_name.trim()) {
      setError('Supplier name is required.')
      return
    }
    if (!form.invoice_number.trim()) {
      setError('Invoice number is required.')
      return
    }
    try {
      setIsSubmitting(true)
      const payload = {
        medicine_id: selectedMedicineId,
        batch_number: form.batch_number.trim(),
        manufacturing_date: `${form.manufacturing_date}T00:00:00Z`,
        expiry_date: `${form.expiry_date}T00:00:00Z`,
        quantity_received: Number(form.quantity_received),
        purchase_price: Number(form.purchase_price),
        mrp: Number(form.mrp),
        supplier_name: form.supplier_name.trim(),
        invoice_number: form.invoice_number.trim(),
      }
      console.log('Creating batch:', payload)
      await batchService.create(payload)
      setSuccess('Medicine batch added successfully.')
      setTimeout(() => {
        navigate(ROUTES.PHARMACY.INVENTORY)
      }, 800)
    } catch (err) {
      console.error('Failed to add medicine batch:', err)

      setError(
        err.response?.data?.detail ||
        'Failed to add medicine batch.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }
    const selectedMedicine = medicines.find(
      (medicine) => (medicine.id || medicine._id) === selectedMedicineId
    )
  return (
    <article
      aria-label="Add Medicine"
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to={ROUTES.PHARMACY.INVENTORY}
          aria-label="Back to inventory"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <HiOutlineArrowLeft size={16} />
        </Link>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Add Medicine
          </h1>

          <p className="text-xs text-slate-500">
            Add a medicine batch to your pharmacy inventory
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        {/* =====================================================
            Medicine Selection
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Select Medicine
          </p>

          <Select
            label="Medicine"
            required
            value={selectedMedicineId}
            onChange={(event) => setSelectedMedicineId(event.target.value)}
            disabled={isLoadingMedicines}
            options={medicines.map((medicine) => ({
              value: medicine.id || medicine._id,
              label: `${medicine.generic_name || 'Medicine'}${
                medicine.strength
                  ? ` - ${medicine.strength}`
                  : ''
              }${
                medicine.jan_aushadhi_name
                  ? ` (${medicine.jan_aushadhi_name})`
                  : ''
              }`,
            }))}
            placeholder={
              isLoadingMedicines
                ? 'Loading medicines...'
                : 'Select an existing medicine'
            }
          />

          {selectedMedicine && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    Generic Name
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedMedicine.generic_name || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Jan Aushadhi Name
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedMedicine.jan_aushadhi_name || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Composition
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedMedicine.composition || '—'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Manufacturer
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedMedicine.manufacturer || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            Batch Information
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Batch & Dates
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Batch Number"
              required
              name="batch_number"
              value={form.batch_number}
              onChange={handleChange}
              placeholder="e.g. PCM500-A001"
            />

            <Input
              label="Manufacturing Date"
              required
              type="date"
              name="manufacturing_date"
              value={form.manufacturing_date}
              onChange={handleChange}
            />

            <Input
              label="Expiry Date"
              required
              type="date"
              name="expiry_date"
              value={form.expiry_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* =====================================================
            Stock & Pricing
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Stock & Pricing
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Quantity Received"
              required
              type="number"
              min="1"
              name="quantity_received"
              value={form.quantity_received}
              onChange={handleChange}
              placeholder="100"
            />

            <Input
              label="Purchase Price (₹)"
              required
              type="number"
              min="0.01"
              step="0.01"
              name="purchase_price"
              value={form.purchase_price}
              onChange={handleChange}
              placeholder="12.50"
            />

            <Input
              label="MRP (₹)"
              required
              type="number"
              min="0.01"
              step="0.01"
              name="mrp"
              value={form.mrp}
              onChange={handleChange}
              placeholder="18.00"
            />
          </div>
        </div>

        {/* =====================================================
            Supplier Information
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Supplier Information
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              required
              name="supplier_name"
              value={form.supplier_name}
              onChange={handleChange}
              placeholder="ABC Pharma Distributors"
            />

            <Input
              label="Invoice Number"
              required
              name="invoice_number"
              value={form.invoice_number}
              onChange={handleChange}
              placeholder="INV-2026-001"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Link
            to={ROUTES.PHARMACY.INVENTORY}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            variant="secondary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Medicine'}
          </Button>
        </div>
      </form>
    </article>
  )
}

export default MedicineFormPage