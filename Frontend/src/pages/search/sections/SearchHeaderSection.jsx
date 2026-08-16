import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineClock,
} from 'react-icons/hi2'
import { MdMedication } from 'react-icons/md'

// =====================================================
// Background Illustration
// =====================================================

function SearchIllustration() {
  return (
    <div
      aria-hidden="true"
      className="
        absolute
        right-[-80px]
        sm:right-[-40px]
        lg:right-0
        top-1/2
        -translate-y-1/2
        w-[420px]
        sm:w-[520px]
        lg:w-[650px]
        aspect-[4/3]
        opacity-80
        pointer-events-none
      "
    >
      <svg
        viewBox="0 0 520 390"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* =====================================================
            Soft background circles
           ===================================================== */}

        <circle
          cx="390"
          cy="100"
          r="120"
          fill="#eff6ff"
          opacity="0.8"
        />

        <circle
          cx="455"
          cy="270"
          r="90"
          fill="#ecfeff"
          opacity="0.7"
        />

        {/* =====================================================
            Large search interface
           ===================================================== */}

        <rect
          x="110"
          y="130"
          width="330"
          height="65"
          rx="32"
          fill="white"
          stroke="#bfdbfe"
          strokeWidth="2"
        />

        {/* Search icon */}

        <circle
          cx="145"
          cy="162"
          r="15"
          fill="#eff6ff"
        />

        <circle
          cx="142"
          cy="159"
          r="7"
          stroke="#2563eb"
          strokeWidth="2"
        />

        <path
          d="M147 164L153 170"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Search text */}

        <rect
          x="175"
          y="151"
          width="125"
          height="6"
          rx="3"
          fill="#bfdbfe"
        />

        <rect
          x="175"
          y="164"
          width="80"
          height="5"
          rx="2.5"
          fill="#dbeafe"
        />

        {/* =====================================================
            Medicine result card 1
           ===================================================== */}

        <rect
          x="110"
          y="220"
          width="150"
          height="82"
          rx="16"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        <circle
          cx="137"
          cy="247"
          r="12"
          fill="#dbeafe"
        />

        <path
          d="M131 247H143M137 241V253"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <rect
          x="157"
          y="240"
          width="75"
          height="6"
          rx="3"
          fill="#bfdbfe"
        />

        <rect
          x="157"
          y="252"
          width="55"
          height="5"
          rx="2.5"
          fill="#e0e7ff"
        />

        <rect
          x="130"
          y="273"
          width="70"
          height="16"
          rx="8"
          fill="#dcfce7"
        />

        <rect
          x="137"
          y="278"
          width="56"
          height="5"
          rx="2.5"
          fill="#86efac"
        />

        {/* =====================================================
            Medicine result card 2
           ===================================================== */}

        <rect
          x="280"
          y="220"
          width="160"
          height="82"
          rx="16"
          fill="white"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />

        <circle
          cx="307"
          cy="247"
          r="12"
          fill="#ccfbf1"
        />

        <path
          d="M301 247H313M307 241V253"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <rect
          x="327"
          y="240"
          width="78"
          height="6"
          rx="3"
          fill="#99f6e4"
        />

        <rect
          x="327"
          y="252"
          width="60"
          height="5"
          rx="2.5"
          fill="#b2f5ea"
        />

        <rect
          x="300"
          y="273"
          width="75"
          height="16"
          rx="8"
          fill="#fef3c7"
        />

        <rect
          x="307"
          y="278"
          width="60"
          height="5"
          rx="2.5"
          fill="#fcd34d"
        />

        {/* =====================================================
            Floating medicine capsules
           ===================================================== */}

        <ellipse
          cx="400"
          cy="55"
          rx="35"
          ry="15"
          fill="#dbeafe"
          stroke="#93c5fd"
          strokeWidth="2"
        />

        <line
          x1="400"
          y1="40"
          x2="400"
          y2="70"
          stroke="#93c5fd"
          strokeWidth="2"
        />

        <ellipse
          cx="90"
          cy="75"
          rx="30"
          ry="13"
          fill="#ccfbf1"
          stroke="#5eead4"
          strokeWidth="2"
        />

        <line
          x1="90"
          y1="62"
          x2="90"
          y2="88"
          stroke="#5eead4"
          strokeWidth="2"
        />

        {/* =====================================================
            Floating dots
           ===================================================== */}

        <circle
          cx="460"
          cy="100"
          r="6"
          fill="#dbeafe"
        />

        <circle
          cx="480"
          cy="120"
          r="4"
          fill="#bfdbfe"
        />

        <circle
          cx="70"
          cy="120"
          r="5"
          fill="#ccfbf1"
        />

        <circle
          cx="50"
          cy="145"
          r="3"
          fill="#99f6e4"
        />
      </svg>
    </div>
  )
}

// =====================================================
// Trust / capability badges
// =====================================================

const TRUST_BADGES = [
  {
    icon: HiOutlineSparkles,
    text: 'Intelligent Recommendations',
  },
  {
    icon: HiOutlineShieldCheck,
    text: 'Quality Assured Generics',
  },
  {
    icon: HiOutlineClock,
    text: 'Real-Time Availability',
  },
]

// =====================================================
// Search Header / Hero Section
// =====================================================

function SearchHeaderSection() {
  return (
    <section
      aria-labelledby="search-page-heading"
      className="
        relative
        overflow-hidden
        min-h-[340px]
        sm:min-h-[390px]
        lg:min-h-[420px]
        rounded-2xl
        border
        border-slate-200
        bg-gradient-to-br
        from-primary-50
        via-white
        to-secondary-50
        shadow-sm
      "
    >

      {/* =====================================================
          Dot-grid background
         ===================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          bg-[radial-gradient(#cbd5e1_1px,transparent_1px)]
          [background-size:26px_26px]
          opacity-30
          pointer-events-none
        "
      />

      {/* =====================================================
          Top-right soft glow
         ===================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          -top-32
          -right-32
          w-96
          h-96
          rounded-full
          bg-primary-100/60
          blur-3xl
          pointer-events-none
        "
      />

      {/* =====================================================
          Bottom-left soft glow
         ===================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          -bottom-32
          -left-20
          w-80
          h-80
          rounded-full
          bg-secondary-100/50
          blur-3xl
          pointer-events-none
        "
      />

      {/* =====================================================
          BACKGROUND ILLUSTRATION
          
          This is now behind the hero content.
         ===================================================== */}

      <div
        className="
          absolute
          inset-0
          pointer-events-none
          opacity-70
        "
        aria-hidden="true"
      >
        <SearchIllustration />
      </div>

      {/* =====================================================
          CONTENT OVER THE BACKGROUND
         ===================================================== */}

      <div
        className="
          relative
          z-10
          min-h-[340px]
          sm:min-h-[390px]
          lg:min-h-[420px]
          flex
          items-center
          px-5
          sm:px-8
          lg:px-12
          py-12
        "
      >

        {/* ===================================================
            Content panel
           =================================================== */}

        <div
          className="
            w-full
            max-w-2xl
            p-5
            sm:p-7
            lg:p-8
            rounded-2xl
            bg-white/80
            backdrop-blur-md
            border
            border-white/70
            shadow-lg
          "
        >

          {/* =================================================
              Eyebrow
             ================================================= */}

          <div
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-primary-50
              border
              border-primary-200
              w-fit
            "
          >
            <MdMedication
              size={14}
              className="text-primary-600"
              aria-hidden="true"
            />

            <span
              className="
                text-xs
                font-semibold
                text-primary-700
                tracking-wide
                uppercase
              "
            >
              Smart Medicine Search
            </span>
          </div>

          {/* =================================================
              Main heading
             ================================================= */}

          <h1
            id="search-page-heading"
            className="
              mt-4
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-extrabold
              text-slate-900
              leading-tight
              tracking-tight
            "
          >
            Find Medicines{' '}
            <span className="text-primary-600">
              Faster
            </span>{' '}
            &amp;{' '}
            <span className="text-secondary-600">
              Smarter
            </span>
          </h1>

          {/* =================================================
              Description
             ================================================= */}

          <p
            className="
              mt-4
              text-sm
              sm:text-base
              text-slate-600
              leading-relaxed
              max-w-xl
            "
          >
            Search branded medicines, discover PM Jan Aushadhi
            alternatives, compare prices and locate nearby
            pharmacies using intelligent healthcare technology.
          </p>

          {/* =================================================
              Trust badges
             ================================================= */}

          <div
            className="
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              mt-5
              pt-4
              border-t
              border-slate-200/80
            "
          >
            {TRUST_BADGES.map(
              ({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    text-slate-600
                  "
                >
                  <Icon
                    size={14}
                    className="
                      text-primary-600
                      shrink-0
                    "
                    aria-hidden="true"
                  />

                  <span>{text}</span>
                </div>
              )
            )}
          </div>

        </div>
      </div>

    </section>
  )
}
export default SearchHeaderSection