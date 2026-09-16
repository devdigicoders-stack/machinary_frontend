import api from './api'

export const locationService = {
  // 1. Get KPI statistics
  getStats: async () => {
    const response = await api.get('/locations/stats')
    return response.data
  },

  // 2. Get Countries
  getCountries: async (params = {}) => {
    const response = await api.get('/locations/countries', { params })
    return response.data
  },

  // 3. Get States for a country
  getStates: async (params = {}) => {
    const response = await api.get('/locations/states', { params })
    return response.data
  },

  // 4. Get Cities for a state
  getCities: async (params = {}) => {
    const response = await api.get('/locations/cities', { params })
    return response.data
  },

  // 5. Create Country
  createCountry: async (data) => {
    const response = await api.post('/locations/country', data)
    return response.data
  },

  // 6. Create State
  createState: async (data) => {
    const response = await api.post('/locations/state', data)
    return response.data
  },

  // 7. Create City
  createCity: async (data) => {
    const response = await api.post('/locations/city', data)
    return response.data
  },

  // 8. Update Location / City
  updateLocation: async (id, data) => {
    const response = await api.put(`/locations/${id}`, data)
    return response.data
  },

  // 9. Toggle City Status (Active <-> Inactive)
  toggleLocationStatus: async (id) => {
    const response = await api.patch(`/locations/${id}/status`)
    return response.data
  },

  // 10. Toggle State Status (Updates all cities in state)
  toggleStateStatus: async (stateName, status) => {
    const response = await api.patch(`/locations/state/${encodeURIComponent(stateName)}/status`, { status })
    return response.data
  },

  // 11. Delete City
  deleteLocation: async (id) => {
    const response = await api.delete(`/locations/${id}`)
    return response.data
  },

  // 12. Delete State
  deleteState: async (stateName) => {
    const response = await api.delete(`/locations/state/${encodeURIComponent(stateName)}`)
    return response.data
  },

  // 13. Import Locations (Batch)
  importLocations: async (items) => {
    const response = await api.post('/locations/import', { items })
    return response.data
  },
}
