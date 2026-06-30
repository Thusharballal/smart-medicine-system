/**
 * userService – user profile and preferences.
 *
 * FastAPI endpoints (future):
 *   GET  /users/me                  – current user profile
 *   PUT  /users/me                  – update profile
 *   POST /users/me/avatar           – upload avatar (multipart)
 *   GET  /users/me/watchlist        – get watchlist
 *   POST /users/me/watchlist        – add to watchlist
 *   DELETE /users/me/watchlist/:id  – remove from watchlist
 *   GET  /users/me/activity         – activity history
 *   GET  /users/me/savings          – savings summary
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS } from '../config/constants'
import { MOCK_PROFILE, MOCK_ACTIVITY } from '../mocks/userProfile'

const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms))

export async function getProfile() {
  if (USE_MOCK) { await delay(); return MOCK_PROFILE }
  const { data } = await apiClient.get('/users/me')
  return data
}

export async function updateProfile(payload) {
  if (USE_MOCK) { await delay(); return { ...MOCK_PROFILE, ...payload } }
  const { data } = await apiClient.put('/users/me', payload)
  return data
}

export async function uploadAvatar(file) {
  if (USE_MOCK) {
    await delay()
    return { avatarUrl: URL.createObjectURL(file) }
  }
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await apiClient.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getWatchlist() {
  if (USE_MOCK) { await delay(); return [] }
  const { data } = await apiClient.get('/users/me/watchlist')
  return data
}

export async function addToWatchlist(medicineId) {
  if (USE_MOCK) { await delay(200); return { medicineId, addedAt: new Date().toISOString() } }
  const { data } = await apiClient.post('/users/me/watchlist', { medicineId })
  return data
}

export async function removeFromWatchlist(medicineId) {
  if (USE_MOCK) { await delay(200); return { medicineId, removed: true } }
  const { data } = await apiClient.delete(`/users/me/watchlist/${medicineId}`)
  return data
}

export async function getActivityHistory({ page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK) {
    await delay()
    const start = (page - 1) * pageSize
    return { data: MOCK_ACTIVITY.slice(start, start + pageSize), total: MOCK_ACTIVITY.length }
  }
  const { data } = await apiClient.get('/users/me/activity', { params: { page, pageSize } })
  return data
}

export async function getSavingsSummary() {
  if (USE_MOCK) {
    await delay()
    return {
      totalSaved: 2960,
      monthlyBreakdown: [
        { month: 'Jan', saving: 320 }, { month: 'Feb', saving: 450 },
        { month: 'Mar', saving: 280 }, { month: 'Apr', saving: 620 },
        { month: 'May', saving: 510 }, { month: 'Jun', saving: 780 },
      ],
    }
  }
  const { data } = await apiClient.get('/users/me/savings')
  return data
}

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getActivityHistory,
  getSavingsSummary,
}
