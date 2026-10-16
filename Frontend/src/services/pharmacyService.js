import axiosClient from '../config/axiosClient'
const pharmacyService = {
  // ============================================================
  // Nearby Pharmacies
  // ============================================================
  getNearby: (params) =>
    axiosClient.get(
      '/pharmacies/nearby',
      { params }
    ),
  // ============================================================
  // Pharmacy Search
  // ============================================================
  search: (params) =>
    axiosClient.get(
      '/pharmacies/search',
      { params }
    ),
  // ============================================================
  // Pharmacy By ID
  // ============================================================
  getById: (id) =>
    axiosClient.get(
      `/pharmacies/${id}`
    ),
  // ============================================================
  // Pharmacy Inventory
  // ============================================================
  getInventory: (id, params) =>
    axiosClient.get(
      `/pharmacies/${id}/inventory`,
      { params }
    ),
  // ============================================================
  // Create Pharmacy
  // ============================================================
  create: (data) =>
    axiosClient.post(
      '/pharmacies',
      data
    ),
  // ============================================================
  // Update Pharmacy
  // ============================================================
  update: (id, data) =>
    axiosClient.put(
      `/pharmacies/${id}`,
      data
    ),
  // ============================================================
  // Pharmacy Owner Profile
  // ============================================================
  getMyProfile: () =>
    axiosClient.get(
      '/pharmacies/me'
    ),
  updateProfile: (data) =>
    axiosClient.put(
      '/pharmacies/me',
      data
    ),
}
export default pharmacyService