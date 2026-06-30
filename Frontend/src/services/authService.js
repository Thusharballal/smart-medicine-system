/**
 * authService – authentication operations.
 *
 * All methods support mock mode (VITE_USE_MOCK=true) and real FastAPI mode.
 *
 * FastAPI endpoints:
 *   POST /auth/login          POST /auth/register
 *   POST /auth/send-otp       POST /auth/verify-otp
 *   POST /auth/forgot-password POST /auth/reset-password
 *   POST /auth/logout         GET  /auth/google
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS } from '../config/constants'

// ── Mock helpers ──────────────────────────────────────────────────────
const delay = (ms = MOCK_DELAY_MS) => new Promise((res) => setTimeout(res, ms))

// ── Mock user database (in-memory for demo) ───────────────────────────
const MOCK_USERS = [
  {
    id: 'u1',
    displayName: 'Demo User',
    email: 'user@demo.com',
    mobile: '9876543210',
    role: 'user',
    avatarUrl: null,
  },
  {
    id: 'u2',
    displayName: 'Pharmacy Owner',
    email: 'pharmacy@demo.com',
    mobile: '9123456789',
    role: 'pharmacy_owner',
    avatarUrl: null,
  },
  {
    id: 'u3',
    displayName: 'Admin User',
    email: 'admin@demo.com',
    mobile: '9000000000',
    role: 'admin',
    avatarUrl: null,
  },
]

const MOCK_PASSWORD = 'Demo@1234'
const MOCK_TOKEN = 'mock_jwt_token_for_demo_purposes_only'
const MOCK_OTP = '123456' // fixed OTP for demo

// ─────────────────────────────────────────────────────────────────────

/**
 * login – authenticate with email + password.
 *
 * @param {{ email: string, password: string, rememberMe?: boolean }} payload
 * @returns {{ user, token }}
 */
export async function login({ email, password, rememberMe = false }) {
  if (USE_MOCK) {
    await delay()
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || password !== MOCK_PASSWORD) {
      const err = new Error('Invalid email or password.')
      err.status = 401
      throw err
    }
    return { user, token: MOCK_TOKEN, rememberMe }
  }

  // Real implementation
  const { data } = await apiClient.post('/auth/login', { email, password, rememberMe })
  return data
}

/**
 * register – create a new user account.
 *
 * @param {{ displayName, email, mobile, password, role }} payload
 * @returns {{ message: string, email: string }}  (triggers OTP send)
 */
export async function register({ displayName, email, mobile, password, role }) {
  if (USE_MOCK) {
    await delay()
    const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      const err = new Error('An account with this email already exists.')
      err.status = 409
      throw err
    }
    return { message: 'OTP sent to your email.', email }
  }

  const { data } = await apiClient.post('/auth/register', {
    displayName, email, mobile, password, role,
  })
  return data
}

/**
 * sendOtp – send / resend OTP to email.
 *
 * @param {{ email: string, purpose: 'verify_email' | 'forgot_password' }} payload
 * @returns {{ message: string }}
 */
export async function sendOtp({ email, purpose = 'verify_email' }) {
  if (USE_MOCK) {
    await delay(600)
    return { message: `OTP sent to ${email}` }
  }

  const { data } = await apiClient.post('/auth/send-otp', { email, purpose })
  return data
}

/**
 * verifyOtp – verify a 6-digit OTP.
 *
 * @param {{ email: string, otp: string, purpose: string }} payload
 * @returns {{ user, token }}
 */
export async function verifyOtp({ email, otp, purpose = 'verify_email' }) {
  if (USE_MOCK) {
    await delay()
    if (otp !== MOCK_OTP) {
      const err = new Error('Invalid or expired OTP. Please try again.')
      err.status = 400
      throw err
    }
    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
      ?? { id: 'new', displayName: 'New User', email, role: 'user', avatarUrl: null }
    return { user, token: MOCK_TOKEN }
  }

  const { data } = await apiClient.post('/auth/verify-otp', { email, otp, purpose })
  return data
}

/**
 * forgotPassword – send password-reset OTP to email.
 *
 * Always returns success (Req 5.12 – prevent user enumeration).
 *
 * @param {{ email: string }} payload
 * @returns {{ message: string }}
 */
export async function forgotPassword({ email }) {
  if (USE_MOCK) {
    await delay(700)
    // Always succeed regardless of whether email exists (anti-enumeration)
    return { message: 'If this email is registered, you will receive a reset link shortly.' }
  }

  const { data } = await apiClient.post('/auth/forgot-password', { email })
  return data
}

/**
 * resetPassword – set a new password using a verified reset token.
 *
 * @param {{ email: string, otp: string, newPassword: string }} payload
 * @returns {{ message: string }}
 */
export async function resetPassword({ email, otp, newPassword }) {
  if (USE_MOCK) {
    await delay()
    if (otp !== MOCK_OTP) {
      const err = new Error('Invalid or expired OTP.')
      err.status = 400
      throw err
    }
    return { message: 'Password reset successfully. You can now log in.' }
  }

  const { data } = await apiClient.post('/auth/reset-password', { email, otp, newPassword })
  return data
}

/**
 * googleSignIn – initiate Google OAuth flow (UI placeholder).
 * In production this would redirect to Google's consent screen.
 *
 * @returns void
 */
export function googleSignIn() {
  if (USE_MOCK) {
    // In mock mode show a non-blocking alert rather than window.alert
    console.info('[googleSignIn] Mock mode – use user@demo.com / Demo@1234')
    return
  }
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`
}

/**
 * logout – invalidate server-side session.
 */
export async function logoutApi() {
  if (USE_MOCK) {
    await delay(200)
    return { message: 'Logged out.' }
  }
  const { data } = await apiClient.post('/auth/logout')
  return data
}

export default {
  login,
  register,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  googleSignIn,
  logoutApi,
}
