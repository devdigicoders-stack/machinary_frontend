import api from './api'

export const ownerService = {
  // Get all owners with search, filter, and pagination
  getOwners: async (params = {}) => {
    const response = await api.get('/owners', { params })
    return response.data
  },

  // Get single owner details by ID
  getOwnerById: async (id) => {
    const response = await api.get(`/owners/${id}`)
    return response.data
  },

  // Create new owner
  createOwner: async (ownerData) => {
    const response = await api.post('/owners', ownerData)
    return response.data
  },

  // Update existing owner
  updateOwner: async (id, ownerData) => {
    const response = await api.put(`/owners/${id}`, ownerData)
    return response.data
  },

  // Toggle owner status (Active <-> Inactive)
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/owners/${id}/status`, status ? { status } : {})
    return response.data
  },

  // Update owner KYC status (Pending, Verified, Rejected)
  updateKyc: async (id, kycStatus) => {
    const response = await api.patch(`/owners/${id}/kyc`, { kycStatus })
    return response.data
  },

  // Add note to owner
  addNote: async (id, text) => {
    const response = await api.post(`/owners/${id}/notes`, { text })
    return response.data
  },

  // Delete owner by ID
  deleteOwner: async (id) => {
    const response = await api.delete(`/owners/${id}`)
    return response.data
  },

  // Bulk update status (Active / Inactive)
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/owners/bulk-status', { ids, status })
    return response.data
  },

  // Bulk delete owners
  bulkDelete: async (ids) => {
    const response = await api.post('/owners/bulk-delete', { ids })
    return response.data
  },
}
