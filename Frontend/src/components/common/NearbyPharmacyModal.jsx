import { useState, useCallback } from 'react'
import {
  HiOutlineXMark,
  HiOutlineMapPin,
  HiOutlineBuildingStorefront,
  HiOutlineClock,
  HiOutlineArrowTopRightOnSquare,
} from 'react-icons/hi2'
import { MdLocalPharmacy } from 'react-icons/md'

function NearbyPharmacyModal({
  isOpen,
  onClose,
  medicineId,
}) {
  const [phase, setPhase] = useState('form')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [pin, setPin] = useState('')

  const [pharmacies, setPharmacies] = useState([])
  const [error, setError] = useState('')

  // ============================================================
  // Reset modal
  // ============================================================

  function resetAndClose() {
    setPhase('form')
    setCity('')
    setArea('')
    setPin('')
    setPharmacies([])
    setError('')

    onClose?.()
  }

  // ============================================================
  // Call Nearby Pharmacy API
  // ============================================================

  const fetchNearbyPharmacies = async (
    latitude,
    longitude
  ) => {
    try {
      setError('')
      setPhase('locating')

      if (!medicineId) {
        throw new Error(
          'Medicine ID is missing. Please select a medicine first.'
        )
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/pharmacies/nearby?medicine_id=${encodeURIComponent(
          medicineId
        )}&latitude=${encodeURIComponent(
          latitude
        )}&longitude=${encodeURIComponent(
          longitude
        )}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            'Unable to find nearby pharmacies.'
        )
      }

      setPharmacies(data)
      setPhase('results')
    } catch (error) {
      console.error(
        'Nearby pharmacy error:',
        error
      )

      setError(
        error.message ||
          'Unable to find nearby pharmacies.'
      )

      setPhase('form')
    }
  }

  // ============================================================
  // Detect User Location
  // ============================================================

  const handleDetectLocation = useCallback(() => {
    setError('')

    if (!navigator.geolocation) {
      setError(
        'Geolocation is not supported by your browser.'
      )
      return
    }

    setPhase('locating')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords

        console.log(
          'User latitude:',
          latitude
        )

        console.log(
          'User longitude:',
          longitude
        )

        fetchNearbyPharmacies(
          latitude,
          longitude
        )
      },
      (error) => {
        console.error(
          'Location error:',
          error
        )

        let message =
          'Unable to detect your location.'

        if (error.code === 1) {
          message =
            'Location permission was denied. Please allow location access and try again.'
        } else if (error.code === 2) {
          message =
            'Your location could not be determined.'
        } else if (error.code === 3) {
          message =
            'Location request timed out. Please try again.'
        }

        setError(message)
        setPhase('form')
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      }
    )
  }, [medicineId])

  // ============================================================
  // Manual Search
  // ============================================================

  const handleSearch = useCallback(() => {
    setError('')

    /*
      Your current backend nearby API requires:

      medicine_id
      latitude
      longitude

      It does NOT currently accept:

      city
      area
      pin

      Therefore, manual city/area/PIN search cannot directly
      call the current nearby API.

      For now, ask the browser for location.
    */

    setError(
      'Manual city/area/PIN search is not connected to the backend yet. Please use "Detect My Location".'
    )
  }, [])

  // ============================================================
  // Do not render when closed
  // ============================================================

  if (!isOpen) {
    return null
  }

  // ============================================================
  // Render
  // ============================================================

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nearby-modal-title"
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
    >
      {/* ======================================================
          Backdrop
      ======================================================= */}

      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={resetAndClose}
        aria-hidden="true"
      />

      {/* ======================================================
          Modal
      ======================================================= */}

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">

        {/* ====================================================
            Close Button
        ===================================================== */}

        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close nearby pharmacy search"
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <HiOutlineXMark
            size={18}
            aria-hidden="true"
          />
        </button>

        {/* ====================================================
            Title
        ===================================================== */}

        <div>
          <h2
            id="nearby-modal-title"
            className="text-base font-bold text-slate-900 flex items-center gap-2"
          >
            <HiOutlineMapPin
              size={18}
              className="text-primary-600"
              aria-hidden="true"
            />

            Find Nearby Pharmacy
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            Find pharmacies that have this medicine
            in stock near you
          </p>
        </div>

        {/* ====================================================
            Error Message
        ===================================================== */}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ====================================================
            FORM
        ===================================================== */}

        {phase === 'form' && (
          <>
            {/* Medicine ID status */}

            {!medicineId && (
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-xs font-medium text-yellow-700">
                  Please select a medicine before
                  searching for nearby pharmacies.
                </p>
              </div>
            )}

            {/* Detect Location */}

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={!medicineId}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <HiOutlineMapPin
                size={16}
                aria-hidden="true"
              />

              Allow Location Access — Detect My Location
            </button>

            {/* OR */}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />

              <span className="text-xs text-slate-400 font-medium">
                OR
              </span>

              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Manual Search */}

            <div className="flex flex-col gap-3">

              {/* City */}

              <div>
                <label
                  htmlFor="city-input"
                  className="text-xs font-semibold text-slate-700 mb-1 block"
                >
                  Search City
                </label>

                <input
                  id="city-input"
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="Enter city name"
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              {/* Area */}

              <div>
                <label
                  htmlFor="area-input"
                  className="text-xs font-semibold text-slate-700 mb-1 block"
                >
                  Search Area
                </label>

                <input
                  id="area-input"
                  type="text"
                  value={area}
                  onChange={(e) =>
                    setArea(e.target.value)
                  }
                  placeholder="Enter locality or area"
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              {/* PIN */}

              <div>
                <label
                  htmlFor="pin-input"
                  className="text-xs font-semibold text-slate-700 mb-1 block"
                >
                  Search PIN Code
                </label>

                <input
                  id="pin-input"
                  type="text"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value.replace(
                        /\D/g,
                        ''
                      )
                    )
                  }
                  placeholder="Enter 6-digit PIN code"
                  maxLength={6}
                  className="w-full h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>
            </div>

            {/* Manual Search Button */}

            <button
              type="button"
              onClick={handleSearch}
              className="w-full py-3 rounded-xl bg-secondary-600 text-white text-sm font-bold hover:bg-secondary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
            >
              Find Pharmacies
            </button>
          </>
        )}

        {/* ====================================================
            LOCATING
        ===================================================== */}

        {phase === 'locating' && (
          <div className="flex flex-col items-center gap-4 py-8">

            <div
              className="w-14 h-14 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"
              aria-hidden="true"
            />

            <div className="text-center">
              <p className="text-sm font-bold text-slate-900">
                Finding nearby pharmacies…
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Checking real-time medicine stock
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            RESULTS
        ===================================================== */}

        {phase === 'results' && (
          <>
            {/* Result count */}

            <p className="text-xs font-semibold text-slate-700">
              {pharmacies.length}{' '}
              {pharmacies.length === 1
                ? 'pharmacy'
                : 'pharmacies'}{' '}
              found near you
            </p>

            {/* No Results */}

            {pharmacies.length === 0 && (
              <div className="flex flex-col items-center text-center py-8">

                <HiOutlineBuildingStorefront
                  size={40}
                  className="text-slate-300"
                />

                <p className="text-sm font-bold text-slate-700 mt-3">
                  No pharmacies found
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  No approved pharmacy currently has
                  this medicine in stock near your
                  location.
                </p>
              </div>
            )}

            {/* Pharmacy Results */}

            <div className="space-y-3">

              {pharmacies.map(
                (pharmacy) => (
                  <div
                    key={pharmacy.pharmacy_id}
                    className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                  >

                    {/* Pharmacy Information */}

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-primary-100">
                        <MdLocalPharmacy
                          size={20}
                          className="text-primary-600"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">

                        {/* Name */}

                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {pharmacy.pharmacy_name}
                        </p>

                        {/* Address */}

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {pharmacy.address}
                        </p>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">

                          {/* Distance */}

                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <HiOutlineMapPin
                              size={11}
                              aria-hidden="true"
                            />

                            {pharmacy.distance_km} km
                          </span>

                          {/* Stock */}

                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              pharmacy.stock_status ===
                              'Low Stock'
                                ? 'text-yellow-700 bg-yellow-100'
                                : 'text-green-700 bg-green-100'
                            }`}
                          >
                            {pharmacy.stock_status}
                          </span>

                        </div>

                        {/* Quantity */}

                        <p className="text-xs text-slate-600 mt-1">
                          Available:{' '}
                          <span className="font-bold">
                            {pharmacy.available_quantity}
                          </span>
                        </p>

                      </div>
                    </div>

                    {/* Price */}

                    <div className="text-right shrink-0">

                      <p className="text-sm font-bold text-slate-900">
                        ₹{pharmacy.mrp}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        MRP
                      </p>

                    </div>

                  </div>
                )
              )}

            </div>

            {/* Buttons */}

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() => {
                  setPhase('form')
                  setPharmacies([])
                  setError('')
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                New Search
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Done
              </button>

            </div>
          </>
        )}

        {/* ====================================================
            Footer
        ===================================================== */}

        <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3">
          📍 Pharmacy distance and stock are retrieved
          from the backend.
        </p>

      </div>
    </div>
  )
}
export default NearbyPharmacyModal