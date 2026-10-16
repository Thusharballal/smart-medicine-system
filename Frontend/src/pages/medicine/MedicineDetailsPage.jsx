import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import medicineService from '../../services/medicineService'
import pharmacyService from '../../services/pharmacyService'
import MedicineOverviewSection from './sections/MedicineOverviewSection'
import PriceComparisonSection from './sections/PriceComparisonSection'
import GenericRecommendationSection from './sections/GenericRecommendationSection'
import NearbyPharmacyPreview from './sections/NearbyPharmacyPreview'
import MedicineInfoTabs from './sections/MedicineInfoTabs'
import ActionPanel from './sections/ActionPanel'
import SimilarMedicinesSection from './sections/SimilarMedicinesSection'
import HealthcareDisclaimer from './sections/HealthcareDisclaimer'
import { HiOutlineArrowLeft } from 'react-icons/hi2'

function MedicineDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const searchedBrand = searchParams.get('searched') || ''

  // =====================================================
  // MEDICINE STATE
  // =====================================================

  const [medicine, setMedicine] = useState(null)

  const [nearbyPharmacies, setNearbyPharmacies] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const [isLoadingPharmacies, setIsLoadingPharmacies] =
    useState(false)

  const [isError, setIsError] = useState(false)

  const [pharmacyError, setPharmacyError] = useState(false)

  // =====================================================
  // IMPORTANT
  // Get medicine ID from either:
  //     medicine.id
  // OR
  //     medicine._id
  //
  // This same ID is used everywhere.
  // =====================================================

  const medicineId = medicine?.id || medicine?._id

  // =====================================================
  // FETCH MEDICINE DETAILS
  // =====================================================

  useEffect(() => {
    async function fetchMedicine() {
      try {
        setIsLoading(true)
        setIsError(false)

        const response = await medicineService.getById(id)

        console.log(
          '========================================'
        )
        console.log(
          'GET MEDICINE RESPONSE:',
          response.data
        )
        console.log(
          'GET MEDICINE ID:',
          response.data?.id
        )
        console.log(
          'GET MEDICINE _ID:',
          response.data?._id
        )
        console.log(
          '========================================'
        )

        setMedicine(response.data)
      } catch (error) {
        console.error(
          'Medicine Details Error:',
          error
        )

        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedicine()
  }, [id])

  // =====================================================
  // FIND NEARBY PHARMACIES
  // =====================================================

  useEffect(() => {
    // ---------------------------------------------------
    // IMPORTANT:
    // Do not continue until medicine ID exists.
    // ---------------------------------------------------

    if (!medicineId) {
      return
    }

    // ---------------------------------------------------
    // Check browser geolocation support
    // ---------------------------------------------------

    if (!navigator.geolocation) {
      console.error(
        'Geolocation is not supported by this browser.'
      )

      setPharmacyError(true)

      return
    }

    // ---------------------------------------------------
    // Get user's current location
    // ---------------------------------------------------

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setIsLoadingPharmacies(true)
          setPharmacyError(false)

          const latitude =
            position.coords.latitude

          const longitude =
            position.coords.longitude

          console.log(
            '========================================'
          )

          console.log(
            'SEARCHING NEARBY PHARMACIES'
          )

          console.log(
            'Medicine ID:',
            medicineId
          )

          console.log(
            'Latitude:',
            latitude
          )

          console.log(
            'Longitude:',
            longitude
          )

          console.log(
            '========================================'
          )

          // ------------------------------------------------
          // Call backend
          // ------------------------------------------------

          const response =
            await pharmacyService.getNearby({
              medicine_id: medicineId,
              latitude,
              longitude,
            })

          console.log(
            'Nearby pharmacy response:',
            response.data
          )

          setNearbyPharmacies(
            response.data || []
          )
        } catch (error) {
          console.error(
            'Nearby Pharmacy Error:',
            error
          )

          setPharmacyError(true)

          setNearbyPharmacies([])
        } finally {
          setIsLoadingPharmacies(false)
        }
      },

      (error) => {
        console.error(
          'Location Error:',
          error
        )

        setPharmacyError(true)

        setIsLoadingPharmacies(false)
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    )
  }, [medicineId])

  // =====================================================
  // MEDICINE LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading medicine details...
      </div>
    )
  }

  // =====================================================
  // MEDICINE ERROR
  // =====================================================

  if (isError || !medicine) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load medicine details.
      </div>
    )
  }

  // =====================================================
  // DEBUG
  // =====================================================

  console.log(
    'Medicine object:',
    medicine
  )

  console.log(
    'Medicine ID:',
    medicineId
  )

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <article className="space-y-6 p-4 sm:p-6">

      {/* =====================================================
          BACK TO SEARCH
      ===================================================== */}

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

      {/* =====================================================
          MEDICINE DETAILS CARD
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        {/* =====================================================
            MEDICINE HEADER
        ===================================================== */}

        <div>

          <GenericRecommendationSection
            generic={medicine}
            brandName={searchedBrand}
          />

          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Jan Aushadhi Equivalent
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {medicine.jan_aushadhi_name ||
              medicine.generic_name}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            <span className="font-semibold">
              Generic:
            </span>{' '}

            {medicine.generic_name || '—'}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">
              Brand Names:
            </span>{' '}

            {(medicine.brand_names || [])
              .join(', ') || '—'}
          </p>

        </div>

        {/* =====================================================
            MEDICINE INFORMATION
        ===================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Composition */}

          <div>
            <p className="text-xs text-slate-500">
              Composition
            </p>

            <p className="text-sm font-medium text-slate-900">
              {medicine.composition || '—'}
            </p>
          </div>

          {/* Strength */}

          <div>
            <p className="text-xs text-slate-500">
              Strength
            </p>

            <p className="text-sm font-medium text-slate-900">
              {medicine.strength || '—'}
            </p>
          </div>

          {/* Dosage Form */}

          <div>
            <p className="text-xs text-slate-500">
              Dosage Form
            </p>

            <p className="text-sm font-medium text-slate-900">
              {medicine.dosage_form || '—'}
            </p>
          </div>

          {/* Manufacturer */}

          <div>
            <p className="text-xs text-slate-500">
              Manufacturer
            </p>

            <p className="text-sm font-medium text-slate-900">
              {medicine.manufacturer || '—'}
            </p>
          </div>

          {/* Category */}

          <div>
            <p className="text-xs text-slate-500">
              Category
            </p>

            <p className="text-sm font-medium text-slate-900">
              {medicine.category || '—'}
            </p>
          </div>

          {/* Jan Aushadhi Price */}

          <div>
            <p className="text-xs text-slate-500">
              Jan Aushadhi Price
            </p>

            <p className="text-sm font-medium text-slate-900">
              ₹
              {medicine.jan_aushadhi_price ?? '—'}
            </p>
          </div>

        </div>

        {/* =====================================================
            BRAND NAMES
        ===================================================== */}

        <div className="mt-6">

          <p className="text-xs text-slate-500">
            Brand Names
          </p>

          <p className="text-sm font-medium text-slate-900">
            {(medicine.brand_names || [])
              .join(', ') || '—'}
          </p>

        </div>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <div className="mt-6">

          <p className="text-xs text-slate-500">
            Description
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {medicine.description ||
              'No description available.'}
          </p>

        </div>

        {/* =====================================================
            PRICE COMPARISON
        ===================================================== */}

        <div className="mt-6">

          <PriceComparisonSection
            medicine={medicine}
          />

        </div>

        {/* =====================================================
            NEARBY PHARMACY
        ===================================================== */}

        <div className="mt-6">

          {isLoadingPharmacies ? (

            <div className="rounded-xl border border-slate-200 p-6 text-center text-slate-500">

              Finding nearby pharmacies...

            </div>

          ) : pharmacyError ? (

            <div className="rounded-xl border border-slate-200 p-6 text-center text-slate-500">

              Unable to get your location
              or nearby pharmacies.

              <p className="mt-1 text-xs">
                Please allow location access
                and try again.
              </p>

            </div>

          ) : (

            <NearbyPharmacyPreview
              pharmacies={nearbyPharmacies}
              medicineId={medicineId}
            />

          )}

        </div>

      </div>

    </article>
  )
}

export default MedicineDetailsPage