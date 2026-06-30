/**
 * notificationService – in-app and push notification operations.
 *
 * FastAPI endpoints (future):
 *   GET    /notifications            – list user notifications
 *   PUT    /notifications/:id/read   – mark single as read
 *   PUT    /notifications/read-all   – mark all as read
 *   DELETE /notifications/:id        – delete single
 *   GET    /notifications/preferences – get user preferences
 *   PUT    /notifications/preferences – update user preferences
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS } from '../config/constants'
import { EXTENDED_NOTIFICATIONS } from '../mocks/userProfile'

const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms))

export async function getNotifications({ page = 1, pageSize = 20 } = {}) {
  if (USE_MOCK) {
    await delay()
    const start = (page - 1) * pageSize
    return {
      data: EXTENDED_NOTIFICATIONS.slice(start, start + pageSize),
      total: EXTENDED_NOTIFICATIONS.length,
    }
  }
  const { data } = await apiClient.get('/notifications', { params: { page, pageSize } })
  return data
}

export async function markNotificationRead(id) {
  if (USE_MOCK) { await delay(100); return { id, isRead: true } }
  const { data } = await apiClient.put(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  if (USE_MOCK) { await delay(300); return { success: true } }
  const { data } = await apiClient.put('/notifications/read-all')
  return data
}

export async function deleteNotification(id) {
  if (USE_MOCK) { await delay(100); return { id, deleted: true } }
  const { data } = await apiClient.delete(`/notifications/${id}`)
  return data
}

export async function getNotificationPreferences() {
  if (USE_MOCK) {
    await delay(100)
    return {
      emailNotifications: true,
      pushNotifications: true,
      priceAlerts: true,
      stockAlerts: true,
      medicineRecommendations: true,
      systemAnnouncements: true,
    }
  }
  const { data } = await apiClient.get('/notifications/preferences')
  return data
}

export async function updateNotificationPreferences(prefs) {
  if (USE_MOCK) { await delay(300); return { ...prefs, updatedAt: new Date().toISOString() } }
  const { data } = await apiClient.put('/notifications/preferences', prefs)
  return data
}

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
}
