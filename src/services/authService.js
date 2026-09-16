import api from './api'

export const authService = {
  // Login Admin
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data?.data?.token) {
      localStorage.setItem('adminToken', response.data.data.token)
      localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin))
    }
    return response.data
  },

  // Register Admin
  register: async (adminData) => {
    const response = await api.post('/auth/register', adminData)
    return response.data
  },

  // Get Admin Profile
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    if (response.data?.data) {
      localStorage.setItem('adminUser', JSON.stringify(response.data.data))
    }
    return response.data
  },

  // Update Admin Profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    if (response.data?.data) {
      localStorage.setItem('adminUser', JSON.stringify(response.data.data))
      window.dispatchEvent(new Event('admin-profile-updated'))
    }
    return response.data
  },

  // Upload Profile Avatar (Dynamic local disk upload, NOT Cloudinary)
  uploadAvatar: async (formData) => {
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.data?.data?.admin) {
      localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin))
      window.dispatchEvent(new Event('admin-profile-updated'))
    }
    return response.data
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  // Logout other sessions
  logoutOtherSessions: async () => {
    const response = await api.post('/auth/logout-other-sessions')
    return response.data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
  },

  // Helpers
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('adminUser')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  getToken: () => {
    return localStorage.getItem('adminToken')
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('adminToken'))
  },
}

// Helper to construct full avatar URL for locally served files
export const getAvatarUrl = (avatar) => {
  if (!avatar) return null
  if (
    avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:') ||
    avatar.startsWith('blob:')
  ) {
    return avatar
  }
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
  return `${serverUrl}${avatar.startsWith('/') ? '' : '/'}${avatar}`
}
