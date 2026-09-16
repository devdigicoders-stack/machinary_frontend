import api from './api'

export const enquiryService = {
  // Get all enquiries with search, filter, and pagination
  getEnquiries: async (params = {}) => {
    const response = await api.get('/enquiries', { params })
    return response.data
  },

  // Get single enquiry by ID
  getEnquiryById: async (id) => {
    const response = await api.get(`/enquiries/${id}`)
    return response.data
  },

  // Create new enquiry
  createEnquiry: async (enquiryData) => {
    const response = await api.post('/enquiries', enquiryData)
    return response.data
  },

  // Update enquiry status (New, Contacted, Converted, Closed)
  updateStatus: async (id, status) => {
    const response = await api.patch(`/enquiries/${id}/status`, { status })
    return response.data
  },

  // Add note to enquiry
  addNote: async (id, text) => {
    const response = await api.post(`/enquiries/${id}/notes`, { text })
    return response.data
  },

  // Assign enquiry to executive
  assignExecutive: async (id, assignedTo) => {
    const response = await api.patch(`/enquiries/${id}/assign`, { assignedTo })
    return response.data
  },

  // Delete enquiry by ID
  deleteEnquiry: async (id) => {
    const response = await api.delete(`/enquiries/${id}`)
    return response.data
  },

  // Bulk update status
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/enquiries/bulk-status', { ids, status })
    return response.data
  },

  // Bulk delete enquiries
  bulkDelete: async (ids) => {
    const response = await api.post('/enquiries/bulk-delete', { ids })
    return response.data
  },
}
