import api from './api'

export const customerService = {
  // Get all customers with search, filter, and pagination
  getCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params })
    return response.data
  },

  // Get single customer details by ID
  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData)
    return response.data
  },

  // Update existing customer
  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData)
    return response.data
  },

  // Toggle customer status (Active <-> Inactive)
  toggleStatus: async (id) => {
    const response = await api.patch(`/customers/${id}/status`)
    return response.data
  },

  // Delete customer by ID
  deleteCustomer: async (id) => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  },

  // Bulk delete customers
  bulkDelete: async (ids) => {
    const response = await api.post('/customers/bulk-delete', { ids })
    return response.data
  },

  // Bulk update status (Active / Inactive)
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/customers/bulk-status', { ids, status })
    return response.data
  },
}
