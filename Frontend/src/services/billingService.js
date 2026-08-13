/**
 * Billing Service
 *
 * Handles all billing-related API calls.
 * Used by pharmacy dashboard billing and bill history modules.
 *
 * Endpoints:
 *  POST /billing                — create new bill
 *  GET  /billing/history        — get paginated bill history
 *  GET  /billing/:bill_number   — get single bill details
 */

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
