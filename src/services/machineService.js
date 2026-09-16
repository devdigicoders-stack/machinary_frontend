import api from './api'

export const machineService = {
  // Get all machines with search, filters, pagination
  getMachines: async (params = {}) => {
    const response = await api.get('/machines', { params })
    return response.data
  },

  // Get single machine by ID
  getMachineById: async (id) => {
    const response = await api.get(`/machines/${id}`)
    return response.data
  },

  // Create new machine
  createMachine: async (machineData) => {
    const response = await api.post('/machines', machineData)
    return response.data
  },

  // Update existing machine
  updateMachine: async (id, machineData) => {
    const response = await api.put(`/machines/${id}`, machineData)
    return response.data
  },

  // Toggle machine status (Active <-> Inactive / Pending)
  toggleStatus: async (id, status) => {
    const response = await api.patch(`/machines/${id}/status`, status ? { status } : {})
    return response.data
  },

  // Delete machine by ID
  deleteMachine: async (id) => {
    const response = await api.delete(`/machines/${id}`)
    return response.data
  },

  // Bulk update status (Active / Inactive)
  bulkUpdateStatus: async (ids, status) => {
    const response = await api.post('/machines/bulk-status', { ids, status })
    return response.data
  },

  // Bulk delete machines
  bulkDelete: async (ids) => {
    const response = await api.post('/machines/bulk-delete', { ids })
    return response.data
  },
}
