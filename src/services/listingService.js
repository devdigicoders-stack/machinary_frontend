import api from './api'

export const listingService = {
  // --- Listings Core CRUD ---
  getListings: async (params = {}) => {
    const response = await api.get('/listings', { params })
    return response.data
  },

  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`)
    return response.data
  },

  createListing: async (listingData) => {
    const response = await api.post('/listings', listingData)
    return response.data
  },

  updateListing: async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData)
    return response.data
  },

  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`)
    return response.data
  },

  toggleListingStatus: async (id) => {
    const response = await api.patch(`/listings/${id}/status`)
    return response.data
  },

  updateListingStatus: async (id, status) => {
    const response = await api.put(`/listings/${id}`, { status })
    return response.data
  },

  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/listings/bulk-status', { ids, status })
    return response.data
  },

  bulkDeleteListings: async (ids) => {
    const response = await api.post('/listings/bulk-delete', { ids })
    return response.data
  },

  // --- Approvals Workflow ---
  getPendingApprovals: async (params = {}) => {
    const response = await api.get('/approvals/pending', { params })
    return response.data
  },

  approveListing: async (id) => {
    const response = await api.patch(`/approvals/${id}/approve`)
    return response.data
  },

  rejectListing: async (id, reasonData) => {
    const response = await api.patch(`/approvals/${id}/reject`, reasonData)
    return response.data
  },

  bulkApproveListings: async (ids) => {
    const response = await api.post('/approvals/bulk-approve', { ids })
    return response.data
  },

  bulkRejectListings: async (ids, reasonData) => {
    const response = await api.post('/approvals/bulk-reject', { ids, ...reasonData })
    return response.data
  },

  // --- Reports Management ---
  getReportedListings: async (params = {}) => {
    const response = await api.get('/reports', { params })
    return response.data
  },

  resolveReport: async (id, resolveData) => {
    const response = await api.patch(`/reports/${id}/resolve`, resolveData)
    return response.data
  },

  dismissReport: async (id) => {
    const response = await api.patch(`/reports/${id}/dismiss`)
    return response.data
  },

  delistReportedListing: async (id) => {
    const response = await api.patch(`/reports/${id}/delist`)
    return response.data
  },

  // --- Promoted & Featured Listings ---
  getPromotedListings: async (params = {}) => {
    const response = await api.get('/listings/promoted', { params })
    return response.data
  },

  addPromotion: async (promotionData) => {
    const response = await api.post('/listings/promoted', promotionData)
    return response.data
  },

  togglePromotionStatus: async (id) => {
    const response = await api.patch(`/listings/promoted/${id}/status`)
    return response.data
  },

  removePromotion: async (id) => {
    const response = await api.delete(`/listings/promoted/${id}`)
    return response.data
  },
}

export default listingService
