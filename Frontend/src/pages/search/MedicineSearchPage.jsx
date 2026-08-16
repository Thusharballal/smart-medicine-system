import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'

// ── Sections ──────────────────────────────────────────────────────────────────
import SearchHeaderSection from './sections/SearchHeaderSection'
import SearchInputSection from './sections/SearchInputSection'
import SearchSuggestionsSection from './sections/SearchSuggestionsSection'
import QuickActionsSection from './sections/QuickActionsSection'
import RecentSearchesSection from './sections/RecentSearchesSection'
import PopularMedicinesSection from './sections/PopularMedicinesSection'
import MedicineCategoriesSection from './sections/MedicineCategoriesSection'
import SearchFiltersSection from './sections/SearchFiltersSection'
import SearchLoadingSection from './sections/SearchLoadingSection'
import SearchEmptyState from './sections/SearchEmptyState'
import SearchErrorState from './sections/SearchErrorState'

import Divider from '../../components/ui/Divider'
import { ROUTES } from '../../constants/routes'

function MedicineSearchPage() {
  // =====================================================
  // Search state
  // =====================================================

  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // =====================================================
  // Demo state
  //
  // Later replace this with real API state.
  // =====================================================

  const [demoState] = useState('idle')
  // Possible values:
  // 'idle'
  // 'loading'
  // 'empty'
  // 'error'

  const navigate = useNavigate()

  // =====================================================
  // Search
  // =====================================================

  const handleSearch = useCallback(
    (value) => {
      const trimmed = (value ?? query).trim()

      if (!trimmed) {
        return
      }

      setShowSuggestions(false)

      navigate(
        `${ROUTES.USER.SEARCH_RESULTS}?q=${encodeURIComponent(trimmed)}`
      )
    },
    [query, navigate]
  )

  // =====================================================
  // Query change
  // =====================================================

  const handleQueryChange = useCallback((value) => {
    setQuery(value)

    setShowSuggestions(
      value.trim().length > 0
    )
  }, [])

  // =====================================================
  // Suggestion selected
  // =====================================================

  const handleSuggestionSelect = useCallback(
    (name) => {
      setQuery(name)
      setShowSuggestions(false)

      handleSearch(name)
    },
    [handleSearch]
  )

  // =====================================================
  // Close suggestions
  // =====================================================

  const handleCloseSuggestions = useCallback(() => {
    setShowSuggestions(false)
  }, [])

  // =====================================================
  // Category selection
  // =====================================================

  const handleCategorySelect = useCallback(
    (categoryId) => {
      /*
       * TODO: Module 7B
       *
       * Connect category selection to the backend
       * medicine search API.
       *
       * Example:
       * GET /api/v1/medicines/search?category={categoryId}
       */

      console.log('Selected medicine category:', categoryId)
    },
    []
  )

  // =====================================================
  // Apply filters
  // =====================================================

  const handleFiltersApply = useCallback(
    (filters) => {
      /*
       * TODO: Module 7B
       *
       * Send filters to the backend search API.
       */

      console.log('Applied medicine filters:', filters)
    },
    []
  )

  // =====================================================
  // Reset filters
  // =====================================================

  const handleFiltersReset = useCallback(() => {
    /*
     * TODO: Module 7B
     *
     * Clear active search filters.
     */

    console.log('Medicine search filters reset')
  }, [])

  // =====================================================
  // Retry
  // =====================================================

  const handleRetrySearch = useCallback(() => {
    setQuery('')
    setShowSuggestions(false)
  }, [])

  // =====================================================
  // Back to Dashboard
  // =====================================================

  const handleBackToDashboard = useCallback(() => {
    navigate(ROUTES.USER.DASHBOARD)
  }, [navigate])

  return (
    <article
      aria-label="Medicine Search"
      className="
        w-full
        max-w-7xl
        mx-auto
      "
    >

      {/* =====================================================
          1. BACK TO DASHBOARD
         ===================================================== */}

      <div className="mb-3">

        <button
          type="button"
          onClick={handleBackToDashboard}
          className="
            inline-flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            border
            border-slate-200
            bg-white
            text-sm
            font-medium
            text-slate-600
            shadow-sm
            hover:bg-slate-50
            hover:text-primary-600
            hover:border-primary-200
            transition-colors
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary-500
            focus-visible:ring-offset-2
          "
        >
          <HiOutlineArrowLeft
            size={16}
            aria-hidden="true"
          />

          Back to Dashboard
        </button>

      </div>

      {/* =====================================================
          2. PRIMARY SEARCH
          
          This stays at the top so the user can immediately
          search for a medicine.
         ===================================================== */}

      <section
        aria-label="Primary medicine search"
        className="
          bg-white
          rounded-2xl
        "
      >

        <SearchInputSection
          query={query}
          onQueryChange={handleQueryChange}
          onSearch={handleSearch}
        />

      </section>

      {/* =====================================================
          3. SEARCH SUGGESTIONS
          
          Suggestions appear directly below the search bar.
         ===================================================== */}

      {showSuggestions && (
        <div
          className="
            max-w-3xl
            mx-auto
            -mt-3
            px-4
            sm:px-6
            relative
            z-30
          "
        >

          <SearchSuggestionsSection
            query={query}
            onSelect={handleSuggestionSelect}
            onClose={handleCloseSuggestions}
          />

        </div>
      )}

      {/* =====================================================
          4. HERO / INFORMATION BACKGROUND
          
          SearchHeaderSection contains:
          - Background illustration
          - Find Medicines Faster & Smarter
          - Description
          - Trust badges

          The content is displayed over the background.
         ===================================================== */}

      <div className="mt-2">

        <SearchHeaderSection />

      </div>

      <Divider className="my-0" />

      {/* =====================================================
          5. QUICK ACTIONS
         ===================================================== */}

      <QuickActionsSection />

      <Divider className="my-0" />

      {/* =====================================================
          6. RECENT SEARCHES
         ===================================================== */}

      <RecentSearchesSection
        onSearch={handleSearch}
      />

      <Divider className="my-0" />

      {/* =====================================================
          7. POPULAR MEDICINES
         ===================================================== */}

      <PopularMedicinesSection
        onSearch={handleSearch}
      />

      <Divider className="my-0" />

      {/* =====================================================
          8. MEDICINE CATEGORIES
         ===================================================== */}

      <MedicineCategoriesSection
        onCategorySelect={handleCategorySelect}
      />

      <Divider className="my-0" />

      {/* =====================================================
          9. SEARCH FILTERS
         ===================================================== */}

      <SearchFiltersSection
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
      />

      {/* =====================================================
          10. LOADING STATE
         ===================================================== */}

      {demoState === 'loading' && (
        <>
          <Divider className="my-0" />

          <SearchLoadingSection
            variant="results"
          />
        </>
      )}

      {/* =====================================================
          11. EMPTY STATE
         ===================================================== */}

      {demoState === 'empty' && (
        <>
          <Divider className="my-0" />

          <SearchEmptyState
            query={query}
            onRetry={handleRetrySearch}
          />
        </>
      )}

      {/* =====================================================
          12. ERROR STATE
         ===================================================== */}

      {demoState === 'error' && (
        <>
          <Divider className="my-0" />

          <SearchErrorState
            onRetry={handleRetrySearch}
          />
        </>
      )}

    </article>
  )
}

export default MedicineSearchPage