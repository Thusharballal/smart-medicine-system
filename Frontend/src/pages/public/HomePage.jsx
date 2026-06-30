import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RiSearchLine,
  RiMapPinLine,
  RiMicLine,
  RiUpload2Line,
  RiLeafLine,
  RiMedicineBottleLine,
  RiExchangeLine,
  RiBellLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiCheckLine,
  RiStarFill,
  RiArrowDownSLine,
  RiUserLine,
  RiHospitalLine,
  RiMoneyDollarCircleLine,
  RiHeartPulseLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiExternalLinkLine,
} from 'react-icons/ri'
import Button from '../../components/common/Button'

/* ─────────────────────────────────────────────────────────────────────
   Static mock data
   ───────────────────────────────────────────────────────────────────── */

const POPULAR_SEARCHES = [
  'Paracetamol', 'Metformin', 'Atorvastatin', 'Omeprazole',
  'Amoxicillin', 'Amlodipine', 'Azithromycin', 'Cetirizine',
]

const FEATURES = [
  {
    icon: RiSearchLine,
    color: 'primary',
    title: 'Medicine Search',
    description:
      'Search across 10,000+ medicines by name or generic composition. Get instant results with autocomplete.',
  },
  {
    icon: RiLeafLine,
    color: 'accent',
    title: 'Generic Recommendation',
    description:
      'Intelligent matching of branded medicines to cheaper Jan Aushadhi generics with savings badges.',
  },
  {
    icon: RiExchangeLine,
    color: 'primary',
    title: 'Price Comparison',
    description:
      'Side-by-side MRP vs Jan Aushadhi price comparison. See exact rupee savings and percentages instantly.',
  },
  {
    icon: RiMapPinLine,
    color: 'accent',
    title: 'Nearby Pharmacy',
    description:
      'Interactive Leaflet map to find Jan Aushadhi stores within 1–25 km of your location.',
  },
  {
    icon: RiBellLine,
    color: 'warning',
    title: 'Price Drop Alerts',
    description:
      'Get in-app notifications when prices drop or stock becomes available for your watchlist medicines.',
  },
  {
    icon: RiFileTextLine,
    color: 'primary',
    title: 'OCR Prescription Scan',
    description:
      'Upload your prescription and let our OCR engine extract medicine names automatically (coming soon).',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: RiSearchLine,
    title: 'Search Medicine',
    description: 'Type the medicine name or generic composition in the search bar.',
  },
  {
    step: '02',
    icon: RiExchangeLine,
    title: 'Compare Prices',
    description: 'View branded vs Jan Aushadhi prices side-by-side and see your savings.',
  },
  {
    step: '03',
    icon: RiMapPinLine,
    title: 'Find Pharmacy',
    description: 'Locate the nearest Jan Aushadhi store that stocks your chosen medicine.',
  },
  {
    step: '04',
    icon: RiMoneyDollarCircleLine,
    title: 'Save Money',
    description: 'Purchase the generic and save up to 90% on your healthcare costs.',
  },
]

const STATS = [
  { label: 'Medicines Available', value: 10847, suffix: '+', icon: RiMedicineBottleLine, color: 'primary' },
  { label: 'Partner Pharmacies',  value: 9500,  suffix: '+', icon: RiHospitalLine,       color: 'accent'  },
  { label: 'Users Served',        value: 250000,suffix: '+', icon: RiUserLine,            color: 'primary' },
  { label: 'Average Savings',     value: 72,    suffix: '%', icon: RiMoneyDollarCircleLine, color: 'warning'},
]

const TESTIMONIALS = [
  {
    name:   'Priya Sharma',
    role:   'Homemaker, Delhi',
    avatar: 'PS',
    rating: 5,
    text:   'I saved ₹1,200 per month on my father\'s diabetes medicines after switching to Jan Aushadhi generics through this app. Life-changing!',
  },
  {
    name:   'Dr. Rajesh Kumar',
    role:   'General Physician, Mumbai',
    avatar: 'RK',
    rating: 5,
    text:   'I now recommend this platform to all my patients. The medicine quality is the same, but patients pay 70–90% less. Excellent initiative.',
  },
  {
    name:   'Arun Patel',
    role:   'Retired Teacher, Ahmedabad',
    avatar: 'AP',
    rating: 5,
    text:   'The pharmacy locator found a Jan Aushadhi store just 500 metres from my home. I had no idea it existed. Thank you!',
  },
  {
    name:   'Sunita Devi',
    role:   'Small Business Owner, Jaipur',
    avatar: 'SD',
    rating: 5,
    text:   'The price comparison feature is incredibly easy to use. I checked 8 medicines and found cheaper alternatives for all of them in minutes.',
  },
]

const FAQS = [
  {
    q: 'What is Jan Aushadhi?',
    a: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP) is a Government of India scheme that provides quality generic medicines at affordable prices through dedicated Jan Aushadhi stores across India.',
  },
  {
    q: 'Are Jan Aushadhi medicines safe and effective?',
    a: 'Yes. All Jan Aushadhi medicines are manufactured by WHO-GMP certified units, tested by NABL-accredited labs, and are therapeutically equivalent to branded medicines. They contain the same active pharmaceutical ingredients at the same strength.',
  },
  {
    q: 'How much can I save with Jan Aushadhi medicines?',
    a: 'Savings typically range from 50% to 90% compared to branded alternatives. For example, a branded Metformin 500 mg strip costing ₹45 is available for just ₹5 under the Jan Aushadhi scheme.',
  },
  {
    q: 'How do I find the nearest Jan Aushadhi pharmacy?',
    a: 'Use the "Find Nearby Pharmacy" feature. Allow location access or enter your city/PIN code to view all Jan Aushadhi stores within your selected radius on an interactive map.',
  },
  {
    q: 'Can I upload my prescription to search medicines?',
    a: 'OCR prescription scanning is coming soon. You will be able to photograph or upload your prescription and have medicines automatically extracted and searched.',
  },
  {
    q: 'Is this platform free to use?',
    a: 'Yes, the platform is completely free for citizens. There are no charges for searching medicines, comparing prices, or locating pharmacies.',
  },
]

const JAN_AUSHADHI_BENEFITS = [
  'WHO-GMP certified manufacturing',
  'NABL-accredited lab tested',
  'Same active ingredients as branded',
  '50–90% lower cost',
  '9,500+ stores across India',
  'Government-backed quality assurance',
]

/* ─────────────────────────────────────────────────────────────────────
   Utility hooks
   ───────────────────────────────────────────────────────────────────── */

/** Animate a number from 0 to `target` over `duration` ms */
function useCountUp(target, duration = 2000, started = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    let startTime = null
    let frame

    function tick(ts) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quad
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, started])

  return count
}

/** Observe when an element enters the viewport */
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

/* ─────────────────────────────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────────────────────────────── */

/** Pill badge */
function Pill({ children, color = 'primary' }) {
  const styles = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300',
    accent:  'bg-accent-100  text-accent-800  dark:bg-accent-950  dark:text-accent-300',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[color]}`}>
      {children}
    </span>
  )
}

/** Section wrapper with consistent spacing */
function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        {children}
      </div>
    </section>
  )
}

/** Section heading block */
function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`mb-12 md:mb-16 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}

/** Feature card */
function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView(0.1)
  const Icon = feature.icon

  const iconStyles = {
    primary: 'bg-primary-50 text-primary-900 dark:bg-primary-950 dark:text-primary-400',
    accent:  'bg-accent-50  text-accent-700  dark:bg-accent-950  dark:text-accent-400',
    warning: 'bg-warning-50 text-warning-700 dark:bg-warning-950 dark:text-warning-400',
  }

  return (
    <div
      ref={ref}
      className={[
        'group relative rounded-2xl p-6 bg-white dark:bg-gray-800',
        'border border-gray-100 dark:border-gray-700',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300',
        'hover:-translate-y-1',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        'transition-[opacity,transform] ease-out',
      ].join(' ')}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`inline-flex p-3 rounded-xl mb-4 ${iconStyles[feature.color]}`} aria-hidden="true">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {feature.description}
      </p>
    </div>
  )
}

/** Stat counter card */
function StatCard({ stat, started }) {
  const count = useCountUp(stat.value, 2200, started)
  const Icon = stat.icon

  const iconStyles = {
    primary: 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-400',
    accent:  'bg-accent-100  text-accent-700  dark:bg-accent-950  dark:text-accent-400',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-400',
  }

  function fmt(n) {
    if (n >= 100000) return (n / 100000).toFixed(1) + ' L'
    if (n >= 1000)   return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K'
    return n.toString()
  }

  return (
    <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/20">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${iconStyles[stat.color]}`} aria-hidden="true">
        <Icon size={24} />
      </div>
      <span
        className="text-3xl md:text-4xl font-bold text-white"
        aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
      >
        {fmt(count)}{stat.suffix}
      </span>
      <span className="mt-1.5 text-sm font-medium text-white/75">{stat.label}</span>
    </div>
  )
}

/** Star rating */
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <RiStarFill
          key={i}
          size={14}
          className={i < rating ? 'text-warning-500' : 'text-gray-300 dark:text-gray-600'}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

/** Testimonial card */
function TestimonialCard({ t, index }) {
  const [ref, inView] = useInView(0.1)

  return (
    <div
      ref={ref}
      className={[
        'rounded-2xl p-6 bg-white dark:bg-gray-800',
        'border border-gray-100 dark:border-gray-700 shadow-card',
        'flex flex-col gap-4',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        'transition-[opacity,transform] duration-500 ease-out',
      ].join(' ')}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <Stars rating={t.rating} />
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
        "{t.text}"
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <div
          className="h-10 w-10 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
        </div>
      </div>
    </div>
  )
}

/** FAQ accordion item */
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={[
          'w-full flex items-center justify-between gap-4 px-5 py-4 text-left',
          'text-sm font-medium text-gray-900 dark:text-gray-100',
          'hover:bg-gray-50 dark:hover:bg-gray-700/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600',
          'transition-colors',
        ].join(' ')}
      >
        <span>{item.q}</span>
        <RiArrowDownSLine
          size={20}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/60 animate-fade-in">
          {item.a}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── HERO SECTION ──────────────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function HeroSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/medicines?q=${encodeURIComponent(q)}`)
    else navigate('/medicines')
  }

  return (
    <section
      aria-labelledby="hero-heading"
      className={[
        'relative overflow-hidden',
        'bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900',
        'dark:from-gray-950 dark:via-primary-950 dark:to-gray-900',
        'pt-16 pb-24 md:pt-24 md:pb-32',
      ].join(' ')}
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.03]" />
      </div>

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-medium mb-6">
            <RiShieldCheckLine size={14} aria-hidden="true" />
            Powered by PMBJP · Government of India Initiative
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight"
          >
            Find Affordable{' '}
            <span className="text-accent-400">Jan Aushadhi</span>{' '}
            Medicines Near You
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Compare branded vs generic prices, save up to{' '}
            <strong className="text-white">90%</strong> on healthcare costs, and locate nearby Jan Aushadhi pharmacies — all in one place.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/medicines')}
              rightIcon={<RiArrowRightLine size={18} aria-hidden="true" />}
              className="bg-white text-primary-900 hover:bg-gray-100 focus-visible:ring-white"
            >
              Search Medicines
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/pharmacy-locator')}
              leftIcon={<RiMapPinLine size={18} aria-hidden="true" />}
              className="border-white/40 text-white hover:bg-white/10 focus-visible:ring-white"
            >
              Find Nearby Pharmacy
            </Button>
          </div>

          {/* Trust stats row */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/60">
            {[
              { icon: RiMedicineBottleLine, text: '10,000+ medicines indexed' },
              { icon: RiHospitalLine,       text: '9,500+ Jan Aushadhi stores' },
              { icon: RiHeartPulseLine,     text: '2.5 lakh+ users served' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-accent-400" aria-hidden="true" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-16">
          <path d="M0 60L48 50C96 40 192 20 288 15C384 10 480 20 576 28C672 36 768 42 864 38C960 34 1056 20 1152 15C1248 10 1344 14 1392 16L1440 18V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" className="fill-gray-50 dark:fill-gray-950"/>
        </svg>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── QUICK SEARCH SECTION ──────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function QuickSearchSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [ref, inView] = useInView(0.2)

  const ALLOWED = /[^a-zA-Z0-9\-().\s]/g

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/medicines?q=${encodeURIComponent(q)}` : '/medicines')
  }

  return (
    <Section id="quick-search" className="bg-gray-50 dark:bg-gray-950 -mt-8">
      <div
        ref={ref}
        className={[
          'max-w-2xl mx-auto',
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          'transition-[opacity,transform] duration-700 ease-out',
        ].join(' ')}
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-1 text-center">
            Quick Medicine Search
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
            Search by medicine name or generic composition
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} role="search" aria-label="Quick medicine search">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <RiSearchLine
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.replace(ALLOWED, '').slice(0, 100))}
                  placeholder="e.g. Paracetamol, Metformin 500…"
                  aria-label="Medicine name or composition"
                  autoComplete="off"
                  className={[
                    'w-full pl-10 pr-4 py-3 rounded-xl border',
                    'border-gray-300 dark:border-gray-600',
                    'bg-gray-50 dark:bg-gray-900',
                    'text-gray-900 dark:text-gray-100 text-sm',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
                    'transition-colors',
                  ].join(' ')}
                />
              </div>
              <Button type="submit" variant="primary" size="md" aria-label="Search">
                Search
              </Button>
            </div>
          </form>

          {/* Upload / Voice row */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <button
              type="button"
              aria-label="Upload prescription (coming soon)"
              title="Upload prescription – OCR coming soon"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <RiUpload2Line size={13} aria-hidden="true" />
              Upload Prescription
            </button>
            <button
              type="button"
              aria-label="Voice search (coming soon)"
              title="Voice search – coming soon"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <RiMicLine size={13} aria-hidden="true" />
              Voice Search
            </button>
            <span className="ml-auto italic opacity-70">OCR coming soon</span>
          </div>

          {/* Popular searches */}
          <div className="mt-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2.5">
              Popular searches:
            </p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Popular medicine searches">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  role="listitem"
                  onClick={() => navigate(`/medicines?q=${encodeURIComponent(term)}`)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-800 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-primary-950 dark:hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── FEATURES SECTION ──────────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function FeaturesSection() {
  return (
    <Section id="features" className="bg-white dark:bg-gray-900">
      <SectionHeading
        eyebrow="Everything you need"
        title="A complete healthcare savings platform"
        subtitle="From medicine search to pharmacy navigation, everything you need to make informed healthcare decisions and save money."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── JAN AUSHADHI BENEFITS SECTION ────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function JanAushadhiBenefitsSection() {
  const [ref, inView] = useInView(0.15)

  return (
    <Section id="jan-aushadhi" className="bg-gray-50 dark:bg-gray-950">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left – text */}
        <div
          ref={ref}
          className={[
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8',
            'transition-[opacity,transform] duration-700 ease-out',
          ].join(' ')}
        >
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3">
            Government Initiative
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 leading-tight mb-4">
            Why choose{' '}
            <span className="text-accent-600 dark:text-accent-400">Jan Aushadhi</span>{' '}
            medicines?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
            Under the Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP), the Government of India makes quality generic medicines available to citizens at a fraction of branded prices — without compromising safety or efficacy.
          </p>

          <ul className="space-y-3 mb-8" aria-label="Jan Aushadhi benefits">
            {JAN_AUSHADHI_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <RiCheckboxCircleLine
                  size={20}
                  className="text-accent-600 dark:text-accent-400 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => window.open('https://janaushadhi.gov.in', '_blank', 'noopener,noreferrer')}
              rightIcon={<RiExternalLinkLine size={14} aria-hidden="true" />}
            >
              Official PMBJP Site
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {}}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Right – savings cards */}
        <div
          className={[
            inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8',
            'transition-[opacity,transform] duration-700 delay-200 ease-out',
            'grid grid-cols-2 gap-4',
          ].join(' ')}
        >
          {[
            { branded: 'Atorvastatin 10mg\n(30 tabs)', brandedPrice: '₹180', generic: 'Jan Aushadhi', genericPrice: '₹12', saving: '93%' },
            { branded: 'Metformin 500mg\n(30 tabs)', brandedPrice: '₹45', generic: 'Jan Aushadhi', genericPrice: '₹5', saving: '89%' },
            { branded: 'Omeprazole 20mg\n(15 caps)', brandedPrice: '₹98', generic: 'Jan Aushadhi', genericPrice: '₹9', saving: '91%' },
            { branded: 'Amlodipine 5mg\n(10 tabs)', brandedPrice: '₹55', generic: 'Jan Aushadhi', genericPrice: '₹8', saving: '85%' },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-card p-4"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line leading-snug mb-3">
                {item.branded}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 line-through">{item.brandedPrice}</p>
                  <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{item.genericPrice}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.generic}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
                  Save {item.saving}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── HOW IT WORKS SECTION ─────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

/** How It Works single step card */
function HowItWorksStep({ item, index }) {
  const [ref, inView] = useInView(0.1)
  const Icon = item.icon

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col items-center text-center',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
        'transition-[opacity,transform] duration-500 ease-out',
      ].join(' ')}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="relative mb-5">
        <div className="h-20 w-20 rounded-full bg-primary-50 dark:bg-primary-950 border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-md">
          <Icon size={28} className="text-primary-700 dark:text-primary-400" aria-hidden="true" />
        </div>
        <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">
          {item.step}
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {item.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
        {item.description}
      </p>
    </div>
  )
}

function HowItWorksSection() {
  return (
    <Section id="how-it-works" className="bg-white dark:bg-gray-900">
      <SectionHeading
        eyebrow="Simple process"
        title="How it works"
        subtitle="Four easy steps to start saving on your medicine costs today."
      />

      <div className="relative">
        {/* Connecting line (desktop) */}
        <div
          className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-accent-300 to-primary-200 dark:from-primary-900 dark:via-accent-800 dark:to-primary-900"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map((item, i) => (
            <HowItWorksStep key={item.step} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {}}
          rightIcon={<RiArrowRightLine size={18} aria-hidden="true" />}
        >
          Start Saving Now
        </Button>
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── STATISTICS SECTION ───────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function StatisticsSection() {
  const [ref, inView] = useInView(0.2)

  return (
    <section
      id="statistics"
      aria-labelledby="stats-heading"
      className="py-16 md:py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900 dark:from-gray-950 dark:via-primary-950 dark:to-gray-900"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent-400 uppercase tracking-widest mb-3">
            By the numbers
          </p>
          <h2
            id="stats-heading"
            className="text-3xl md:text-4xl font-bold text-white leading-tight"
          >
            Trusted by millions across India
          </h2>
        </div>
        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} started={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── TESTIMONIALS SECTION ─────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function TestimonialsSection() {
  return (
    <Section id="testimonials" className="bg-gray-50 dark:bg-gray-950">
      <SectionHeading
        eyebrow="What our users say"
        title="Real savings, real stories"
        subtitle="Join thousands of Indians already saving on their healthcare costs."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={t.name} t={t} index={i} />
        ))}
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── FAQ SECTION ──────────────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null)

  function toggle(i) {
    setOpenIndex((prev) => (prev === i ? null : i))
  }

  return (
    <Section id="faq" className="bg-white dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <SectionHeading
          eyebrow="Got questions?"
          title="Frequently asked questions"
          subtitle="Everything you need to know about Jan Aushadhi medicines and this platform."
        />
        <div className="space-y-3" role="list" aria-label="Frequently asked questions">
          {FAQS.map((item, i) => (
            <div key={i} role="listitem">
              <FaqItem
                item={item}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-start gap-4">
          <RiInformationLine
            size={22}
            className="text-primary-600 dark:text-primary-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Still have questions?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Visit the{' '}
              <a
                href="https://janaushadhi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-600 rounded"
              >
                official PMBJP website
              </a>{' '}
              or use the contact form for personalised help.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── CALL TO ACTION SECTION ───────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

function CtaSection() {
  const navigate = useNavigate()
  const [ref, inView] = useInView(0.2)

  return (
    <Section id="cta" className="bg-gray-50 dark:bg-gray-950">
      <div
        ref={ref}
        className={[
          'relative rounded-3xl overflow-hidden',
          'bg-gradient-to-br from-primary-900 via-primary-800 to-blue-900',
          'dark:from-gray-900 dark:via-primary-950 dark:to-gray-950',
          'p-8 md:p-14 text-center',
          inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          'transition-[opacity,transform] duration-700 ease-out',
        ].join(' ')}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative">
          <Pill color="accent">
            <RiLeafLine size={12} aria-hidden="true" />
            Free to use · No registration required to search
          </Pill>

          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-white leading-tight">
            Start saving on medicines today
          </h2>
          <p className="mt-4 text-white/75 text-lg max-w-xl mx-auto">
            Search for your prescription medicines, compare prices with Jan Aushadhi generics, and find the nearest pharmacy — right now.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/medicines')}
              className="bg-white text-primary-900 hover:bg-gray-100 focus-visible:ring-white"
              rightIcon={<RiArrowRightLine size={18} aria-hidden="true" />}
            >
              Search Medicines Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              className="border-white/40 text-white hover:bg-white/10 focus-visible:ring-white"
            >
              Create Free Account
            </Button>
          </div>

          <p className="mt-6 text-xs text-white/50">
            No credit card required · Completely free · Government-backed platform
          </p>
        </div>
      </div>
    </Section>
  )
}

/* ─────────────────────────────────────────────────────────────────────
   ── ROOT PAGE COMPONENT ──────────────────────────────────────────────
   ───────────────────────────────────────────────────────────────────── */

/**
 * HomePage – Phase 5 landing page.
 *
 * Uses MainLayout (Navbar + Footer) provided by the router.
 * All sections are self-contained functional components above.
 *
 * Sections:
 *   1. HeroSection             – headline, CTAs, trust stats
 *   2. QuickSearchSection      – inline search, popular terms
 *   3. FeaturesSection         – 6 feature cards
 *   4. JanAushadhiBenefitsSection – benefits list + price comparison cards
 *   5. HowItWorksSection       – 4-step process
 *   6. StatisticsSection       – animated counters on scroll
 *   7. TestimonialsSection     – 4 testimonial cards
 *   8. FaqSection              – accordion
 *   9. CtaSection              – register / search CTA
 */
function HomePage() {
  // Set page title
  useEffect(() => {
    document.title = 'JanAushadhi Smart Medicine – Find Affordable Generic Medicines'
    return () => { document.title = 'JanAushadhi Smart Medicine' }
  }, [])

  return (
    <>
      {/* Skip link target is #main-content (set in MainLayout) */}

      {/* Hero – full bleed, needs negative margin to cancel MainLayout padding */}
      <div className="-mx-4 sm:-mx-6 -mt-6">
        <HeroSection />
      </div>

      <QuickSearchSection />
      <FeaturesSection />
      <JanAushadhiBenefitsSection />
      <HowItWorksSection />
      <StatisticsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}

export default HomePage
