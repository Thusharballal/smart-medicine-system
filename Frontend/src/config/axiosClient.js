import axios from 'axios'
import env from './env'
import { STORAGE_KEYS } from '../constants/app'
import { ROUTES } from '../constants/routes'
import { storage } from '../utils/storage'
// ============================================================
// CREATE AXIOS CLIENT
// ============================================================
const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})
// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
axiosClient.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN)
    console.log(
      '🔑 AXIOS TOKEN:',
      token ? 'TOKEN FOUND' : 'NO TOKEN'
    )
    console.log(
      '🌐 AXIOS REQUEST:',
      `${config.baseURL || ''}${config.url || ''}`
    )
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Authorization header attached')
    } else {
      console.log('⚠️ No access token available')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
axiosClient.interceptors.response.use(
  (response) => {
    console.log(
      '✅ AXIOS RESPONSE:',
      response.status,
      response.config.url
    )

    return response
  },
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url
    console.error(
      '❌ AXIOS ERROR:',
      status || 'NETWORK ERROR',
      requestUrl || ''
    )

    if (status === 401) {
      const token = storage.get(
        STORAGE_KEYS.ACCESS_TOKEN
      )

      console.log(
        '🔐 401 received. Existing token:',
        token ? 'YES' : 'NO'
      )

      // Only expire an existing authenticated session.
      if (token) {
        storage.remove(
          STORAGE_KEYS.ACCESS_TOKEN
        )

        storage.remove(
          STORAGE_KEYS.REFRESH_TOKEN
        )

        storage.remove(
          STORAGE_KEYS.USER
        )

        const isAuthPage = [
          '/login',
          '/register',
          '/verify-otp',
          '/forgot-password',
          '/reset-password',
          ROUTES.SESSION_EXPIRED,
        ].some((path) =>
          window.location.pathname.startsWith(path)
        )

        if (!isAuthPage) {
          console.log(
            '⚠️ Session expired. Redirecting...'
          )

          window.location.href =
            ROUTES.SESSION_EXPIRED
        }
      }
    }

    return Promise.reject(error)
  }
)

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default axiosClient