/**
 * Helper to construct full image URL for locally served files in /uploads or external URLs
 */
export const getImageUrl = (imagePath, fallback = '') => {
  if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
    return fallback
  }

  const trimmed = imagePath.trim()

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${serverUrl}${cleanPath}`
}
