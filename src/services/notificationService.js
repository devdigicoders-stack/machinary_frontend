import api from './api'

export const notificationService = {
  // 1. Get Notification Statistics
  getStats: async () => {
    const response = await api.get('/notifications/stats')
    return response.data
  },

  // 2. Get Notifications with filters
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  // 3. Create / Broadcast Notification
  createNotification: async (data) => {
    const response = await api.post('/notifications', data)
    return response.data
  },

  // 4. Resend Notification
  resendNotification: async (id) => {
    const response = await api.patch(`/notifications/${id}/resend`)
    return response.data
  },

  // 4b. Update Status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/notifications/${id}/status`, { status })
    return response.data
  },

  // 5. Delete Notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  // 6. Bulk Delete
  bulkDelete: async (ids) => {
    const response = await api.post('/notifications/bulk-delete', { ids })
    return response.data
  },

  // 7. Test FCM Push to all registered devices
  testPushNotification: async () => {
    const response = await api.post('/notifications/test-push')
    return response.data
  },
}

