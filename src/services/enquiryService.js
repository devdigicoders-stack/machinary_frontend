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

  // Assign enquiry to executive (Internal Staff)
  assignExecutive: async (id, assignedTo) => {
    const response = await api.patch(`/enquiries/${id}/assign`, { assignedTo })
    return response.data
  },

  // Assign enquiry directly to Seller (triggers FCM push notification to seller)
  assignToSeller: async (id, sellerData) => {
    const response = await api.patch(`/enquiries/${id}/assign-seller`, sellerData)
    return response.data
  },

  // Bulk assign multiple enquiries to Seller
  bulkAssignToSeller: async (data) => {
    const response = await api.post('/enquiries/bulk-assign-seller', data)
    return response.data
  },

  // Get matching sellers for category / machine
  getMatchingSellers: async (params = {}) => {
    const response = await api.get('/enquiries/matching-sellers', { params })
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
