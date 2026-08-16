/**
 * Authentication Context
 *
 * Provides authentication state and authentication actions
 * to the complete frontend application.
 *
 * Backend:
 *   FastAPI + JWT Authentication
 *
 * Responsibilities:
 *   - Store authenticated user
 *   - Store JWT access token
 *   - Login
 *   - Register
 *   - Verify OTP
 *   - Resend OTP
 *   - Forgot password
 *   - Reset password
 *   - Logout
 *   - Restore session from localStorage
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../constants/app'
import authService from '../services/authService'
import axiosClient from '../config/axiosClient'

// =====================================================
// Authentication Context
// =====================================================

const AuthContext = createContext(null)

// =====================================================
// Auth Provider
// =====================================================

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = storage.get(
      STORAGE_KEYS.USER
    )

    console.log(
      '🔐 AuthContext INITIALIZATION'
    )

    console.log(
      'User from localStorage:',
      user
    )

    console.log(
      'User role:',
      user?.role
    )

    return user
  })

  const [isLoading, setIsLoading] =
    useState(false)

  const [authError, setAuthError] =
    useState(null)

  useEffect(() => {
    console.log(
      '🔄 AuthContext: currentUser changed'
    )

    console.log(
      'New currentUser:',
      currentUser
    )

    console.log(
      'New role:',
      currentUser?.role
    )
  }, [currentUser])

  // =====================================================
  // Clear Authentication Error
  // =====================================================

  const clearError = useCallback(() => {
    setAuthError(null)
  }, [])

  // =====================================================
  // Store Session
  // =====================================================

  const storeSession = useCallback(
    (
      user,
      accessToken,
      refreshToken = null
    ) => {
      console.log(
        '💾 storeSession() called'
      )

      console.log(
        'User:',
        user
      )

      console.log(
        'User role:',
        user?.role
      )

      console.log(
        'Access token:',
        accessToken
          ? 'present'
          : 'missing'
      )

      storage.set(
        STORAGE_KEYS.USER,
        user
      )

      storage.set(
        STORAGE_KEYS.ACCESS_TOKEN,
        accessToken
      )

      storage.set(
        STORAGE_KEYS.REFRESH_TOKEN,
        refreshToken
      )

      setCurrentUser(user)

      console.log(
        '✅ Session stored successfully'
      )
    },
    []
  )

  // =====================================================
  // Update Current User
  // =====================================================

  const updateCurrentUser = useCallback(
    (updatedUser) => {
      console.log(
        '🔄 Updating current user:',
        updatedUser
      )

      storage.set(
        STORAGE_KEYS.USER,
        updatedUser
      )

      setCurrentUser(updatedUser)
    },
    []
  )

  // =====================================================
  // Clear Session
  // =====================================================

  const clearSession = useCallback(() => {
    console.log(
      '🚪 Clearing authentication session'
    )

    storage.remove(
      STORAGE_KEYS.USER
    )

    storage.remove(
      STORAGE_KEYS.ACCESS_TOKEN
    )

    storage.remove(
      STORAGE_KEYS.REFRESH_TOKEN
    )

    setCurrentUser(null)
  }, [])

  // =====================================================
  // LOGIN
  // =====================================================

  const login = useCallback(
    async (credentials) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '🔐 Login started'
        )

        console.log(
          'Login email:',
          credentials?.email
        )

        const response =
          await authService.login(
            credentials
          )

        const data =
          response.data

        console.log(
          'Login response:',
          data
        )

        const accessToken =
          data?.access_token

        if (!accessToken) {
          throw new Error(
            'Access token was not returned by the backend.'
          )
        }

        storage.set(
          STORAGE_KEYS.ACCESS_TOKEN,
          accessToken
        )

        console.log(
          '✅ Access token stored'
        )

        console.log(
          '👤 Fetching authenticated user...'
        )

        const userResponse =
          await axiosClient.get(
            '/auth/me'
          )

        const user =
          userResponse.data

        console.log(
          '✅ Authenticated user:',
          user
        )

        storeSession(
          user,
          accessToken,
          data?.refresh_token ?? null
        )

        console.log(
          '✅ Login completed successfully'
        )

        return user

      } catch (error) {
        console.error(
          '❌ Login failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.message ??
          'Login failed. Please try again.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    [storeSession]
  )

  // =====================================================
  // REGISTER
  // =====================================================

  const register = useCallback(
    async (payload) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '📝 Registration started'
        )

        await authService.register(
          payload
        )

        console.log(
          '✅ Registration successful'
        )

        return {
          email: payload.email,
        }

      } catch (error) {
        console.error(
          '❌ Registration failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Registration failed. Please try again.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOtp = useCallback(
    async (payload) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '🔢 OTP verification started'
        )

        await authService.verifyOtp({
          email: payload.email,
          otp: payload.otp,
          flow: payload.flow,
        })

        console.log(
          '✅ OTP verified successfully'
        )

        return true

      } catch (error) {
        console.error(
          '❌ OTP verification failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Invalid or expired OTP.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =====================================================
  // RESEND OTP
  // =====================================================

  const resendOtp = useCallback(
    async (payload) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '📧 Resending OTP'
        )

        await authService.resendOtp({
          email: payload.email,
        })

        console.log(
          '✅ OTP resent successfully'
        )

        return true

      } catch (error) {
        console.error(
          '❌ Resend OTP failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Failed to resend OTP.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =====================================================
  // FORGOT PASSWORD
  // =====================================================

  const forgotPassword = useCallback(
    async (payload) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '🔑 Forgot password request'
        )

        await authService.forgotPassword(
          payload
        )

        console.log(
          '✅ Password reset OTP sent'
        )

        return {
          email: payload.email,
        }

      } catch (error) {
        console.error(
          '❌ Forgot password failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Failed to send reset OTP.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const resetPassword = useCallback(
    async (payload) => {
      setIsLoading(true)
      setAuthError(null)

      try {
        console.log(
          '🔐 Reset password started'
        )

        await authService.resetPassword({
          email: payload.email,
          otp: payload.otp,
          new_password:
            payload.new_password,
        })

        console.log(
          '✅ Password reset successful'
        )

        return true

      } catch (error) {
        console.error(
          '❌ Reset password failed:',
          error
        )

        const message =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          'Failed to reset password.'

        setAuthError(message)

        throw error

      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = useCallback(() => {
    console.log(
      '🚪 Logging out user'
    )

    clearSession()

    console.log(
      '✅ Logout completed'
    )
  }, [clearSession])

  // =====================================================
  // Context Value
  // =====================================================

  const value = {
    currentUser,

    isAuthenticated:
      !!currentUser,

    isDemo: false,

    isLoading,
    authError,

    clearError,
    updateCurrentUser,

    login,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
  }

  // =====================================================
  // Provider
  // =====================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// =====================================================
// useAuth Hook
// =====================================================

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    )
  }

  return context
}

// =====================================================
// Default Export
// =====================================================

export default AuthContext