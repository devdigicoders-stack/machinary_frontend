import React, { useState, useEffect } from 'react'
import { X, Upload, Check } from 'lucide-react'
import ImageUploadField from '../common/ImageUploadField'
import { categoryService } from '../../services/categoryService'

export function ListingFormModal({ isOpen, onClose, onSave, initialData = null }) {
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    type: 'Rent',
    rateOrPrice: '',
    rateUnit: 'per day',
    securityDeposit: 'N/A',
    minDuration: 'Flexible',
    operatorIncluded: false,
    modelYear: '2023',
    hoursUsed: '0 hrs',
    description: '',
    insuranceValidTill: 'N/A',
    rcNumber: '',
    ownerName: '',
    ownerPhone: '',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    image: '',
    status: 'Active',
    availability: 'Available Now',
  })

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true)
        const res = await categoryService.getCategories({ limit: 100 })
        const catList = res?.data?.categories || res?.data || []
        const names = catList.map((c) => c.name || c.title).filter(Boolean)
        setCategories(names)
        if (!formData.category && names.length > 0) {
          setFormData((prev) => ({ ...prev, category: names[0] }))
        }
      } catch (e) {
        console.error('Failed to load categories:', e)
        // Fallback default
        setCategories([
          'Backhoe Loaders',
          'Dump Trucks',
          'Excavators',
          'Wheel Loaders',
          'Cranes',
          'Road Rollers',
          'Concrete Equipment',
          'Generators',
        ])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCats()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        category: initialData.category || categories[0] || 'Backhoe Loaders',
        type: initialData.type || 'Rent',
        rateOrPrice: initialData.rateOrPrice || initialData.price || '',
        rateUnit: initialData.rateUnit || (initialData.type === 'Rent' ? 'per day' : ''),
        securityDeposit: initialData.securityDeposit || 'N/A',
        minDuration: initialData.minDuration || 'Flexible',
        operatorIncluded: Boolean(initialData.operatorIncluded),
        modelYear: initialData.modelYear || '2023',
        hoursUsed: initialData.hoursUsed || '0 hrs',
        description: initialData.description || '',
        insuranceValidTill: initialData.insuranceValidTill || 'N/A',
        rcNumber: initialData.rcNumber || '',
        ownerName: initialData.ownerName || initialData.owner || '',
        ownerPhone: initialData.ownerPhone || '',
        city: initialData.location?.city || (typeof initialData.location === 'string' ? initialData.location.split(',')[0]?.trim() : 'Lucknow'),
        state: initialData.location?.state || 'Uttar Pradesh',
        image: initialData.image || '',
        status: initialData.status || 'Active',
        availability: initialData.availability || 'Available Now',
      })
    } else {
      setFormData({
        title: '',
        subtitle: '',
        category: categories[0] || 'Backhoe Loaders',
        type: 'Rent',
        rateOrPrice: '',
        rateUnit: 'per day',
        securityDeposit: 'N/A',
        minDuration: 'Flexible',
        operatorIncluded: false,
        modelYear: '2023',
        hoursUsed: '0 hrs',
        description: '',
        insuranceValidTill: 'N/A',
        rcNumber: '',
        ownerName: '',
        ownerPhone: '',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        image: '',
        status: 'Active',
        availability: 'Available Now',
      })
    }
  }, [initialData, categories])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Please provide a listing title')
      return
    }
    if (!formData.rateOrPrice.trim()) {
      setError('Please provide price or rental rate')
      return
    }
    if (!formData.ownerName.trim() || !formData.ownerPhone.trim()) {
      setError('Owner name and phone number are required')
      return
    }

    try {
      setSaving(true)
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        category: formData.category || categories[0] || 'Backhoe Loaders',
        type: formData.type,
        rateOrPrice: formData.rateOrPrice.trim(),
        rateUnit: formData.type === 'Rent' ? formData.rateUnit : '',
        securityDeposit: formData.securityDeposit || 'N/A',
        minDuration: formData.minDuration || 'Flexible',
        operatorIncluded: formData.operatorIncluded,
        modelYear: formData.modelYear,
        hoursUsed: formData.hoursUsed,
        description: formData.description,
        insuranceValidTill: formData.insuranceValidTill,
        rcNumber: formData.rcNumber,
        ownerName: formData.ownerName.trim(),
        ownerPhone: formData.ownerPhone.trim(),
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          address: `${formData.city.trim()}, ${formData.state.trim()}`,
        },
        image: formData.image || '',
        images: formData.image ? [formData.image] : [],
        status: formData.status,
        availability: formData.availability,
      }

      await onSave(payload, initialData?._id || initialData?.id)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {initialData ? 'Edit Listing Details' : 'Create New Machine Listing'}
            </h3>
            <p className="text-xs text-slate-400">
              Fill all required details. Machinery will be added directly to MongoDB Atlas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Machine Image (Local Disk Upload via ImageUploadField) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Machine Image (Upload file to backend disk)
            </label>
            <ImageUploadField
              folder="listings"
              currentImage={formData.image}
              onImageUploaded={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Machine / Listing Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. JCB 3DX Backhoe Loader"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Subtitle / Condition summary
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. Well maintained, 2023 model, 1,400 hrs"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>
          </div>

          {/* Category & Listing Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
              >
                <option value="Rent">For Rent</option>
                <option value="Sale">For Sale</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
              >
                <option value="Available Now">Available Now</option>
                <option value="On Rent">On Rent</option>
                <option value="Sold">Sold</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          {/* Price / Rate & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {formData.type === 'Rent' ? 'Rent Rate (₹) *' : 'Sale Price (₹) *'}
              </label>
              <input
                type="text"
                required
                value={formData.rateOrPrice}
                onChange={(e) => setFormData({ ...formData, rateOrPrice: e.target.value })}
                placeholder={formData.type === 'Rent' ? 'e.g. 2,400' : 'e.g. 28,50,000'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            {formData.type === 'Rent' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rate Unit
                </label>
                <select
                  value={formData.rateUnit}
                  onChange={(e) => setFormData({ ...formData, rateUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                >
                  <option value="per day">per day</option>
                  <option value="per hour">per hour</option>
                  <option value="per month">per month</option>
                  <option value="per shift">per shift</option>
                </select>
              </div>
            )}
          </div>

          {/* Specs: Model Year, Hours Used, Security Deposit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model Year</label>
              <input
                type="text"
                value={formData.modelYear}
                onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                placeholder="2023"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hours / KM Run</label>
              <input
                type="text"
                value={formData.hoursUsed}
                onChange={(e) => setFormData({ ...formData, hoursUsed: e.target.value })}
                placeholder="1,200 hrs"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deposit</label>
              <input
                type="text"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                placeholder="₹ 15,000 or N/A"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>
          </div>

          {/* Owner Info & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Owner / Contractor Name *
              </label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Vikramaditya Sharma"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Owner Contact Phone *
              </label>
              <input
                type="text"
                required
                value={formData.ownerPhone}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Lucknow"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Uttar Pradesh"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>
          </div>

          {/* RC & Driver Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RC / Reg Number</label>
              <input
                type="text"
                value={formData.rcNumber}
                onChange={(e) => setFormData({ ...formData, rcNumber: e.target.value })}
                placeholder="UP32-AB-1234"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
              />
            </div>

            <div className="pt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="modalOpCheck"
                checked={formData.operatorIncluded}
                onChange={(e) => setFormData({ ...formData, operatorIncluded: e.target.checked })}
                className="rounded text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
              />
              <label htmlFor="modalOpCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Driver / Operator included with machine
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-lg shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {saving && <div className="animate-spin w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />}
              <span>{initialData ? 'Update Listing' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
