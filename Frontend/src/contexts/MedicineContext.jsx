import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react'
import { MEDICINES } from '../mocks/medicines'

/**
 * MedicineContext – manages watchlist and recent-search state.
 * Pure frontend state; no API calls.
 */

const initialState = {
  watchlist: [],          // medicine objects
  recentSearches: [],     // { id, query, timestamp }
  medicines: MEDICINES,   // full catalogue (for search/filter)
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_WATCHLIST': {
      const exists = state.watchlist.find((m) => m.id === action.medicine.id)
      if (exists) return state
      return { ...state, watchlist: [...state.watchlist, { ...action.medicine, isInWatchlist: true }] }
    }
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter((m) => m.id !== action.id),
      }
    case 'ADD_RECENT_SEARCH': {
      const filtered = state.recentSearches.filter((r) => r.query.toLowerCase() !== action.query.toLowerCase())
      const entry = { id: `rs_${Date.now()}`, query: action.query, timestamp: new Date().toISOString() }
      return { ...state, recentSearches: [entry, ...filtered].slice(0, 10) }
    }
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] }
    default:
      return state
  }
}

const MedicineContext = createContext(null)

export function MedicineProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const addToWatchlist = useCallback((medicine) => {
    dispatch({ type: 'ADD_TO_WATCHLIST', medicine })
  }, [])

  const removeFromWatchlist = useCallback((id) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', id })
  }, [])

  const toggleWatchlist = useCallback((medicine) => {
    const inList = state.watchlist.find((m) => m.id === medicine.id)
    if (inList) dispatch({ type: 'REMOVE_FROM_WATCHLIST', id: medicine.id })
    else dispatch({ type: 'ADD_TO_WATCHLIST', medicine })
  }, [state.watchlist])

  const isInWatchlist = useCallback((id) => {
    return state.watchlist.some((m) => m.id === id)
  }, [state.watchlist])

  const addRecentSearch = useCallback((query) => {
    if (query?.trim()) dispatch({ type: 'ADD_RECENT_SEARCH', query: query.trim() })
  }, [])

  const clearRecentSearches = useCallback(() => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' })
  }, [])

  return (
    <MedicineContext.Provider value={{
      medicines: state.medicines,
      watchlist: state.watchlist,
      recentSearches: state.recentSearches,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isInWatchlist,
      addRecentSearch,
      clearRecentSearches,
    }}>
      {children}
    </MedicineContext.Provider>
  )
}

export function useMedicine() {
  const ctx = useContext(MedicineContext)
  if (!ctx) throw new Error('useMedicine must be used inside <MedicineProvider>')
  return ctx
}

export default MedicineContext
