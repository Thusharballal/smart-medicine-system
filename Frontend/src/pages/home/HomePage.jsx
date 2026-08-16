import { lazy, Suspense } from 'react'
import { Spinner } from '../../components/feedback'
// ── Eagerly loaded: above-the-fold sections ──────────────────────────────────
import HeroSection        from './sections/HeroSection'
import AboutSection       from './sections/AboutSection'

// ── Lazily loaded: below-the-fold sections ───────────────────────────────────
// Lazy loading reduces initial bundle parsed/evaluated on first paint.
// Each section is independently code-split by Vite.
const JanAushadhiSection = lazy(() => import('./sections/JanAushadhiSection'))
const FeaturesSection    = lazy(() => import('./sections/FeaturesSection'))
const HowItWorksSection  = lazy(() => import('./sections/HowItWorksSection'))
const BenefitsSection    = lazy(() => import('./sections/BenefitsSection'))
const StatsSection       = lazy(() => import('./sections/StatsSection'))
const FaqSection         = lazy(() => import('./sections/FaqSection'))
const CtaSection         = lazy(() => import('./sections/CtaSection'))

// ── Section loading placeholder ──────────────────────────────────────────────
// Used as Suspense fallback while lazy sections are being loaded.
function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="md" color="muted" label="Loading section…" />
    </div>
  )
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage() {
  return (
    <>
      {/* ===================================================== */}
      {/* Hero Section                                          */}
      {/* Eagerly loaded — first contentful paint               */}
      {/* ===================================================== */}
      <HeroSection />

      {/* ===================================================== */}
      {/* About Project                                         */}
      {/* Eagerly loaded — immediately below the fold          */}
      {/* ===================================================== */}
      <AboutSection />

      {/* ===================================================== */}
      {/* All sections below are lazy-loaded                   */}
      {/* ===================================================== */}
      <Suspense fallback={<SectionLoader />}>

        {/* ================================================= */}
        {/* About PM Jan Aushadhi                             */}
        {/* ================================================= */}
        <JanAushadhiSection />

        {/* ================================================= */}
        {/* Key Features                                      */}
        {/* TODO: can be driven by GET /api/v1/features       */}
        {/* ================================================= */}
        <FeaturesSection />

        {/* ================================================= */}
        {/* How It Works                                      */}
        {/* ================================================= */}
        <HowItWorksSection />

        {/* ================================================= */}
        {/* Benefits of Generic Medicines                     */}
        {/* ================================================= */}
        <BenefitsSection />

        {/* ================================================= */}
        {/* Statistics                                        */}
        {/* TODO: values from GET /api/v1/stats/platform      */}
        {/* ================================================= */}
        <StatsSection />

        {/* ================================================= */}
        {/* FAQ                                               */}
        {/* TODO: can be driven by GET /api/v1/content/faqs   */}
        {/* ================================================= */}
        <FaqSection />

        {/* ================================================= */}
        {/* Call To Action                                    */}
        {/* ================================================= */}
        <CtaSection />

      </Suspense>
    </>
  )
}

export default HomePage
