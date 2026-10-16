  import { useEffect, useState } from 'react'
  import { useSearchParams } from 'react-router-dom'
  import PharmacySearchSummary from './sections/PharmacySearchSummary'
  import InteractiveMapSection from './sections/InteractiveMapSection'
  import NearbyPharmacyList from './sections/NearbyPharmacyList'
  import PharmacyDetailsPanel from './sections/PharmacyDetailsPanel'
  import ReservationSection from './sections/ReservationSection'
  import NavigationPreview from './sections/NavigationPreview'
  import PharmacyWorkflowTimeline from './sections/PharmacyWorkflowTimeline'
  import PharmacyTips from './sections/PharmacyTips'
  import medicineService from '../../services/medicineService'
  import HealthcareDisclaimer from '../medicine/sections/HealthcareDisclaimer'
  import Divider from '../../components/ui/Divider'
  function NearbyPharmaciesPage() {
    // =====================================================
    // URL PARAMETER
    // Expected URL:
    // /pharmacies/nearby?medicine_id=123
    // =====================================================
    const [searchParams] = useSearchParams()
    const medicineId = searchParams.get('medicine_id')
    // =====================================================
    // MEDICINE STATE
    // =====================================================
    const [medicine, setMedicine] = useState(null)
    const [medicineLoading, setMedicineLoading] =
      useState(false)
    const [medicineError, setMedicineError] =
      useState(false)
    // =====================================================
    // SELECTED PHARMACY
    // =====================================================
    const [selectedId, setSelectedId] =
      useState(null)

    // =====================================================
    // USER LOCATION
    // Filled by InteractiveMapSection
    // =====================================================

    const [userLocation, setUserLocation] =
      useState(null)

    // =====================================================
    // DEBUG - MEDICINE ID
    // Remove later if not needed
    // =====================================================

    useEffect(() => {
      console.log(
        'NearbyPharmaciesPage - Medicine ID:',
        medicineId
      )
    }, [medicineId])

    // =====================================================
    // FETCH MEDICINE
    // =====================================================

    useEffect(() => {
      // No medicine ID in URL
      if (!medicineId) {
        setMedicine(null)
        setMedicineLoading(false)
        setMedicineError(false)

        return
      }

      async function fetchMedicine() {
        try {
          setMedicineLoading(true)
          setMedicineError(false)

          console.log(
            'Fetching medicine:',
            medicineId
          )

          const response =
            await medicineService.getById(
              medicineId
            )

          console.log(
            'Nearby page medicine response:',
            response.data
          )

          setMedicine(response.data)
        } catch (error) {
          console.error(
            'Nearby Page Medicine Error:',
            error
          )
          setMedicine(null)
          setMedicineError(true)
        } finally {
          setMedicineLoading(false)
        }
      }
      fetchMedicine()
    }, [medicineId])

    // =====================================================
    // VIEW PHARMACY DETAILS
    // =====================================================

    function handleViewDetails(id) {
      setSelectedId(id)
    }

    // =====================================================
    // RESERVE MEDICINE
    // =====================================================

    function handleReserve(pharmacyId) {
      setSelectedId(pharmacyId)

      document
        .getElementById('reservation-section')
        ?.scrollIntoView({
          behavior: 'smooth',
        })
    }

    // =====================================================
    // NO MEDICINE ID
    // =====================================================

    if (!medicineId) {
      return (
        <article
          aria-label="Nearby Pharmacies"
          className="p-6"
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
            <h2 className="font-semibold text-amber-800">
              Medicine not selected
            </h2>

            <p className="mt-1 text-sm text-amber-700">
              Please select a medicine first and then
              open nearby pharmacies.
            </p>
          </div>
        </article>
      )
    }

    // =====================================================
    // MEDICINE LOADING
    // =====================================================

    if (medicineLoading) {
      return (
        <article
          aria-label="Nearby Pharmacies"
          className="p-6"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading medicine information...
            </p>
          </div>
        </article>
      )
    }

    // =====================================================
    // MEDICINE ERROR
    // =====================================================

    if (medicineError || !medicine) {
      return (
        <article
          aria-label="Nearby Pharmacies"
          className="p-6"
        >
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-800">
              Failed to load medicine information
            </h2>

            <p className="mt-1 text-sm text-red-700">
              The selected medicine could not be loaded.
              Please return to medicine search and try
              again.
            </p>
          </div>
        </article>
      )
    }

    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (
      <article
        aria-label="Nearby Pharmacies"
        className="flex flex-col gap-5"
      >
        {/* =====================================================
            PHARMACY SEARCH SUMMARY
          ===================================================== */}

          <PharmacySearchSummary
            medicine={medicine}
            pharmacyCount={0}
            userLocation={userLocation}
          />
        {/* =====================================================
            INTERACTIVE MAP

            IMPORTANT:
            Real medicineId is passed here.
          ===================================================== */}

        <InteractiveMapSection
          medicineId={medicineId}
          selectedPharmacyId={selectedId}
          onSelectPharmacy={setSelectedId}
          onLocationChange={setUserLocation}
        />

        <Divider className="my-0" />

        {/* =====================================================
            TWO COLUMN LAYOUT
          ===================================================== */}

        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* ===================================================
              LEFT COLUMN
            =================================================== */}
          <div className="flex flex-col gap-5">
            {/* =================================================
                NEARBY PHARMACIES
              ================================================= */}

            <NearbyPharmacyList
              selectedId={selectedId}
              onSelect={setSelectedId}
              onViewDetails={handleViewDetails}
              onReserve={handleReserve}
              userLocation={userLocation}
              medicineId={medicineId}
            />

            {/* =================================================
                RESERVATION
              ================================================= */}

            <div id="reservation-section">
              <ReservationSection
                pharmacyId={selectedId}
              />
            </div>

            {/* =================================================
                NAVIGATION PREVIEW
              ================================================= */}

            <NavigationPreview />

          </div>

          {/* ===================================================
              RIGHT COLUMN
            =================================================== */}

          <div className="lg:sticky lg:top-20 flex min-w-0 flex-col gap-5">

            {/* =================================================
                PHARMACY DETAILS
              ================================================= */}

            <PharmacyDetailsPanel
              pharmacyId={selectedId}
            />
            {/* =================================================
                PHARMACY WORKFLOW
              ================================================= */}

            <PharmacyWorkflowTimeline />
          </div>
        </div>
        <Divider className="my-0" />
        {/* =====================================================
            SMART PHARMACY TIPS
          ===================================================== */}
        <PharmacyTips />
        {/* =====================================================
            HEALTHCARE DISCLAIMER
          ===================================================== */}
        <HealthcareDisclaimer />
      </article>
    )
  }
  export default NearbyPharmaciesPage