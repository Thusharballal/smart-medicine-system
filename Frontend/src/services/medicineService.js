/**
 * Medicine Service
 *
 * Handles all medicine search and recommendation API calls.
 * This is the core service for the Janaushadhi recommendation feature.
 *
 * Endpoints:
 *  GET  /medicines/search          — search by name / composition
 *  GET  /medicines/:id             — medicine detail
 *  GET  /medicines/alternatives/:id — generic / Janaushadhi alternatives
 *  GET  /medicines                 — list all (admin / pharmacy)
 *  POST /medicines                 — create medicine (admin)
 *  PUT  /medicines/:id             — update medicine (admin)
 *  DELETE /medicines/:id           — delete medicine (admin)
 */

import axiosClient from '../config/axiosClient'

const medicineService = {
  search: (params) => axiosClient.get('/medicines/search', { params }),

  getById: (id) => axiosClient.get(`/medicines/${id}`),

  getAlternatives: (id) => axiosClient.get(`/medicines/alternatives/${id}`),

  getAll: (params) => axiosClient.get('/medicines', { params }),

  create: (data) => axiosClient.post('/medicines', data),

  update: (id, data) => axiosClient.put(`/medicines/${id}`, data),

  remove: (id) => axiosClient.delete(`/medicines/${id}`),
}

export default medicineService
