import axiosClient from '../config/axiosClient'

const inventoryService = {
  getAll: (params) => axiosClient.get('/inventory', { params }),

  create: (data) => axiosClient.post('/inventory', data),

  update: (id, data) => axiosClient.put(`/inventory/${id}`, data),

  remove: (id) => axiosClient.delete(`/inventory/${id}`),
}

export default inventoryService
