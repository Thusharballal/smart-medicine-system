import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  HiOutlineMagnifyingGlass,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'

import { MdMedication } from 'react-icons/md'

import VoiceSearchModal from '../../../components/common/VoiceSearchModal'
import OcrScanModal from '../../../components/common/OcrScanModal'
import NearbyPharmacyModal from '../../../components/common/NearbyPharmacyModal'
import { ROUTES } from '../../../constants/routes'

// ─────────────────────────────────────────────────────────────────────────────
// Popular searches
// ─────────────────────────────────────────────────────────────────────────────

const POPULAR_SEARCHES = [
  'Paracetamol',
  'Crocin',
  'Dolo 650',
  'Azithromycin',
  'Cetirizine',
  'Vitamin D3',
]

// ─────────────────────────────────────────────────────────────────────────────
// Search method cards
// ─────────────────────────────────────────────────────────────────────────────

const SEARCH_CARDS = [
  {
    id: 'text',
    emoji: '🔍',
    label: 'Text Search',
    description:
      'Search medicines by brand name, generic name or composition.',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-700',
    border: 'border-primary-200',
    hover: 'hover:border-primary-400 hover:bg-primary-50',
    buttonClass: 'bg-primary-600 hover:bg-primary-700',
    buttonLabel: 'Search Medicines',
  },
  {
    id: 'voice',
    emoji: '🎤',
    label: 'Voice Search',
    description:
      'Speak the medicine name for quick and hands-free searching.',
    iconBg: 'bg-secondary-100',
    iconColor: 'text-secondary-700',
    border: 'border-secondary-200',
    hover: 'hover:border-secondary-400 hover:bg-secondary-50',
    buttonClass: 'bg-secondary-600 hover:bg-secondary-700',
    buttonLabel: 'Start Voice Search',
  },
  {
    id: 'ocr',
    emoji: '📷',
    label: 'Scan Prescription',
    description:
      'Upload a prescription image and detect medicines automatically.',
    iconBg: 'bg-accent-100',
    iconColor: 'text-accent-700',
    border: 'border-accent-200',
    hover: 'hover:border-accent-400 hover:bg-accent-50',
    buttonClass: 'bg-accent-600 hover:bg-accent-700',
    buttonLabel: 'Scan Prescription',
  },
  {
    id: 'nearby',
    emoji: '📍',
    label: 'Nearby Pharmacy',
    description:
      'Find Jan Aushadhi Kendras and pharmacies near your location.',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-700',
    border: 'border-success-200',
    hover: 'hover:border-success-400 hover:bg-success-50',
    buttonClass: 'bg-success-600 hover:bg-success-700',
    buttonLabel: 'Find Nearby Pharmacy',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hero illustration
// ─────────────────────────────────────────────────────────────────────────────

function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="
        relative
        w-full
        max-w-lg
        mx-auto
        aspect-[4/3]
        rounded-2xl
        bg-gradient-to-br
        from-primary-50
        to-secondary-50
        border
        border-primary-100
        flex
        items-center
        justify-center
        overflow-hidden
        shadow-lg
      "
    >
      <svg
        viewBox="0 0 400 300"
        className="w-3/4 h-3/4 opacity-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Medicine tablet */}
        <ellipse
          cx="80"
          cy="220"
          rx="50"
          ry="22"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="2"
        />

        <ellipse
          cx="80"
          cy="220"
          rx="25"
          ry="22"
          fill="#bfdbfe"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />

        {/* Second tablet */}
        <ellipse
          cx="320"
          cy="80"
          rx="42"
          ry="18"
          fill="#ccfbf1"
          stroke="#5eead4"
          strokeWidth="2"
        />

        <ellipse
          cx="320"
          cy="80"
          rx="21"
          ry="18"
          fill="#99f6e4"
          stroke="#5eead4"
          strokeWidth="1.5"
        />

        {/* Medicine box */}
        <rect
          x="145"
          y="50"
          width="110"
          height="200"
          rx="16"
          fill="white"
          stroke="#bfdbfe"
          strokeWidth="2.5"
        />

        <rect
          x="155"
          y="70"
          width="90"
          height="130"
          rx="6"
          fill="#eff6ff"
        />

        <rect
          x="163"
          y="82"
          width="55"
          height="8"
          rx="3"
          fill="#93c5fd"
        />

        <rect
          x="163"
          y="96"
          width="74"
          height="5"
          rx="2.5"
          fill="#bfdbfe"
        />

        <rect
          x="163"
          y="107"
          width="60"
          height="5"
          rx="2.5"
          fill="#bfdbfe"
        />

        {/* Medical cross */}
        <circle
          cx="200"
          cy="145"
          r="20"
          fill="#dbeafe"
        />

        <path
          d="M193 145h14M200 138v14"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Status bar */}
        <rect
          x="163"
          y="174"
          width="74"
          height="14"
          rx="7"
          fill="#f0fdfa"
          stroke="#5eead4"
          strokeWidth="1.5"
        />

        <circle
          cx="172"
          cy="181"
          r="3.5"
          stroke="#0d9488"
          strokeWidth="1.5"
        />

        {/* Pharmacy card */}
        <rect
          x="270"
          y="155"
          width="90"
          height="36"
          rx="10"
          fill="white"
          stroke="#bbf7d0"
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
        />

        <circle
          cx="287"
          cy="173"
          r="8"
          fill="#dcfce7"
        />

        <path
          d="M284 173h6M287 170v6"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <rect
          x="299"
          y="167"
          width="52"
          height="5"
          rx="2"
          fill="#bbf7d0"
        />

        <rect
          x="299"
          y="176"
          width="38"
          height="4"
          rx="2"
          fill="#d1fae5"
        />

        {/* Location card */}
        <rect
          x="38"
          y="100"
          width="80"
          height="36"
          rx="10"
          fill="white"
          stroke="#bfdbfe"
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 8px rgba(0,0,0,0.08))"
        />

        <circle
          cx="55"
          cy="118"
          r="8"
          fill="#dbeafe"
        />

        <path
          d="M55 113a5 5 0 0 1 5 5c0 3.5-5 7.5-5 7.5S50 121.5 50 118a5 5 0 0 1 5-5z"
          fill="#3b82f6"
        />

        <circle
          cx="55"
          cy="118"
          r="2"
          fill="white"
        />

        <rect
          x="67"
          y="112"
          width="42"
          height="5"
          rx="2"
          fill="#bfdbfe"
        />

        <rect
          x="67"
          y="121"
          width="30"
          height="4"
          rx="2"
          fill="#dbeafe"
        />

        {/* Decorative dots */}
        {[40, 60, 80, 100, 120].map((y, index) => (
          <circle
            key={`right-${index}`}
            cx="380"
            cy={y + 20}
            r="3"
            fill="#e0e7ff"
            opacity="0.7"
          />
        ))}

        {[20, 40, 60, 80].map((x, index) => (
          <circle
            key={`bottom-${index}`}
            cx={x}
            cy="280"
            r="2.5"
            fill="#ccfbf1"
            opacity="0.8"
          />
        ))}
      </svg>

      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <MdMedication
          size={16}
          className="text-primary-600"
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Trust indicators
// ─────────────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: HiOutlineShieldCheck,
    text: 'Verified Generic Medicines',
  },
  {
    icon: MdMedication,
    text: 'Jan Aushadhi Network',
  },
  {
    icon: HiOutlineMapPin,
    text: 'Real-Time Pharmacy Locator',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [query, setQuery] = useState('')
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [ocrOpen, setOcrOpen] = useState(false)
  const [nearbyOpen, setNearbyOpen] = useState(false)

  const navigate = useNavigate()

  // ─────────────────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      return
    }

    navigate(
      `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(trimmed)}`
    )
  }, [query, navigate])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Popular search
  // ─────────────────────────────────────────────────────────────────────────

  const handlePopular = useCallback(
    (term) => {
      setQuery(term)

      navigate(
        `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(term)}`
      )
    },
    [navigate]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Voice search
  // ─────────────────────────────────────────────────────────────────────────

  const handleVoiceResult = useCallback(
    (text) => {
      const trimmed = text?.trim()

      if (!trimmed) {
        return
      }

      setQuery(trimmed)

      navigate(
        `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(trimmed)}`
      )
    },
    [navigate]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // OCR
  // ─────────────────────────────────────────────────────────────────────────

  const handleOcrDetected = useCallback(
    (medicines) => {
      if (!Array.isArray(medicines) || medicines.length === 0) {
        return
      }

      const medicine = medicines[0]?.trim()

      if (!medicine) {
        return
      }

      setQuery(medicine)

      navigate(
        `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(medicine)}`
      )
    },
    [navigate]
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Search method cards
  // ─────────────────────────────────────────────────────────────────────────

  const handleCardAction = useCallback((action) => {
    if (action === 'text') {
      document
        .getElementById('hero-search-input')
        ?.focus()

      return
    }

    if (action === 'voice') {
      setVoiceOpen(true)
      return
    }

    if (action === 'ocr') {
      setOcrOpen(true)
      return
    }

    if (action === 'nearby') {
      setNearbyOpen(true)
    }
  }, [])

  return (
    <section
      aria-labelledby="hero-heading"
      className="
        relative
        overflow-hidden
        bg-white
        dark:bg-slate-900
        pt-8
        pb-12
        sm:pt-10
        sm:pb-16
        lg:pt-14
        lg:pb-20
      "
    >
      {/* ================================================================
          Background
         ================================================================ */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]
          [background-size:28px_28px]
          opacity-60
          pointer-events-none
        "
      />

      <div className="container-app relative">

        {/* ================================================================
            HERO INTRODUCTION
           ================================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* ── Left column ─────────────────────────────────────────── */}

          <div className="flex flex-col gap-5">

            {/* PM Jan Aushadhi badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 w-fit">
              <span
                className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"
                aria-hidden="true"
              />

              <span className="text-xs font-semibold text-primary-700 tracking-wide uppercase">
                PM Jan Aushadhi Initiative
              </span>
            </div>

            {/* Government branding */}
            <div
              className="
                inline-flex
                items-center
                gap-3
                px-4
                py-2.5
                rounded-xl
                bg-gradient-to-r
                from-orange-50
                to-green-50
                border
                border-orange-200/60
                w-fit
                shadow-sm
              "
              aria-label="Supported by Pradhan Mantri Bhartiya Janaushadhi Pariyojana"
            >
              <div
                className="flex flex-col gap-0.5 shrink-0"
                aria-hidden="true"
              >
                <span className="block w-5 h-1 rounded-full bg-orange-500" />
                <span className="block w-5 h-1 rounded-full bg-white border border-slate-200" />
                <span className="block w-5 h-1 rounded-full bg-green-600" />
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Government of India
                </span>

                <span className="text-xs font-bold text-slate-800">
                  PM Bhartiya Janaushadhi Pariyojana
                </span>

                <span className="text-[10px] text-slate-400">
                  Dept. of Pharmaceuticals · MoC&amp;F
                </span>
              </div>
            </div>

            {/* Main heading */}
            <h1
              id="hero-heading"
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-extrabold
                text-slate-900
                dark:text-slate-50
                leading-tight
                tracking-tight
              "
            >
              Smart Medicine{' '}
              <span className="text-primary-600">
                Availability
              </span>
              {' '}&amp;{' '}
              <span className="text-secondary-600">
                Intelligent
              </span>{' '}
              Janaushadhi Recommendation
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Discover affordable medicines, compare generic
              alternatives, locate nearby Jan Aushadhi pharmacies,
              and promote awareness of government healthcare
              initiatives — all in one platform.
            </p>

            {/* ==========================================================
                PROMINENT SEARCH
               ========================================================== */}

            <div
              className="
                mt-2
                rounded-2xl
                bg-white
                dark:bg-slate-800
                border
                border-slate-200
                dark:border-slate-700
                shadow-lg
                p-3
              "
            >
              <div className="mb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  🔍 Search Medicines
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Search by brand, generic or Jan Aushadhi medicine name.
                </p>
              </div>

              <div
                className="
                  flex
                  gap-2
                  p-1.5
                  bg-slate-50
                  dark:bg-slate-900
                  rounded-xl
                  ring-1
                  ring-slate-200
                  dark:ring-slate-700
                  focus-within:ring-2
                  focus-within:ring-primary-400
                  transition-all
                "
              >
                <div className="relative flex-1 min-w-0">
                  <HiOutlineMagnifyingGlass
                    size={21}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      pointer-events-none
                    "
                    aria-hidden="true"
                  />

                  <input
                    id="hero-search-input"
                    type="search"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    placeholder="Search medicine..."
                    aria-label="Search medicines by brand, generic or Jan Aushadhi name"
                    className="
                      w-full
                      h-12
                      pl-11
                      pr-3
                      text-sm
                      font-medium
                      border-0
                      bg-transparent
                      focus:outline-none
                      text-gray-900
                      dark:text-white
                      caret-gray-900
                      dark:caret-white
                      placeholder:text-slate-400
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  aria-label="Search medicines"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    h-12
                    px-5
                    rounded-lg
                    bg-primary-600
                    text-white
                    text-sm
                    font-bold
                    hover:bg-primary-700
                    active:scale-95
                    transition-all
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary-500
                    shrink-0
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  <HiOutlineMagnifyingGlass
                    size={19}
                    aria-hidden="true"
                  />

                  <span>Search</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                💡 Brand searches can show generic and Jan Aushadhi
                alternatives.
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-3 pt-2">
              {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  <Icon
                    size={14}
                    className="text-primary-500 shrink-0"
                    aria-hidden="true"
                  />

                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────────── */}

          <div className="hidden lg:flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>

        {/* ================================================================
            POPULAR SEARCHES
           ================================================================ */}

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Popular:
            </span>

            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handlePopular(term)}
                aria-label={`Search for ${term}`}
                className="
                  text-xs
                  px-3.5
                  py-1.5
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  hover:border-primary-400
                  hover:text-primary-700
                  hover:bg-primary-50
                  transition-all
                  duration-150
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary-500
                  shadow-sm
                  font-medium
                "
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* ================================================================
            SEARCH METHODS
           ================================================================ */}

        <div className="mt-10">

          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              More Ways to Find Medicines
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Choose the search method that works best for you.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
              max-w-4xl
              mx-auto
            "
            role="list"
            aria-label="Search method options"
          >
            {SEARCH_CARDS.map((card) => (
              <div
                key={card.id}
                role="listitem"
              >
                <div
                  className={[
                    'flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-white border-2 h-full',
                    'shadow-sm hover:shadow-lg hover:-translate-y-1',
                    'transition-all duration-200',
                    card.border,
                    card.hover,
                  ].join(' ')}
                >
                  {/* Icon + title */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        flex
                        items-center
                        justify-center
                        w-14
                        h-14
                        rounded-2xl
                        ${card.iconBg}
                        shrink-0
                        shadow-sm
                      `}
                    >
                      <span
                        className="text-2xl"
                        role="img"
                        aria-hidden="true"
                      >
                        {card.emoji}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`
                          text-base
                          font-extrabold
                          ${card.iconColor}
                          leading-tight
                        `}
                      >
                        {card.label}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wide">
                        {card.id === 'text' &&
                          'Medicine Search'}

                        {card.id === 'voice' &&
                          'Speech Recognition'}

                        {card.id === 'ocr' &&
                          'OCR Detection'}

                        {card.id === 'nearby' &&
                          'Location Services'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed flex-1">
                    {card.description}
                  </p>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() =>
                      handleCardAction(card.id)
                    }
                    aria-label={card.buttonLabel}
                    className={[
                      'w-full flex items-center justify-center gap-2',
                      'py-3 px-5 rounded-xl text-sm font-bold',
                      'text-white',
                      'transition-all duration-150 active:scale-95',
                      'focus-visible:outline-none focus-visible:ring-2',
                      card.buttonClass,
                    ].join(' ')}
                  >
                    <span
                      className="text-base"
                      aria-hidden="true"
                    >
                      {card.emoji}
                    </span>

                    {card.buttonLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================
          VOICE SEARCH MODAL
         ================================================================ */}

      <VoiceSearchModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onResult={handleVoiceResult}
      />

      {/* ================================================================
          OCR MODAL
         ================================================================ */}

      <OcrScanModal
        isOpen={ocrOpen}
        onClose={() => setOcrOpen(false)}
        onDetected={handleOcrDetected}
      />

      {/* ================================================================
          NEARBY PHARMACY MODAL
         ================================================================ */}

      <NearbyPharmacyModal
        isOpen={nearbyOpen}
        onClose={() => setNearbyOpen(false)}
      />
    </section>
  )
}

export default HeroSection