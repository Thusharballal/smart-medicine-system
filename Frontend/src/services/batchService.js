/**
 * Batch Service
 *
 * Handles pharmacy inventory batch API calls.
 */

import axiosClient from '../config/axiosClient'

const batchService = {
  // Add a new medicine batch
  create: (data) =>
    axiosClient.post('/batches', data),

  // Get all active batches
  getAll: () =>
    axiosClient.get('/batches'),

  // Get a single batch
  getById: (id) =>
    axiosClient.get(`/batches/${id}`),

  // Search batches
  search: (query) =>
    axiosClient.get('/batches/search', {
      params: { query },
    }),

  // Update batch
  update: (id, data) =>
    axiosClient.put(`/batches/${id}`, data),

  // Archive batch
  archive: (id) =>
    axiosClient.delete(`/batches/${id}`),

  // Restore archived batch
  restore: (id) =>
    axiosClient.patch(`/batches/restore/${id}`),
}

export default batchService