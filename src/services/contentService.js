import api from './api'

export const contentService = {
  // 1. Get KPI Statistics
  getStats: async () => {
    const response = await api.get('/content/stats')
    return response.data
  },

  // 2. Get CMS Pages with query filters
  getPages: async (params = {}) => {
    const response = await api.get('/content', { params })
    return response.data
  },

  // 3. Create CMS Page
  createPage: async (pageData) => {
    const response = await api.post('/content', pageData)
    return response.data
  },

  // 4. Update CMS Page
  updatePage: async (id, pageData) => {
    const response = await api.put(`/content/${id}`, pageData)
    return response.data
  },

  // 5. Toggle Page Status (Published <-> Draft)
  toggleStatus: async (id) => {
    const response = await api.patch(`/content/${id}/status`)
    return response.data
  },

  // 6. Delete CMS Page
  deletePage: async (id) => {
    const response = await api.delete(`/content/${id}`)
    return response.data
  },

  // 7. Bulk Update Status
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/content/bulk-status', { ids, status })
    return response.data
  },

  // 8. Bulk Delete
  bulkDelete: async (ids) => {
    const response = await api.post('/content/bulk-delete', { ids })
    return response.data
  },
}
