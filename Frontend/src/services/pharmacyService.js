/**
 * pharmacyService – pharmacy locator and owner operations.
 *
 * FastAPI endpoints (future):
 *   GET  /pharmacies                   – list pharmacies (with bbox / radius filter)
 *   GET  /pharmacies/:id               – single pharmacy
 *   POST /pharmacies                   – register pharmacy (owner)
 *   PUT  /pharmacies/:id               – update pharmacy (owner)
 *   GET  /pharmacies/:id/inventory     – inventory for a pharmacy
 *   PUT  /pharmacies/:id/inventory/:mid – update medicine availability (owner)
 *   GET  /pharmacies/verify/pending    – pending verifications (admin)
 *   POST /pharmacies/:id/verify        – approve/reject pharmacy (admin)
 */

import apiClient from './apiClient'
import { USE_MOCK, MOCK_DELAY_MS, DEFAULT_MAP_CENTER } from '../config/constants'

const delay = (ms = MOCK_DELAY_MS) => new Promise((r) => setTimeout(r, ms))

// ── Mock pharmacy data ────────────────────────────────────────────────
const MOCK_PHARMACIES = [
  { id: 'ph1', name: 'Jan Aushadhi Store – Sector 18', address: 'Shop 4, Sector 18 Market, Noida, UP 201301', lat: 28.5703, lng: 77.3219, operatingHours: '9:00 AM – 9:00 PM', contactNumber: '9876500001', medicineCount: 312, distanceKm: 0.8, isJanAushadhi: true, isVerified: true },
  { id: 'ph2', name: 'PMBJP Kendra – Connaught Place', address: 'F-12, Connaught Place, New Delhi 110001', lat: 28.6328, lng: 77.2197, operatingHours: '8:00 AM – 10:00 PM', contactNumber: '9876500002', medicineCount: 489, distanceKm: 1.4, isJanAushadhi: true, isVerified: true },
  { id: 'ph3', name: 'City Medical Store', address: '42, Lajpat Nagar – II, New Delhi 110024', lat: 28.5672, lng: 77.2350, operatingHours: '8:30 AM – 8:30 PM', contactNumber: '9876500003', medicineCount: 720, distanceKm: 2.1, isJanAushadhi: false, isVerified: true },
  { id: 'ph4', name: 'Jan Aushadhi Kendra – Dwarka', address: 'Sector 10, Dwarka, New Delhi 110075', lat: 28.5921, lng: 77.0460, operatingHours: '9:00 AM – 9:00 PM', contactNumber: '9876500004', medicineCount: 265, distanceKm: 3.5, isJanAushadhi: true, isVerified: true },
  { id: 'ph5', name: 'Wellness Pharmacy', address: '7, Saket District Centre, New Delhi 110017', lat: 28.5245, lng: 77.2066, operatingHours: '24 Hours', contactNumber: '9876500005', medicineCount: 950, distanceKm: 4.2, isJanAushadhi: false, isVerified: true },
  { id: 'ph6', name: 'PMBJP Store – Rohini', address: 'Sector 11, Rohini, New Delhi 110085', lat: 28.7196, lng: 77.1308, operatingHours: '9:00 AM – 8:00 PM', contactNumber: '9876500006', medicineCount: 198, distanceKm: 5.8, isJanAushadhi: true, isVerified: false },
  { id: 'ph7', name: 'Health First Pharmacy', address: '23, Karol Bagh, New Delhi 110005', lat: 28.6519, lng: 77.1909, operatingHours: '8:00 AM – 10:00 PM', contactNumber: '9876500007', medicineCount: 632, distanceKm: 6.3, isJanAushadhi: false, isVerified: true },
  { id: 'ph8', name: 'Jan Aushadhi – Laxmi Nagar', address: 'Main Market, Laxmi Nagar, Delhi 110092', lat: 28.6285, lng: 77.2787, operatingHours: '9:00 AM – 9:00 PM', contactNumber: '9876500008', medicineCount: 340, distanceKm: 7.1, isJanAushadhi: true, isVerified: true },
]

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Public: locator ───────────────────────────────────────────────────

export async function getNearbyPharmacies({ lat = DEFAULT_MAP_CENTER.lat, lng = DEFAULT_MAP_CENTER.lng, radiusKm = 5 } = {}) {
  if (USE_MOCK) {
    await delay()
    return MOCK_PHARMACIES
      .map((p) => ({ ...p, distanceKm: parseFloat(haversineKm(lat, lng, p.lat, p.lng).toFixed(2)) }))
      .filter((p) => p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }
  const { data } = await apiClient.get('/pharmacies', { params: { lat, lng, radius: radiusKm } })
  return data
}

export async function getPharmacyById(id) {
  if (USE_MOCK) {
    await delay(200)
    const p = MOCK_PHARMACIES.find((ph) => ph.id === id)
    if (!p) { const e = new Error('Pharmacy not found.'); e.status = 404; throw e }
    return p
  }
  const { data } = await apiClient.get(`/pharmacies/${id}`)
  return data
}

// ── Owner operations ──────────────────────────────────────────────────

export async function updatePharmacyProfile(id, payload) {
  if (USE_MOCK) { await delay(); return { id, ...payload } }
  const { data } = await apiClient.put(`/pharmacies/${id}`, payload)
  return data
}

export async function updateMedicineAvailability(pharmacyId, medicineId, availability) {
  if (USE_MOCK) { await delay(300); return { pharmacyId, medicineId, availability } }
  const { data } = await apiClient.put(`/pharmacies/${pharmacyId}/inventory/${medicineId}`, { availability })
  return data
}

export async function addMedicineToInventory(pharmacyId, payload) {
  if (USE_MOCK) { await delay(); return { id: `inv_${Date.now()}`, pharmacyId, ...payload } }
  const { data } = await apiClient.post(`/pharmacies/${pharmacyId}/inventory`, payload)
  return data
}

// ── Admin operations ──────────────────────────────────────────────────

export async function getPendingVerifications() {
  if (USE_MOCK) {
    await delay()
    return MOCK_PHARMACIES.filter((p) => !p.isVerified)
  }
  const { data } = await apiClient.get('/pharmacies/verify/pending')
  return data
}

export async function verifyPharmacy(id, approved, reason = '') {
  if (USE_MOCK) { await delay(); return { id, approved, reason } }
  const { data } = await apiClient.post(`/pharmacies/${id}/verify`, { approved, reason })
  return data
}

export { MOCK_PHARMACIES }
export default {
  getNearbyPharmacies,
  getPharmacyById,
  updatePharmacyProfile,
  updateMedicineAvailability,
  addMedicineToInventory,
  getPendingVerifications,
  verifyPharmacy,
}
