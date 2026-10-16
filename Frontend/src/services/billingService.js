import axiosClient from '../config/axiosClient'
const billingService = {
  // Create a new bill
  create: (data) => axiosClient.post('/billing', data),

  // Get bill history with pagination and filters
  getHistory: (params) => axiosClient.get('/billing/history', { params }),

  // Get single bill details by bill number
  getByBillNumber: (billNumber) => axiosClient.get(`/billing/${billNumber}`),
}

export default billingService
