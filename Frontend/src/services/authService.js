import axiosClient from '../config/axiosClient'
const authService = {
  register: (data) =>
    axiosClient.post('/auth/register', data),
  registerPharmacy: (data) =>
    axiosClient.post('/pharmacies', data),
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials),
  getMe: () =>
    axiosClient.get('/auth/me'),
  verifyOtp: (data) =>
    axiosClient.post('/auth/verify-otp', data),
  resendOtp: (data) =>
    axiosClient.post('/auth/resend-otp', data),
  forgotPassword: (data) =>
    axiosClient.post('/auth/forgot-password', data),
  resetPassword: (data) =>
    axiosClient.post('/auth/reset-password', data),
  refreshToken: (data) =>
    axiosClient.post('/auth/refresh-token', data),
  logout: () =>
    axiosClient.post('/auth/logout'),

}
export default authService