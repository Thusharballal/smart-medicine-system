/**
 * Application-wide constants.
 * Sourced from Vite environment variables where possible.
 * Import this file instead of accessing import.meta.env directly
 * so all constants are co-located and easy to swap for production.
 */

export const APP_TITLE   = import.meta.env.VITE_APP_TITLE   ?? 'JanAushadhi Smart Medicine'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0'

// ── API ──────────────────────────────────────────────────────────────
export const API_BASE_URL     = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'
export const API_TIMEOUT_MS   = 10_000
export const USE_MOCK         = import.meta.env.VITE_USE_MOCK === 'true'
export const MOCK_DELAY_MS    = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 400)

// ── Auth ─────────────────────────────────────────────────────────────
export const TOKEN_KEY         = 'auth_token'
export const USER_KEY          = 'auth_user'
export const REFRESH_TOKEN_KEY = 'auth_refresh_token'
export const SESSION_DURATION_MS      = 24 * 60 * 60 * 1000   // 24 hours
export const REMEMBER_ME_DURATION_MS  = 30 * 24 * 60 * 60 * 1000 // 30 days

// ── Search ───────────────────────────────────────────────────────────
export const DEFAULT_SEARCH_RADIUS  = Number(import.meta.env.VITE_DEFAULT_SEARCH_RADIUS ?? 5)
export const SEARCH_DEBOUNCE_MS     = 300
export const SEARCH_MIN_CHARS       = 3
export const SEARCH_MAX_CHARS       = 100
export const RESULTS_PER_PAGE       = 9
export const INVENTORY_PER_PAGE     = 25

// ── Map defaults (New Delhi) ─────────────────────────────────────────
export const DEFAULT_MAP_CENTER = { lat: 28.6139, lng: 77.2090 }
export const DEFAULT_MAP_ZOOM   = 12
export const USER_MAP_ZOOM      = 14
export const SELECTED_MAP_ZOOM  = 16

// ── Notifications ────────────────────────────────────────────────────
export const MAX_NOTIFICATIONS    = 20
export const TOAST_DURATION_MS    = 5_000
export const OTP_RESEND_COOLDOWN  = 60   // seconds

// ── PMBJP ────────────────────────────────────────────────────────────
export const PMBJP_URL = 'https://janaushadhi.gov.in'
