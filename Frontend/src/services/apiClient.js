/**
 * apiClient – singleton Axios instance.
 *
 * Implements Req 14.1–14.6:
 *   - baseURL from env variable
 *   - Content-Type: application/json default header
 *   - 10 000 ms timeout
 *   - Request interceptor: attaches Bearer token
 *   - Response interceptor: handles 401 (logout) and 5xx (normalize error)
 *   - Network/timeout error normalization
 *
 * Integration points (FastAPI):
 *   - Replace TOKEN_KEY storage read with actual token from AuthContext
 *     when React context is accessible here (use a token getter pattern).
 *   - All service files import this instance instead of creating their own.
 */

import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT_MS, TOKEN_KEY } from '../config/constants'

// ── Token accessor (avoids circular dependency with AuthContext) ───────
// Auth context calls `setTokenGetter()` on login/logout.
// This pattern allows the Axios interceptor to read the latest token
// without importing React context directly.
let _tokenGetter = () => {
  return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY) ?? null
}

export function setTokenGetter(fn) {
  _tokenGetter = fn
}

// ── Logout callback (set by AuthContext on mount) ─────────────────────
let _onUnauthorized = () => {
  // Default: redirect to login — will be overridden by AuthProvider
  window.location.href = '/login'
}

export function setUnauthorizedHandler(fn) {
  _onUnauthorized = fn
}

// ── Create instance ────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request interceptor ────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = _tokenGetter()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(normalizeError(error)),
)

// ── Response interceptor ───────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // 401 – token expired or invalid → logout
    if (status === 401) {
      _onUnauthorized()
    }

    // Log 5xx errors to console (never to user)
    if (status >= 500) {
      console.error('[API 5xx]', error.response?.data ?? error.message)
    }

    return Promise.reject(normalizeError(error))
  },
)

// ── Error normalizer ───────────────────────────────────────────────────
/**
 * Returns a plain Error with:
 *   - err.message  – human-readable string
 *   - err.status   – HTTP status code (0 for network errors)
 *   - err.code     – FastAPI error code if present
 *   - err.data     – raw response body
 */
function normalizeError(error) {
  if (!error.response) {
    // Network / timeout
    const msg = error.code === 'ECONNABORTED'
      ? 'Request timed out. Please try again.'
      : 'Network error. Please check your connection.'
    const normalized = new Error(msg)
    normalized.status = 0
    normalized.code   = error.code ?? 'NETWORK_ERROR'
    return normalized
  }

  const { status, data } = error.response
  const message =
    data?.detail ??          // FastAPI validation error
    data?.message ??          // generic JSON message
    data?.error ??
    HTTP_MESSAGES[status] ??
    `Request failed with status ${status}.`

  const normalized = new Error(message)
  normalized.status = status
  normalized.code   = data?.code ?? `HTTP_${status}`
  normalized.data   = data
  return normalized
}

const HTTP_MESSAGES = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has ended. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. This item may already exist.',
  422: 'Validation failed. Please check your input.',
  429: 'Too many requests. Please slow down.',
  500: 'Server error. Our team has been notified.',
  502: 'Service temporarily unavailable. Please try again.',
  503: 'Service is under maintenance. Please try again later.',
}

export default apiClient
