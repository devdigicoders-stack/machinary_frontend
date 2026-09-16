import api from './api'

export const userService = {
  // 1. Get Unified User Statistics
  getStats: async () => {
    const response = await api.get('/users/stats')
    return response.data
  },

  // 2. Get Paginated and Filtered Users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // 3. Get Single User Details with real listings
  getUserById: async (id, userType) => {
    const response = await api.get(`/users/${id}`, { params: { userType } })
    return response.data
  },

  // 4. Create New User (Customer, Owner, or Admin)
  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // 5. Update Existing User
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  // 6. Update User Status (Active / Inactive / Blocked)
  updateStatus: async (id, status, userType) => {
    const response = await api.patch(`/users/${id}/status`, { status, userType })
    return response.data
  },

  // 7. Delete User
  deleteUser: async (id, userType) => {
    const response = await api.delete(`/users/${id}`, { params: { userType } })
    return response.data
  },
}
