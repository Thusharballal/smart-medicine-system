/**
 * medicineService – CRUD operations for the medicine catalogue.
 *
 * FastAPI endpoints (future):
 *   GET    /medicines               – list / search
 *   GET    /medicines/:id           – get single medicine
 *   GET    /medicines/:id/alternatives – Jan Aushadhi alternatives
 *   POST   /medicines               – create (admin/owner)
 *   PUT    /medicines/:id           – update (admin/owner)
 *   DELETE /medicines/:id           – soft-delete (admin)
 *   GET    /medicines/categories    – list categories
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS } from '../config/constants'
import { MEDICINES, JAN_AUSHADHI_ALTERNATIVES, CATEGORIES } from '../mocks/medicines'

const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms))

// ── Search / list ─────────────────────────────────────────────────────

/**
 * @param {{ q?, category?, type?, availability?, maxPrice?, sort?, page?, pageSize? }} params
 */
export async function searchMedicines(params = {}) {
  if (USE_MOCK) {
    await delay()
    const { q = '', category = 'All', type = 'All', availability = 'All', maxPrice = 10000, sort = 'name_asc', page = 1, pageSize = 9 } = params
    let list = [...MEDICINES]
    if (q) {
      const ql = q.toLowerCase()
      list = list.filter((m) =>
        m.name.toLowerCase().includes(ql) ||
        m.genericComposition.toLowerCase().includes(ql) ||
        (m.brandName ?? '').toLowerCase().includes(ql),
      )
    }
    if (category !== 'All') list = list.filter((m) => m.category === category)
    if (type !== 'All')     list = list.filter((m) => m.type === type)
    if (availability !== 'All') list = list.filter((m) => m.availability === availability)
    list = list.filter((m) => m.mrp <= maxPrice)
    list.sort((a, b) => {
      if (sort === 'name_asc')    return a.name.localeCompare(b.name)
      if (sort === 'name_desc')   return b.name.localeCompare(a.name)
      if (sort === 'price_asc')   return a.mrp - b.mrp
      if (sort === 'price_desc')  return b.mrp - a.mrp
      if (sort === 'savings_desc') return ((b.mrp - (b.janAushadhiPrice ?? b.mrp)) - (a.mrp - (a.janAushadhiPrice ?? a.mrp)))
      return 0
    })
    const total = list.length
    const start = (page - 1) * pageSize
    return { data: list.slice(start, start + pageSize), total, page, pageSize }
  }
  const { data } = await apiClient.get('/medicines', { params })
  return data
}

/**
 * @param {string} id
 */
export async function getMedicineById(id) {
  if (USE_MOCK) {
    await delay()
    const med = MEDICINES.find((m) => m.id === id)
    if (!med) { const e = new Error('Medicine not found.'); e.status = 404; throw e }
    return med
  }
  const { data } = await apiClient.get(`/medicines/${id}`)
  return data
}

/**
 * @param {string} brandedMedicineId
 */
export async function getAlternatives(brandedMedicineId) {
  if (USE_MOCK) {
    await delay(300)
    const alt = JAN_AUSHADHI_ALTERNATIVES[brandedMedicineId] ?? null
    return alt ? [alt] : []
  }
  const { data } = await apiClient.get(`/medicines/${brandedMedicineId}/alternatives`)
  return data
}

export async function getCategories() {
  if (USE_MOCK) { await delay(100); return CATEGORIES }
  const { data } = await apiClient.get('/medicines/categories')
  return data
}

// ── Autocomplete suggestions ──────────────────────────────────────────

export async function getSuggestions(query) {
  if (USE_MOCK) {
    await delay(150)
    if (!query || query.length < 3) return []
    const q = query.toLowerCase()
    return MEDICINES
      .filter((m) => m.name.toLowerCase().includes(q) || m.genericComposition.toLowerCase().includes(q))
      .slice(0, 8)
      .map((m) => ({ id: m.id, name: m.name, genericComposition: m.genericComposition, type: m.type }))
  }
  const { data } = await apiClient.get('/medicines/suggestions', { params: { q: query } })
  return data
}

// ── Admin / owner CRUD ────────────────────────────────────────────────

export async function createMedicine(payload) {
  if (USE_MOCK) {
    await delay()
    return { ...payload, id: `m_${Date.now()}`, type: 'branded', isInWatchlist: false }
  }
  const { data } = await apiClient.post('/medicines', payload)
  return data
}

export async function updateMedicine(id, payload) {
  if (USE_MOCK) {
    await delay()
    return { id, ...payload }
  }
  const { data } = await apiClient.put(`/medicines/${id}`, payload)
  return data
}

export async function deactivateMedicine(id) {
  if (USE_MOCK) {
    await delay()
    return { id, status: 'deactivated' }
  }
  const { data } = await apiClient.delete(`/medicines/${id}`)
  return data
}

export default {
  searchMedicines,
  getMedicineById,
  getAlternatives,
  getCategories,
  getSuggestions,
  createMedicine,
  updateMedicine,
  deactivateMedicine,
}
