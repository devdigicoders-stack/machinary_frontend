import api from './api'

export const uploadService = {
  // Upload single image file to backend local uploads folder (NOT Cloudinary)
  uploadImage: async (file, folder = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/upload/${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
