/**
 * adminService – administrator platform management.
 *
 * FastAPI endpoints (future):
 *   GET  /admin/stats                – dashboard summary
 *   GET  /admin/users                – user list (paginated)
 *   PUT  /admin/users/:id/status     – activate/deactivate
 *   PUT  /admin/users/:id/role       – change role
 *   GET  /admin/pharmacies           – all pharmacies
 *   GET  /admin/medicines            – medicine catalogue admin
 *   GET  /admin/analytics            – platform analytics
 *   GET  /admin/health               – system health
 *   GET  /admin/logs                 – activity logs
 *   GET  /admin/reports/:type        – generate report
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS } from '../config/constants'

const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms))

// ── Dashboard stats ───────────────────────────────────────────────────

export async function getDashboardStats() {
  if (USE_MOCK) {
    await delay()
    return {
      totalUsers: 25847,
      totalPharmacies: 9500,
      totalMedicines: 10847,
      activeUsers: 18234,
      pendingVerifications: 47,
      totalSearches: 142_300,
      systemHealth: 99.2,
      monthlyRevenue: 0, // platform is free – for future monetisation
    }
  }
  const { data } = await apiClient.get('/admin/stats')
  return data
}

// ── User management ───────────────────────────────────────────────────

export async function getUsers({ q = '', role = 'all', status = 'all', page = 1, pageSize = 25 } = {}) {
  if (USE_MOCK) {
    await delay()
    return {
      data: MOCK_ADMIN_USERS.filter((u) => {
        const matchQ = !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
        const matchRole = role === 'all' || u.role === role
        const matchStatus = status === 'all' || u.status === status
        return matchQ && matchRole && matchStatus
      }).slice((page - 1) * pageSize, page * pageSize),
      total: MOCK_ADMIN_USERS.length,
    }
  }
  const { data } = await apiClient.get('/admin/users', { params: { q, role, status, page, pageSize } })
  return data
}

export async function updateUserStatus(id, status) {
  if (USE_MOCK) { await delay(); return { id, status } }
  const { data } = await apiClient.put(`/admin/users/${id}/status`, { status })
  return data
}

export async function updateUserRole(id, role) {
  if (USE_MOCK) { await delay(); return { id, role } }
  const { data } = await apiClient.put(`/admin/users/${id}/role`, { role })
  return data
}

// ── System health ─────────────────────────────────────────────────────

export async function getSystemHealth() {
  if (USE_MOCK) {
    await delay(200)
    return {
      apiStatus: 'healthy',
      dbStatus: 'healthy',
      activeSessions: 1247,
      p95ResponseMs: 142,
      errorRatePct: 0.3,
      uptime: '99.98%',
    }
  }
  const { data } = await apiClient.get('/admin/health')
  return data
}

// ── Mock data ─────────────────────────────────────────────────────────
const MOCK_ADMIN_USERS = Array.from({ length: 50 }, (_, i) => ({
  id: `u${i + 1}`,
  name: ['Priya Sharma', 'Rahul Kumar', 'Anjali Singh', 'Vikram Patel', 'Sunita Devi'][i % 5],
  email: `user${i + 1}@demo.com`,
  role: ['user', 'pharmacy_owner', 'user', 'user', 'pharmacy_owner'][i % 5],
  status: i % 7 === 0 ? 'inactive' : 'active',
  registeredAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
}))

export default {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getSystemHealth,
}
