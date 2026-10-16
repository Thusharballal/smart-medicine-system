import axiosClient from '../config/axiosClient'

const adminService = {
  // Pharmacy management
  getPharmacies: () =>
    axiosClient.get('/admin/pharmacies'),

  getPharmacyById: (pharmacyId) =>
    axiosClient.get(`/admin/pharmacies/${pharmacyId}`),

  approvePharmacy: (pharmacyId) =>
    axiosClient.put(`/admin/pharmacies/${pharmacyId}/approve`),

  rejectPharmacy: (pharmacyId) =>
    axiosClient.put(`/admin/pharmacies/${pharmacyId}/reject`),

  suspendPharmacy: (pharmacyId) =>
    axiosClient.put(`/admin/pharmacies/${pharmacyId}/suspend`),

  activatePharmacy: (pharmacyId) =>
    axiosClient.put(`/admin/pharmacies/${pharmacyId}/activate`),

  // User management
  getUsers: () =>
    axiosClient.get('/admin/users'),

  getUserById: (userId) =>
    axiosClient.get(`/admin/users/${userId}`),
}

export default adminService