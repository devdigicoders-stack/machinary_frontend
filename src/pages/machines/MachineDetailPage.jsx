import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  Tag,
  Truck,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit3,
  RefreshCw,
  ChevronRight,
  User,
  Phone,
  Fuel,
  Sparkles,
} from 'lucide-react'
import { machineService } from '../../services/machineService'
import { getImageUrl } from '../../utils/imageUtils'
import { Toast } from '../../components/common/Toast'

export default function MachineDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [machine, setMachine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const fetchMachine = async () => {
    try {
      setLoading(true)
      const res = await machineService.getMachineById(id)
      const data = res?.data || res
      setMachine(data)
    } catch (err) {
      console.error('Failed to load machine:', err)
      showToast(err?.response?.data?.message || 'Failed to load machine details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMachine()
    }
  }, [id])

  const handleStatusToggle = async () => {
    if (!machine) return
    const currentId = machine._id || machine.id
    const nextStatus = machine.status === 'Active' ? 'Inactive' : 'Active'
    try {
      setIsUpdating(true)
      const res = await machineService.toggleStatus(currentId, nextStatus)
      if (res.success) {
        showToast(`Machine status updated to "${nextStatus}"`)
        setMachine((prev) => ({ ...prev, status: nextStatus }))
      } else {
        showToast(res.message || 'Failed to update status')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#F5A623] animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading machine details...</p>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
          🚜
        </div>
        <h2 className="text-lg font-black text-slate-900">Machine Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested machinery record could not be found or has been removed.
        </p>
        <button
          onClick={() => navigate('/manage-machines')}
          className="px-5 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Machines</span>
        </button>
      </div>
    )
  }

  const isActive = machine.status === 'Active'
  const isAvailable = machine.availability === 'Available'
  const images = Array.isArray(machine.images) && machine.images.length > 0
    ? machine.images
    : machine.image ? [machine.image] : []

  const createdDate = machine.createdAt
    ? new Date(machine.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Toast message={toastMessage} />

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/manage-machines" className="hover:text-slate-700 transition-colors">
              Manage Machines
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold truncate max-w-[200px]">
              {machine.name || machine.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/manage-machines')}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
                <span>{machine.name || machine.title}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {machine.status || 'Active'}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isAvailable
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {machine.availability || 'Available'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Model: {machine.model || 'N/A'} • Registration: {machine.registrationNumber || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50 ${
              isActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isUpdating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isActive ? (
              <XCircle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            <span>{isActive ? 'Deactivate Machine' : 'Activate Machine'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Gallery, Specs & Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="relative h-80 bg-slate-900 flex items-center justify-center p-6">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[activeImageIndex] || images[0])}
                  alt={machine.name}
                  className="w-full h-full object-contain drop-shadow-xl"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="text-center text-slate-500 space-y-2">
                  <Truck className="w-16 h-16 mx-auto stroke-1" />
                  <p className="text-xs font-semibold">No Machinery Photos Available</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#F5A623] shadow-xs'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumb ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Machine Specifications & Details
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {machine.description || 'No detailed machinery description provided.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Category</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {machine.category?.name || machine.category || 'Heavy Equipment'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Manufacturing Year</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {machine.year || machine.manufacturingYear || '2023'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Rental Rate</span>
                  <span className="font-bold text-amber-600 text-sm">
                    ₹{machine.rentalRate || machine.hourlyRate || machine.price || 0} / hr
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Fuel Type</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {machine.fuelType || 'Diesel'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Engine Power</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {machine.enginePower || '130 HP'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-semibold block mb-0.5">Operating Weight</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {machine.operatingWeight || '21,500 kg'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Owner & Location */}
        <div className="space-y-6">
          {/* Owner Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#F5A623]" />
              <span>Assigned Machine Owner</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F5A623] to-amber-700 text-white font-black flex items-center justify-center shrink-0">
                  {(machine.owner?.name || 'OW').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-slate-900 truncate">
                    {machine.owner?.name || 'Verified Owner'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {machine.owner?.companyName || 'Independent Fleet'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>+91 {machine.owner?.phone || '9876543210'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{machine.location?.city || machine.location || 'India'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 text-xs">
            <h3 className="text-sm font-black text-slate-900">Machine Metadata</h3>
            <div className="divide-y divide-slate-100">
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Machine ID</span>
                <span className="font-mono text-slate-700 select-all font-bold">
                  {machine._id || machine.id}
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Listed Date</span>
                <span className="font-bold text-slate-800">{createdDate}</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Total Bookings</span>
                <span className="font-bold text-slate-800">{machine.totalBookings || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
