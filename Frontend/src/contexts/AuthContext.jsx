import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import { setTokenGetter, setUnauthorizedHandler } from '../services/apiClient'
import {
  TOKEN_KEY,
  USER_KEY,
  REFRESH_TOKEN_KEY,
  SESSION_DURATION_MS,
  REMEMBER_ME_DURATION_MS,
} from '../config/constants'

/**
 * AuthContext – global authentication state.
 *
 * State shape:
 *   {
 *     user:  { id, displayName, email, role, avatarUrl? } | null,
 *     token: string | null,
 *     role:  'user' | 'pharmacy_owner' | 'admin' | null,
 *     isAuthenticated: boolean,
 *     isLoading: boolean,   // true only during initial hydration
 *   }
 *
 * Actions: LOGIN | LOGOUT | UPDATE_USER | SET_LOADING
 *
 * Token persistence:
 *   - VITE_USE_MOCK=true → sessionStorage (spec Req 5.4)
 *   - Production       → relies on httpOnly cookie (no JS read needed);
 *     user/role stored in sessionStorage for UI purposes only.
 *
 * "Remember Me" extends persistence to localStorage (30 days).
 */

const STORAGE_KEY       = USER_KEY
const STORAGE_TOKEN_KEY = TOKEN_KEY

// ─── Reducer ──────────────────────────────────────────────────────────
const initialState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.user,
        token: action.token,
        role: action.user?.role ?? null,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.updates } : null,
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.value }
    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Hydrate from storage on mount and wire apiClient interceptors
  useEffect(() => {
    // Wire apiClient token getter so Axios always has the current token
    setTokenGetter(() => {
      return sessionStorage.getItem(STORAGE_TOKEN_KEY)
        ?? localStorage.getItem(STORAGE_TOKEN_KEY)
        ?? null
    })

    // Wire apiClient 401 handler
    setUnauthorizedHandler(() => {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(STORAGE_TOKEN_KEY)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_TOKEN_KEY)
      } catch { /* ignore */ }
      dispatch({ type: 'LOGOUT' })
      window.location.href = '/login'
    })

    // Hydrate state
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY)
      const token = sessionStorage.getItem(STORAGE_TOKEN_KEY) ?? localStorage.getItem(STORAGE_TOKEN_KEY)
      if (raw) {
        const user = JSON.parse(raw)
        dispatch({ type: 'LOGIN', user, token: token ?? null })
        return
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_TOKEN_KEY)
    }
    dispatch({ type: 'SET_LOADING', value: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ──────────────────────────────────────────────────────────
  const login = useCallback((user, token, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(user))
      if (token) storage.setItem(STORAGE_TOKEN_KEY, token)
    } catch { /* ignore */ }
    dispatch({ type: 'LOGIN', user, token })
  }, [])

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_TOKEN_KEY)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_TOKEN_KEY)
    } catch { /* ignore */ }
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUser = useCallback((updates) => {
    dispatch({ type: 'UPDATE_USER', updates })
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const user = { ...JSON.parse(raw), ...updates }
        const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage
        storage.setItem(STORAGE_KEY, JSON.stringify(user))
      }
    } catch { /* ignore */ }
  }, [])

  const value = {
    ...state,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
