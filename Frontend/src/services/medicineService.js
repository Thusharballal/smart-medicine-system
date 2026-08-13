/**
 * Medicine Service
 *
 * Handles medicine master API calls.
 */

import axiosClient from '../config/axiosClient'

const medicineService = {
  // Get all medicines
  getAll: () =>
    axiosClient.get('/medicines'),

  // Get a single medicine
  getById: (id) =>
    axiosClient.get(`/medicines/${id}`),

  // Search medicines
  search: (query) =>
    axiosClient.get('/medicines/search', {
      params: {
        q: query,
      },
    }),

  // Get generic / Jan Aushadhi alternative
  getAlternative: (id) =>
    axiosClient.get(`/medicines/alternatives/${id}`),

  // Create a new medicine
  create: (data) =>
    axiosClient.post('/medicines', data),

  // Update medicine
  update: (id, data) =>
    axiosClient.put(`/medicines/${id}`, data),

  // Archive medicine
  archive: (id) =>
    axiosClient.patch(`/medicines/${id}/archive`),

  // Restore medicine
  restore: (id) =>
    axiosClient.patch(`/medicines/${id}/restore`),

  // Permanently delete medicine
  remove: (id) =>
    axiosClient.delete(`/medicines/${id}`),
}
export default medicineService