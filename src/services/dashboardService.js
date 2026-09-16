import api from './api'

export const dashboardService = {
  // 1. Get Live KPI Stats & Notification Badges
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // 2. Get Listings Overview Chart Data by Range (7d, 30d, quarter, year)
  getChartData: async (range = '30d') => {
    const response = await api.get('/dashboard/chart', {
      params: { range },
    })
    return response.data
  },

  // 3. Get Recent Listings
  getRecentListings: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-listings', {
      params: { limit },
    })
    return response.data
  },

  // 4. Get Recent Customers
  getRecentCustomers: async (limit = 5) => {
    const response = await api.get('/dashboard/recent-customers', {
      params: { limit },
    })
    return response.data
  },
}
