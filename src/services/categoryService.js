import api from './api'

export const categoryService = {
  // Get all categories with search, filter, sorting, pagination
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params })
    return response.data
  },

  // Get single category by ID
  getCategoryById: async (id) => {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  // Create new category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData)
    return response.data
  },

  // Update existing category
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData)
    return response.data
  },

  // Toggle category status (Active <-> Inactive)
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/categories/${id}/status`, status ? { status } : {})
    return response.data
  },

  // Delete category by ID
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },

  // Bulk update status (Active / Inactive)
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/categories/bulk-status', { ids, status })
    return response.data
  },

  // Bulk delete categories
  bulkDelete: async (ids) => {
    const response = await api.post('/categories/bulk-delete', { ids })
    return response.data
  },
}
