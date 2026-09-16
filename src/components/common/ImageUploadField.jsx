import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  RotateCcw,
} from 'lucide-react'
import { uploadService } from '../../services/uploadService'
import { getImageUrl } from '../../utils/imageUtils'

export function ImageUploadField({
  label = 'Image',
  value = '',
  currentImage = '',
  onChange,
  onImageUploaded,
  folder = 'general',
  required = false,
  helperText = 'PNG, JPG, WebP, SVG up to 10MB',
}) {
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)

  const activeValue = value || currentImage || ''
  const resolvedPreviewUrl = getImageUrl(activeValue)

  const notifyChange = (newVal) => {
    if (onChange) onChange(newVal)
    if (onImageUploaded) onImageUploaded(newVal)
  }

  // Process File Selection & Upload
  const handleFile = async (file) => {
    if (!file) return

    setErrorMessage('')

    // 1. File Type Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/jpg']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WebP, SVG).')
      return
    }

    // 2. File Size Validation (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB. Please choose a smaller image.')
      return
    }

    // 3. Upload to Backend
    setIsUploading(true)
    try {
      const response = await uploadService.uploadImage(file, folder)
      if (response.success && response.data?.url) {
        notifyChange(response.data.url)
      } else {
        setErrorMessage(response.message || 'Failed to upload image')
      }
    } catch (err) {
      console.error('File upload error:', err)
      setErrorMessage(
        err.response?.data?.message || 'Server error while uploading image. Please try again.'
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = (e) => {
    e.preventDefault()
    e.stopPropagation()
    notifyChange('')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-1.5">
      {/* Label & URL Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-medium text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Use file picker' : 'Paste URL instead'}</span>
        </button>
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* URL Input Fallback (if user toggled it) */}
      {showUrlInput ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={activeValue || ''}
              onChange={(e) => notifyChange(e.target.value)}
              placeholder="https://example.com/image.jpg or /uploads/..."
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
            />
            {activeValue && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Clear URL"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {resolvedPreviewUrl && (
            <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={resolvedPreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* File Picker & Upload Dropzone */
        <div>
          {activeValue ? (
            /* Selected Image Preview Card */
            <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50/70 flex items-center gap-3 group transition-all hover:border-slate-300">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white relative shadow-2xs flex items-center justify-center">
                {resolvedPreviewUrl ? (
                  <img
                    src={resolvedPreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '🖼️'
                    }}
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-300" />
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-xs">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Details & Actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    {activeValue.startsWith('/uploads/')
                      ? activeValue.split('/').pop()
                      : activeValue.length > 35
                      ? activeValue.substring(0, 35) + '...'
                      : activeValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saved to backend upload storage
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Change Image
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Box */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#F5A623] bg-amber-500/10'
                  : 'border-slate-200 hover:border-[#F5A623] hover:bg-amber-500/5'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-[#F5A623] flex items-center justify-center">
                  {isUploading ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-[#F5A623]" />
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {isUploading ? (
                      'Uploading to backend disk...'
                    ) : (
                      <>
                        <span className="text-[#D98200] font-extrabold hover:underline">
                          Click to browse
                        </span>{' '}
                        or drag & drop
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUploadField
