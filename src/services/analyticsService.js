import api from './api'

export const analyticsService = {
  // 1. Get Overview Stats (KPIs)
  getOverview: async () => {
    const response = await api.get('/analytics/overview')
    return response.data
  },

  // 2. Get Growth Charts (Users, Listings, Revenue)
  getGrowth: async (params = {}) => {
    const response = await api.get('/analytics/growth', { params })
    return response.data
  },

  // 3. Get Top Categories
  getTopCategories: async () => {
    const response = await api.get('/analytics/top-categories')
    return response.data
  },

  // 4. Get Top Locations
  getTopLocations: async () => {
    const response = await api.get('/analytics/top-locations')
    return response.data
  },

  // 5. Get Listing Status Breakdown
  getListingStatus: async () => {
    const response = await api.get('/analytics/listing-status')
    return response.data
  },

  // 6. Get Recent Enquiries
  getRecentEnquiries: async () => {
    const response = await api.get('/analytics/recent-enquiries')
    return response.data
  },

  // 7. Get Top Performing Listings
  getTopListings: async () => {
    const response = await api.get('/analytics/top-listings')
    return response.data
  },

  // 8. Get User Types Distribution
  getUserTypes: async () => {
    const response = await api.get('/analytics/user-types')
    return response.data
  },
}
