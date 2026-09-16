import api from './api'

export const supportService = {
  // 1. Get Support Statistics
  getStats: async () => {
    const response = await api.get('/support/stats')
    return response.data
  },

  // 2. Get Support Tickets with filters & pagination
  getTickets: async (params = {}) => {
    const response = await api.get('/support', { params })
    return response.data
  },

  // 3. Create Ticket
  createTicket: async (data) => {
    const response = await api.post('/support', data)
    return response.data
  },

  // 4. Update Ticket Status
  updateStatus: async (id, status, author = 'Admin') => {
    const response = await api.patch(`/support/${id}/status`, { status, author })
    return response.data
  },

  // 5. Reassign Ticket
  reassignTicket: async (id, assignedTo, author = 'Admin') => {
    const response = await api.patch(`/support/${id}/reassign`, { assignedTo, author })
    return response.data
  },

  // 6. Add Message / Reply to Ticket
  sendMessage: async (id, text, sender = 'Support Admin') => {
    const response = await api.post(`/support/${id}/messages`, { text, sender, isStaff: true })
    return response.data
  },

  // 7. Delete Ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/support/${id}`)
    return response.data
  },
}
