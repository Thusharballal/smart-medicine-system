import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import medicineService from '../../services/medicineService'
import MedicineOverviewSection      from './sections/MedicineOverviewSection'
import PriceComparisonSection       from './sections/PriceComparisonSection'
import GenericRecommendationSection from './sections/GenericRecommendationSection'
import NearbyPharmacyPreview        from './sections/NearbyPharmacyPreview'
import MedicineInfoTabs             from './sections/MedicineInfoTabs'
import ActionPanel                  from './sections/ActionPanel'
import SimilarMedicinesSection      from './sections/SimilarMedicinesSection'
import HealthcareDisclaimer         from './sections/HealthcareDisclaimer'
import { HiOutlineArrowLeft }       from 'react-icons/hi2'
// =====================================================
// Placeholder medicine data
// TODO: Replace with useQuery(() => medicineService.getById(id))
// =====================================================
// =====================================================
// Medicine Details Page
// =====================================================
function MedicineDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const searchedBrand = searchParams.get('searched') || ''
    const [medicine, setMedicine] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    useEffect(() => {
        async function fetchMedicine() {
            try {
                setIsLoading(true)
                setIsError(false)
                 const response = await medicineService.getById(id)
                setMedicine(response.data)
            } catch (error) {
                console.error("Medicine Details Error:", error)
                setIsError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMedicine()
    }, [id])
    if (isLoading) {
    return (
        <div className="p-6 text-center text-slate-500">
            Loading medicine details...
        </div>
    )
}
if (isError || !medicine) {
    return (
        <div className="p-6 text-center text-red-600">
            Failed to load medicine details.
        </div>
    )
}
return (
  <article className="space-y-6 p-4 sm:p-6">

    {/* Back to Search */}
    <div>
    <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
    >
        <HiOutlineArrowLeft size={16} />
        Back to Search
    </button>
    </div>

    {/* Medicine Details */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
       <div>
      <GenericRecommendationSection
        generic={medicine}
        brandName={searchedBrand}
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
        Jan Aushadhi Equivalent
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">
        {medicine.jan_aushadhi_name || medicine.generic_name}
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        <span className="font-semibold">Generic:</span>{' '}
        {medicine.generic_name || '—'}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        <span className="font-semibold">Brand Names:</span>{' '}
        {(medicine.brand_names || []).join(', ') || '—'}
      </p>
    </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Composition</p>
          <p className="text-sm font-medium text-slate-900">
            {medicine.composition || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Strength</p>
          <p className="text-sm font-medium text-slate-900">
            {medicine.strength || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Dosage Form</p>
          <p className="text-sm font-medium text-slate-900">
            {medicine.dosage_form || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Manufacturer</p>
          <p className="text-sm font-medium text-slate-900">
            {medicine.manufacturer || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Category</p>
          <p className="text-sm font-medium text-slate-900">
            {medicine.category || '—'}
          </p>
        </div>
        <div>
            <p className="text-xs text-slate-500">Jan Aushadhi Price</p>
            <p className="text-sm font-medium text-slate-900">
                ₹{medicine.jan_aushadhi_price ?? '—'}
            </p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs text-slate-500">Brand Names</p>
        <p className="text-sm font-medium text-slate-900">
          {(medicine.brand_names || []).join(', ') || '—'}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-xs text-slate-500">Description</p>
        <p className="mt-1 text-sm text-slate-700">
          {medicine.description || 'No description available.'}
        </p>
      </div>
        <div className="mt-6">
        <PriceComparisonSection
          medicine={medicine}
        />
      </div>
    </div>
  </article>
)
}
export default MedicineDetailsPage
