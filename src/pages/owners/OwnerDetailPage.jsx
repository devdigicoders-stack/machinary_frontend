import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit3,
  RefreshCw,
  ChevronRight,
  User,
  Clock,
  Sparkles,
} from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { getAvatarUrl } from '../../utils/imageUtils'
import { Toast } from '../../components/common/Toast'

export default function OwnerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const fetchOwner = async () => {
    try {
      setLoading(true)
      const res = await ownerService.getOwnerById(id)
      const data = res?.data || res
      setOwner(data)
    } catch (err) {
      console.error('Failed to load owner:', err)
      showToast(err?.response?.data?.message || 'Failed to load owner details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchOwner()
    }
  }, [id])

  const handleStatusToggle = async () => {
    if (!owner) return
    const currentId = owner._id || owner.id
    const nextStatus = owner.status === 'Active' ? 'Inactive' : 'Active'
    try {
      setIsUpdating(true)
      const res = await ownerService.toggleStatus(currentId, nextStatus)
      if (res.success) {
        showToast(`Owner status updated to "${nextStatus}"`)
        setOwner((prev) => ({ ...prev, status: nextStatus }))
      } else {
        showToast(res.message || 'Failed to update status')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleKycToggle = async () => {
    if (!owner) return
    const currentId = owner._id || owner.id
    const nextKyc = owner.kycStatus === 'Verified' ? 'Pending' : 'Verified'
    try {
      setIsUpdating(true)
      const res = await ownerService.updateKycStatus(currentId, nextKyc)
      if (res.success) {
        showToast(`KYC status updated to "${nextKyc}"`)
        setOwner((prev) => ({ ...prev, kycStatus: nextKyc }))
      } else {
        showToast(res.message || 'Failed to update KYC status')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating KYC')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#F5A623] animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading owner profile...</p>
      </div>
    )
  }

  if (!owner) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-2xl">
          👤
        </div>
        <h2 className="text-lg font-black text-slate-900">Owner Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested equipment owner record could not be found.
        </p>
        <button
          onClick={() => navigate('/manage-owners')}
          className="px-5 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Owners</span>
        </button>
      </div>
    )
  }

  const isActive = owner.status === 'Active'
  const isKycVerified = owner.kycStatus === 'Verified'

  const joinDate = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Toast message={toastMessage} />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1.5">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/manage-owners" className="hover:text-slate-700 transition-colors">
              Manage Owners
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold truncate max-w-[200px]">
              {owner.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/manage-owners')}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2.5">
                <span>{owner.name}</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {owner.status || 'Active'}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isKycVerified
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  KYC {owner.kycStatus || 'Pending'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {owner.companyName || 'Independent Fleet Owner'} • Registered since {joinDate}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleKycToggle}
            disabled={isUpdating}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50 ${
              isKycVerified
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isKycVerified ? 'Revoke KYC' : 'Verify KYC'}</span>
          </button>

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
            <span>{isActive ? 'Deactivate Owner' : 'Activate Owner'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Overview & Contact Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Contact Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5A623] to-amber-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                {owner.avatar ? (
                  <img
                    src={getAvatarUrl(owner.avatar)}
                    alt={owner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(owner.name || 'OW').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-xl font-black text-slate-900 truncate">{owner.name}</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {owner.companyName || 'Heavy Equipment & Vehicle Supplier'}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>+91 {owner.phone}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{owner.email || 'No email provided'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>{owner.city || owner.location || 'India'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 font-semibold">Total Machines</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {owner.machinesCount || owner.totalMachines || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Listed in inventory</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 font-semibold">Active Listings</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {owner.activeListings || owner.machinesCount || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Available for hire</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400 font-semibold">Rating & Reviews</div>
                <div className="text-2xl font-black text-[#F5A623] mt-1">
                  ★ {owner.rating ? owner.rating.toFixed(1) : '5.0'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Verified platform owner</div>
              </div>
            </div>
          </div>

          {/* Business & Operational Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Business & Registration Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-1">Company / Firm</span>
                <span className="font-bold text-slate-800 text-sm">
                  {owner.companyName || 'Proprietorship / Individual'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-1">GST / Tax Number</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {owner.gstNumber || 'Not provided'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-1">Operating Hub</span>
                <span className="font-bold text-slate-800 text-sm">
                  {owner.address || owner.city || 'Pan India'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-semibold block mb-1">KYC Verification</span>
                <span className="font-bold text-slate-800 text-sm">
                  {owner.kycStatus === 'Verified' ? 'Aadhaar / Business Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Inventory Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
              <span>Owner Account Info</span>
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Account ID</span>
                <span className="font-mono text-slate-700 select-all font-bold">
                  {owner._id || owner.id}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Account Role</span>
                <span className="font-bold text-slate-800">Owner / Supplier</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Status</span>
                <span className={`font-black ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {owner.status || 'Active'}
                </span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Joined On</span>
                <span className="font-bold text-slate-800">{joinDate}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Fleet Inventory</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Manage machinery, heavy vehicles and earthmovers listed under this owner profile.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to={`/manage-machines?ownerId=${owner._id || owner.id}`}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold text-center transition-all cursor-pointer"
              >
                View Listed Machines
              </Link>
              <Link
                to="/manage-owners"
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black text-center transition-all cursor-pointer shadow-xs"
              >
                Back to All Owners
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
