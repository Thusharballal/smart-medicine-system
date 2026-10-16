import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

import L from 'leaflet'

import 'leaflet/dist/leaflet.css'

import {
  MdLocalPharmacy,
  MdMic,
  MdMicOff,
} from 'react-icons/md'


// ============================================================
// FALLBACK LOCATION
// ============================================================

const FALLBACK_LOCATION = {
  lat: 12.9716,
  lng: 77.5946,
}


// ============================================================
// SEARCH RADII
// ============================================================

const RADIUS_STEPS = [
  0.5,
  1,
  2,
  5,
  10,
]


// ============================================================
// BACKEND API
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000'


// ============================================================
// NOMINATIM
// ============================================================

const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org/search'


// ============================================================
// PHARMACY MARKER
// ============================================================

const pharmacyIcon = L.divIcon({
  className: 'jan-aushadhi-marker',

  html: `
    <div
      style="
        width:42px;
        height:42px;
        border-radius:50%;
        background:#2563eb;
        border:3px solid white;
        box-shadow:0 3px 10px rgba(0,0,0,.30);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:21px;
      "
    >
      🏪
    </div>
  `,

  iconSize: [42, 42],

  iconAnchor: [21, 42],

  popupAnchor: [0, -42],
})


// ============================================================
// USER LOCATION MARKER
// ============================================================

const userIcon = L.divIcon({
  className: 'user-location-marker',

  html: `
    <div
      style="
        width:20px;
        height:20px;
        border-radius:50%;
        background:#dc2626;
        border:4px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,.35);
      "
    ></div>
  `,

  iconSize: [20, 20],

  iconAnchor: [10, 10],
})


// ============================================================
// MAP CENTER CONTROLLER
// ============================================================

function MapCenterController({
  location,
  zoom = 14,
}) {
  const map = useMap()

  useEffect(() => {
    if (!location) {
      return
    }

    map.flyTo(
      [
        location.lat,
        location.lng,
      ],
      zoom,
      {
        animate: true,
        duration: 1,
      }
    )
  }, [
    location,
    zoom,
    map,
  ])

  return null
}


// ============================================================
// DISTANCE CALCULATION
// ============================================================

function calculateDistanceKm(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const earthRadius = 6371

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadius * c
}


// ============================================================
// FORMAT DISTANCE
// ============================================================

function formatDistance(
  distanceKm
) {
  const value =
    Number(distanceKm)

  if (!Number.isFinite(value)) {
    return 'Distance unavailable'
  }

  if (value < 1) {
    return `${Math.round(
      value * 1000
    )} m`
  }

  return `${value.toFixed(2)} km`
}


// ============================================================
// LOCATION SEARCH
// ============================================================

async function searchLocation(
  query
) {
  const trimmed =
    query.trim()

  if (trimmed.length < 2) {
    return []
  }

  const params =
    new URLSearchParams({
      format: 'jsonv2',
      q: trimmed,
      limit: '5',
      addressdetails: '1',
      countrycodes: 'in',
    })

  const response =
    await fetch(
      `${NOMINATIM_URL}?${params.toString()}`,
      {
        headers: {
          Accept:
            'application/json',
        },
      }
    )

  if (!response.ok) {
    throw new Error(
      'Location search failed.'
    )
  }

  const data =
    await response.json()

  return data
    .map((item) => ({
      displayName:
        item.display_name,

      lat: Number(
        item.lat
      ),

      lng: Number(
        item.lon
      ),

      type: item.type,
    }))
    .filter(
      (item) =>
        Number.isFinite(
          item.lat
        ) &&
        Number.isFinite(
          item.lng
        )
    )
}


// ============================================================
// NORMALIZE BACKEND PHARMACY
// ============================================================

function normalizeBackendPharmacy(
  pharmacy,
  searchLocation
) {
  const latitude =
    Number(
      pharmacy.latitude
    )

  const longitude =
    Number(
      pharmacy.longitude
    )

  if (
    !Number.isFinite(
      latitude
    ) ||
    !Number.isFinite(
      longitude
    )
  ) {
    return null
  }

  // ==========================================================
  // USE BACKEND DISTANCE
  // ==========================================================

  const backendDistance =
    Number(
      pharmacy.distance_km
    )

  // ==========================================================
  // FALLBACK DISTANCE
  // ==========================================================

  const distanceKm =
    Number.isFinite(
      backendDistance
    )
      ? backendDistance
      : calculateDistanceKm(
          searchLocation.lat,
          searchLocation.lng,
          latitude,
          longitude
        )

  return {
    id: `backend-${pharmacy.pharmacy_id}`,

    pharmacy_id:
      pharmacy.pharmacy_id,

    name:
      pharmacy.pharmacy_name ||
      'Jan Aushadhi Kendra',

    address:
      [
        pharmacy.address,
        pharmacy.city,
        pharmacy.state,
        pharmacy.pin_code,
      ]
        .filter(Boolean)
        .join(', ') ||
      'Address not available',

    city:
      pharmacy.city || '',

    state:
      pharmacy.state || '',

    pin_code:
      pharmacy.pin_code || '',

    latitude,

    longitude,

    // ========================================================
    // DISTANCE
    // ========================================================

    distance_km:
      distanceKm,

    phone:
      pharmacy.phone_number || '',

    available_quantity:
      Number(
        pharmacy.available_quantity || 0
      ),

    mrp:
      Number(
        pharmacy.mrp || 0
      ),

    stock_status:
      pharmacy.stock_status ||
      'In Stock',

    isJanAushadhi: true,

    source: 'backend',
  }
}


// ============================================================
// SEARCH PHARMACIES FROM BACKEND
// ============================================================

async function searchBackendPharmacies(
  medicineId,
  latitude,
  longitude
) {
  if (!medicineId) {
    return []
  }

  const params =
    new URLSearchParams({
      medicine_id:
        String(medicineId),

      latitude:
        String(latitude),

      longitude:
        String(longitude),
    })

  const url =
    `${API_BASE_URL}/api/v1/pharmacies/nearby?${params.toString()}`

  console.log(
    'Searching nearby pharmacies:',
    url
  )

  const response =
    await fetch(
      url,
      {
        method: 'GET',

        headers: {
          Accept:
            'application/json',
        },
      }
    )

  if (!response.ok) {
    let message =
      'Unable to search nearby pharmacies.'

    try {
      const data =
        await response.json()

      if (
        data?.detail
      ) {
        message =
          typeof data.detail ===
          'string'
            ? data.detail
            : message
      }
    } catch {
      // Ignore
    }

    throw new Error(
      message
    )
  }

  const data =
    await response.json()

  if (
    !Array.isArray(data)
  ) {
    return []
  }

  return data
    .map(
      (pharmacy) =>
        normalizeBackendPharmacy(
          pharmacy,
          {
            lat: latitude,
            lng: longitude,
          }
        )
    )
    .filter(Boolean)
}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

function getSpeechRecognition() {
  if (
    typeof window ===
    'undefined'
  ) {
    return null
  }

  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    null
  )
}


// ============================================================
// MAIN COMPONENT
// ============================================================

function InteractiveMapSection({
  medicineId,
  selectedPharmacyId,
  onSelectPharmacy,
  onLocationChange,
}) {

  // ==========================================================
  // LOCATION
  // ==========================================================

  const [location, setLocation] =
    useState(null)


  // ==========================================================
  // PHARMACIES
  // ==========================================================

  const [pharmacies, setPharmacies] =
    useState([])

  const [
    selectedPharmacy,
    setSelectedPharmacy,
  ] = useState(null)


  // ==========================================================
  // SEARCH
  // ==========================================================

  const [searchText, setSearchText] =
    useState('')

  const [suggestions, setSuggestions] =
    useState([])

  const [
    suggestionLoading,
    setSuggestionLoading,
  ] = useState(false)


  // ==========================================================
  // VOICE SEARCH
  // ==========================================================

  const [isListening, setIsListening] =
    useState(false)

  const [
    voiceSupported,
    setVoiceSupported,
  ] = useState(true)

  const [
    voiceError,
    setVoiceError,
  ] = useState('')


  // ==========================================================
  // LOADING
  // ==========================================================

  const [loading, setLoading] =
    useState(false)

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(true)


  // ==========================================================
  // RADIUS
  // ==========================================================

  const [
    currentRadius,
    setCurrentRadius,
  ] = useState(null)


  // ==========================================================
  // ERROR
  // ==========================================================

  const [error, setError] =
    useState('')


  // ==========================================================
  // REFS
  // ==========================================================

  const searchTimeoutRef =
    useRef(null)

  const recognitionRef =
    useRef(null)

  const voiceSearchTriggeredRef =
    useRef(false)

  const requestIdRef =
    useRef(0)


  // ==========================================================
  // CHECK SPEECH SUPPORT
  // ==========================================================

  useEffect(() => {
    const Recognition =
      getSpeechRecognition()

    setVoiceSupported(
      Boolean(Recognition)
    )

    return () => {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore
        }
      }
    }
  }, [])


  // ==========================================================
  // SEND LOCATION TO PARENT
  // ==========================================================

  useEffect(() => {
    if (
      location &&
      onLocationChange
    ) {
      onLocationChange(
        location
      )
    }
  }, [
    location,
    onLocationChange,
  ])


  // ==========================================================
  // FIND NEARBY PHARMACIES
  // ==========================================================

  const findNearbyPharmacies =
    useCallback(
      async (
        targetLocation
      ) => {

        const currentRequestId =
          ++requestIdRef.current

        setLoading(true)

        setError('')

        setPharmacies([])

        setSelectedPharmacy(
          null
        )

        setCurrentRadius(
          null
        )

        try {

          if (!medicineId) {
            setError(
              'Medicine ID is missing. Please open this page from a medicine search.'
            )

            return
          }

          const results =
            await searchBackendPharmacies(
              medicineId,
              targetLocation.lat,
              targetLocation.lng
            )

          if (
            currentRequestId !==
            requestIdRef.current
          ) {
            return
          }

          // ==================================================
          // ONLY SHOW WITHIN 10 KM
          // ==================================================

          const withinTenKm =
            results.filter(
              (pharmacy) =>
                pharmacy.distance_km <=
                10
            )

          // ==================================================
          // DETERMINE RADIUS
          // ==================================================

          let foundRadius =
            null

          for (
            const radius of RADIUS_STEPS
          ) {

            const found =
              withinTenKm.some(
                (pharmacy) =>
                  pharmacy.distance_km <=
                  radius
              )

            if (found) {
              foundRadius =
                radius

              break
            }
          }

          // ==================================================
          // NO PHARMACY
          // ==================================================

          if (
            withinTenKm.length ===
            0
          ) {

            setPharmacies([])

            setSelectedPharmacy(
              null
            )

            setCurrentRadius(
              10
            )

            setError('')

            return
          }

          // ==================================================
          // REMOVE DUPLICATES
          // ==================================================

          const unique =
            Array.from(
              new Map(
                withinTenKm.map(
                  (item) => [
                    item.pharmacy_id ||
                      item.id,
                    item,
                  ]
                )
              ).values()
            )

          // ==================================================
          // SORT NEAREST FIRST
          // ==================================================

          unique.sort(
            (a, b) =>
              a.distance_km -
              b.distance_km
          )

          setPharmacies(
            unique
          )

          setCurrentRadius(
            foundRadius || 10
          )

          // ==================================================
          // SELECT NEAREST
          // ==================================================

          const nearest =
            unique[0]

          setSelectedPharmacy(
            nearest
          )

          if (
            onSelectPharmacy
          ) {
            onSelectPharmacy(
              nearest.pharmacy_id
            )
          }

        } catch (err) {

          if (
            currentRequestId !==
            requestIdRef.current
          ) {
            return
          }

          console.error(
            'Nearby pharmacy search error:',
            err
          )

          setPharmacies([])

          setSelectedPharmacy(
            null
          )

          setError(
            err?.message ||
              'Unable to find nearby pharmacies.'
          )

        } finally {

          if (
            currentRequestId ===
            requestIdRef.current
          ) {
            setLoading(false)
          }
        }
      },
      [
        medicineId,
        onSelectPharmacy,
      ]
    )


  // ==========================================================
  // USE CURRENT LOCATION
  // ==========================================================

  const useCurrentLocation =
    useCallback(
      () => {

        if (
          !navigator.geolocation
        ) {

          setLocation(
            FALLBACK_LOCATION
          )

          setLocationLoading(
            false
          )

          setError(
            'Geolocation is not supported by this browser. Using the default location.'
          )

          findNearbyPharmacies(
            FALLBACK_LOCATION
          )

          return
        }

        setLocationLoading(
          true
        )

        setError('')

        navigator.geolocation.getCurrentPosition(

          (position) => {

            const newLocation =
              {
                lat:
                  position.coords
                    .latitude,

                lng:
                  position.coords
                    .longitude,
              }

            setLocation(
              newLocation
            )

            setSearchText(
              'Current location'
            )

            setSuggestions([])

            setVoiceError('')

            setLocationLoading(
              false
            )

            findNearbyPharmacies(
              newLocation
            )
          },

          (geoError) => {

            console.error(
              'Geolocation error:',
              geoError
            )

            setLocationLoading(
              false
            )

            setLocation(
              FALLBACK_LOCATION
            )

            if (
              geoError.code ===
              geoError.PERMISSION_DENIED
            ) {

              setError(
                'Location permission was denied. Using the default location.'
              )

            } else if (
              geoError.code ===
              geoError.TIMEOUT
            ) {

              setError(
                'Location request timed out. Using the default location.'
              )

            } else {

              setError(
                'Unable to get your current location. Using the default location.'
              )
            }

            findNearbyPharmacies(
              FALLBACK_LOCATION
            )
          },

          {
            enableHighAccuracy:
              true,

            timeout:
              15000,

            maximumAge:
              300000,
          }
        )
      },
      [
        findNearbyPharmacies,
      ]
    )


  // ==========================================================
  // STOP VOICE SEARCH
  // ==========================================================

  const stopVoiceSearch =
    useCallback(() => {

      if (
        recognitionRef.current
      ) {

        try {
          recognitionRef.current.stop()
        } catch {
          // Ignore
        }
      }

      recognitionRef.current =
        null

      setIsListening(
        false
      )

    }, [])


  // ==========================================================
  // START VOICE SEARCH
  // ==========================================================

  const startVoiceSearch =
    useCallback(() => {

      const Recognition =
        getSpeechRecognition()

      if (!Recognition) {

        setVoiceSupported(
          false
        )

        setVoiceError(
          'Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
        )

        return
      }

      if (
        recognitionRef.current
      ) {

        stopVoiceSearch()

        return
      }

      setVoiceError('')

      setError('')

      const recognition =
        new Recognition()

      recognition.continuous =
        false

      recognition.interimResults =
        true

      recognition.maxAlternatives =
        1

      recognition.lang =
        'en-IN'

      recognition.onstart =
        () => {

          setIsListening(
            true
          )

          setVoiceError('')
        }

      recognition.onresult =
        (event) => {

          let transcript =
            ''

          for (
            let i =
              event.resultIndex;
            i <
            event.results.length;
            i++
          ) {

            transcript +=
              event.results[i][0]
                .transcript
          }

          transcript =
            transcript.trim()

          if (!transcript) {
            return
          }

          const result =
            event.results[
              event.resultIndex
            ]

          const isFinal =
            result?.isFinal

          setSearchText(
            transcript
          )

          if (isFinal) {

            voiceSearchTriggeredRef.current =
              true

            setSuggestions([])
          }
        }

      recognition.onerror =
        (event) => {

          console.error(
            'Speech recognition error:',
            event.error
          )

          setIsListening(
            false
          )

          recognitionRef.current =
            null

          if (
            event.error ===
            'not-allowed'
          ) {

            setVoiceError(
              'Microphone permission was denied. Please allow microphone access in your browser.'
            )

          } else if (
            event.error ===
            'no-speech'
          ) {

            setVoiceError(
              'No speech was detected. Please try again.'
            )

          } else if (
            event.error ===
            'audio-capture'
          ) {

            setVoiceError(
              'No microphone was detected. Please check your microphone.'
            )

          } else {

            setVoiceError(
              'Voice search could not be completed. Please try again.'
            )
          }
        }

      recognition.onend =
        () => {

          setIsListening(
            false
          )

          recognitionRef.current =
            null
        }

      recognitionRef.current =
        recognition

      try {

        recognition.start()

      } catch (err) {

        console.error(
          'Unable to start speech recognition:',
          err
        )

        recognitionRef.current =
          null

        setIsListening(
          false
        )

        setVoiceError(
          'Unable to start voice search. Please try again.'
        )
      }

    }, [
      stopVoiceSearch,
    ])


  // ==========================================================
  // LOCATION AUTOCOMPLETE
  // ==========================================================

  useEffect(() => {

    const query =
      searchText.trim()

    if (
      query.length < 2 ||
      query ===
        'Current location'
    ) {

      setSuggestions([])

      setSuggestionLoading(
        false
      )

      return
    }

    if (
      searchTimeoutRef.current
    ) {

      clearTimeout(
        searchTimeoutRef.current
      )
    }

    searchTimeoutRef.current =
      setTimeout(
        async () => {

          setSuggestionLoading(
            true
          )

          try {

            const results =
              await searchLocation(
                query
              )

            setSuggestions(
              results
            )

            if (
              voiceSearchTriggeredRef.current &&
              results.length >
                0
            ) {

              voiceSearchTriggeredRef.current =
                false

              selectLocation(
                results[0]
              )
            }

          } catch (err) {

            console.error(
              'Location autocomplete error:',
              err
            )

            setSuggestions([])

            if (
              voiceSearchTriggeredRef.current
            ) {

              voiceSearchTriggeredRef.current =
                false

              setVoiceError(
                'I could not find that location. Please try saying the city, area, landmark, or PIN code again.'
              )
            }

          } finally {

            setSuggestionLoading(
              false
            )
          }

        },
        500
      )

    return () => {

      if (
        searchTimeoutRef.current
      ) {

        clearTimeout(
          searchTimeoutRef.current
        )
      }
    }

  }, [
    searchText,
  ])


  // ==========================================================
  // SELECT LOCATION
  // ==========================================================

  const selectLocation =
    useCallback(
      (item) => {

        const newLocation =
          {
            lat: item.lat,
            lng: item.lng,
          }

        setLocation(
          newLocation
        )

        setSearchText(
          item.displayName
        )

        setSuggestions([])

        voiceSearchTriggeredRef.current =
          false

        setVoiceError('')

        findNearbyPharmacies(
          newLocation
        )
      },
      [
        findNearbyPharmacies,
      ]
    )


  // ==========================================================
  // SELECT PHARMACY
  // ==========================================================

  const handleSelectPharmacy =
    (pharmacy) => {

      setSelectedPharmacy(
        pharmacy
      )

      if (
        onSelectPharmacy
      ) {

        onSelectPharmacy(
          pharmacy.pharmacy_id ||
            pharmacy.id
        )
      }
    }


  // ==========================================================
  // INITIAL LOCATION
  // ==========================================================

  useEffect(() => {

    if (!medicineId) {

      setLocationLoading(
        false
      )

      setError(
        'Medicine ID is missing. Please open this page from a medicine search.'
      )

      return
    }

    useCurrentLocation()

  }, [
    medicineId,
    useCurrentLocation,
  ])


  // ==========================================================
  // KEEP SELECTED PHARMACY IN SYNC
  // ==========================================================

  useEffect(() => {

    if (
      !selectedPharmacyId
    ) {
      return
    }

    const pharmacy =
      pharmacies.find(
        (item) =>
          String(
            item.pharmacy_id ||
              item.id
          ) ===
          String(
            selectedPharmacyId
          )
      )

    if (pharmacy) {

      setSelectedPharmacy(
        pharmacy
      )
    }

  }, [
    selectedPharmacyId,
    pharmacies,
  ])


  // ==========================================================
  // LOCATION LOADING
  // ==========================================================

  if (
    locationLoading &&
    !location
  ) {

    return (
      <section className="w-full">

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex min-h-[550px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

              <h3 className="text-sm font-semibold text-slate-800">
                Getting your current location...
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Please allow location access
                when your browser asks.
              </p>

            </div>

          </div>

        </div>

      </section>
    )
  }


  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <section className="w-full">

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-slate-200 p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <MdLocalPharmacy
                  size={24}
                  className="text-blue-600"
                  aria-hidden="true"
                />

                <h2 className="text-lg font-bold text-slate-900">
                  Nearby Jan Aushadhi Kendras
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Find Jan Aushadhi Kendras
                near your selected
                location.
              </p>

            </div>


            {/* CURRENT LOCATION */}

            <button
              type="button"
              onClick={
                useCurrentLocation
              }
              disabled={
                locationLoading
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition-colors
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {locationLoading
                ? 'Getting location...'
                : '📍 Use My Location'}
            </button>

          </div>


          {/* SEARCH */}

          <div className="relative mt-4">

            <div className="relative">

              <input
                type="text"
                value={
                  searchText
                }
                onChange={(
                  event
                ) => {

                  setSearchText(
                    event.target.value
                  )

                  voiceSearchTriggeredRef.current =
                    false

                  setVoiceError('')
                }}
                placeholder="Search city, area, landmark or PIN code..."
                autoComplete="off"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-3
                  pr-14
                  text-sm
                  text-slate-900
                  outline-none
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />


              {/* VOICE BUTTON */}

              <button
                type="button"
                onClick={
                  isListening
                    ? stopVoiceSearch
                    : startVoiceSearch
                }
                disabled={
                  !voiceSupported ||
                  suggestionLoading
                }
                aria-label={
                  isListening
                    ? 'Stop voice search'
                    : 'Start voice search'
                }
                title={
                  !voiceSupported
                    ? 'Voice search is not supported in this browser'
                    : isListening
                      ? 'Stop listening'
                      : 'Search by voice'
                }
                className={`
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-10
                  w-10
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }
                `}
              >

                {isListening ? (

                  <MdMicOff
                    size={22}
                    aria-hidden="true"
                  />

                ) : (

                  <MdMic
                    size={22}
                    aria-hidden="true"
                  />

                )}

              </button>

            </div>


            {/* LISTENING */}

            {isListening && (

              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">

                <span className="relative flex h-2.5 w-2.5">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>

                </span>

                Listening... speak your
                location

              </div>
            )}


            {/* VOICE ERROR */}

            {voiceError && (

              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {voiceError}
              </div>

            )}
            {/* AUTOCOMPLETE */}
            {(suggestions.length >
              0 ||
              suggestionLoading) && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  z-[2000]
                  mt-1
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-xl
                "
              >
                {suggestionLoading && (
                  <div className="px-4 py-3 text-sm text-slate-500">
                    Searching locations...
                  </div>
                )}
                {!suggestionLoading &&
                  suggestions.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={`${item.lat}-${item.lng}-${index}`}
                        type="button"
                        onClick={() =>
                          selectLocation(
                            item
                          )
                        }
                        className="
                          flex
                          w-full
                          items-start
                          gap-3
                          border-b
                          border-slate-100
                          px-4
                          py-3
                          text-left
                          transition-colors
                          last:border-b-0
                          hover:bg-slate-50
                        "
                      >
                        <span className="mt-0.5 text-blue-600">
                          📍
                        </span>
                        <span className="text-sm text-slate-700">
                          {
                            item.displayName
                          }
                        </span>
                      </button>
                    )
                  )}
              </div>
            )}
          </div>
        </div>
        {/* ====================================================
            STATUS
        ==================================================== */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {loading && (
              <span className="text-sm font-medium text-blue-600">
                Searching Jan Aushadhi
                Kendras...
              </span>

            )}
            {!loading &&
              pharmacies.length >
                0 && (
                <>
                  <span className="text-sm font-medium text-slate-700">
                    {pharmacies.length}{' '}
                    Jan Aushadhi
                    {pharmacies.length !==
                    1
                      ? ' Kendras'
                      : ' Kendra'}{' '}
                    found
                  </span>
                  {currentRadius && (
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      Within{' '}
                      {
                        currentRadius
                      }{' '}
                      km
                    </span>
                  )}
                </>
              )}
          </div>
        </div>
        {/* ====================================================
            ERROR
        ==================================================== */}
        {error && (
          <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              {error}
            </p>
          </div>
        )}
        {/* ====================================================
            MAP
        ==================================================== */}
        <div className="relative h-[550px] w-full">
          {location && (
            <MapContainer
              center={[
                location.lat,
                location.lng,
              ]}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenterController
                location={
                  location
                }
                zoom={14}
              />
              {/* ==================================================
                  USER LOCATION
              ================================================== */}
              <Marker
                position={[
                  location.lat,
                  location.lng,
                ]}
                icon={userIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>
                      Your Current Location
                    </strong>
                    <div className="mt-1 text-xs text-slate-500">
                      {location.lat.toFixed(
                        6
                      )}
                      ,{' '}
                      {location.lng.toFixed(
                        6
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
              {/* ==================================================
                  PHARMACY MARKERS
              ================================================== */}
              {pharmacies.map(
                (pharmacy) => (
                  <Marker
                    key={
                      pharmacy.id
                    }
                    position={[
                      pharmacy.latitude,
                      pharmacy.longitude,
                    ]}
                    icon={
                      pharmacyIcon
                    }
                    eventHandlers={{
                      click: () =>
                        handleSelectPharmacy(
                          pharmacy
                        ),
                    }}
                  >
                    {/* ==================================================
                        PHARMACY POPUP
                    ================================================== */}
                    <Popup>
                      <div className="min-w-[240px]">
                        {/* PHARMACY NAME */}
                        <div className="flex items-start gap-2">
                          <MdLocalPharmacy
                            size={20}
                            className="mt-0.5 shrink-0 text-blue-600"
                          />
                          <h3 className="font-bold text-slate-900">
                            {
                              pharmacy.name
                            }
                          </h3>
                        </div>
                        {/* DISTANCE */}
                        <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2">
                          <p className="text-xs font-semibold text-blue-700">
                            📍 Distance from your location
                          </p>
                          <p className="mt-0.5 text-base font-bold text-blue-800">
                            {formatDistance(
                              pharmacy.distance_km
                            )}
                          </p>
                        </div>
                        {/* ADDRESS */}
                        <p className="mt-2 text-xs text-slate-600">
                          {
                            pharmacy.address
                          }
                        </p>
                        {/* STOCK */}
                        <p className="mt-2 text-xs font-semibold text-green-600">
                          💊{' '}
                          {
                            pharmacy.stock_status
                          }
                        </p>
                        {/* QUANTITY */}
                        <p className="mt-1 text-xs text-slate-600">
                          Available:{' '}
                          {
                            pharmacy.available_quantity
                          }
                        </p>
                        {/* MRP */}
                        {pharmacy.mrp >
                          0 && (
                          <p className="mt-1 text-xs text-slate-600">
                            MRP: ₹
                            {
                              pharmacy.mrp
                            }
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              )}
            </MapContainer>
          )}
          {/* ====================================================
              LOADING OVERLAY
          ==================================================== */}
          {loading && (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
              <div className="rounded-xl bg-white/95 px-5 py-4 text-center shadow-lg">
                <div className="text-sm font-semibold text-slate-800">
                  Finding Jan Aushadhi
                  Kendras
                </div>
                {currentRadius && (
                  <div className="mt-1 text-xs text-slate-500">
                    Searching within{' '}
                    {
                      currentRadius
                    }{' '}
                    km...
                  </div>

                )}
              </div>
            </div>
          )}
        </div>
        {/* ====================================================
            NEAREST STORE
        ==================================================== */}
        {selectedPharmacy && (
          <div className="border-t border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <MdLocalPharmacy
                  size={22}
                  className="text-blue-600"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Nearest Jan Aushadhi
                  Kendra
                </p>
                <h3 className="mt-0.5 font-bold text-slate-900">
                  {
                    selectedPharmacy.name
                  }
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {
                    selectedPharmacy.address
                  }
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  {/* DISTANCE */}
                  <span className="font-semibold text-blue-600">
                    📍{' '}
                    {formatDistance(
                      selectedPharmacy.distance_km
                    )}
                    {' '}away
                  </span>
                  {/* STOCK */}
                  <span className="font-semibold text-green-600">
                    💊{' '}
                    {
                      selectedPharmacy.stock_status
                    }
                  </span>
                  {/* QUANTITY */}
                  <span className="text-slate-600">
                    Available:{' '}
                    {
                      selectedPharmacy.available_quantity
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ====================================================
            STORE LIST
        ==================================================== */}
        {pharmacies.length >
          0 && (
          <div className="border-t border-slate-200">
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900">
                  Nearby Jan Aushadhi
                  Kendras
                </h3>
                <span className="text-xs text-slate-500">
                  Nearest first
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {pharmacies.map(
                  (
                    pharmacy,
                    index
                  ) => (
                    <button
                      key={
                        pharmacy.id
                      }
                      type="button"
                      onClick={() =>
                        handleSelectPharmacy(
                          pharmacy
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        p-4
                        text-left
                        transition-colors
                        ${
                          (
                            selectedPharmacy?.pharmacy_id ||
                            selectedPharmacy?.id
                          ) ===
                          (
                            pharmacy.pharmacy_id ||
                            pharmacy.id
                          )
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                          {
                            index +
                            1
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {
                                pharmacy.name
                              }
                            </h4>
                            {/* DISTANCE */}
                            <span className="whitespace-nowrap text-xs font-bold text-blue-600">
                              📍{' '}
                              {formatDistance(
                                pharmacy.distance_km
                              )}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {
                              pharmacy.address
                            }
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-green-600">
                              {
                                pharmacy.stock_status
                              }
                            </span>
                            <span className="text-xs text-slate-500">
                              Available:{' '}
                              {
                                pharmacy.available_quantity
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {/* ====================================================
            DATA SOURCE NOTE
        ==================================================== */}
        <div className="border-t border-slate-200 px-5 py-3">
          <p className="text-xs leading-relaxed text-slate-400">
            Store locations are loaded from
            approved pharmacies registered
            in the system. Pharmacies are
            shown when the requested medicine
            is currently available in stock.
          </p>
        </div>
      </div>
    </section>
  )
}
export default InteractiveMapSection