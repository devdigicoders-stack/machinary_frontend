import React, { useState } from 'react'
import { X, Mail, Phone, Calendar, User, MapPin, Home, Shield, Clock, Package, FileText, CheckCircle2, AlertCircle, Camera, Loader2 } from 'lucide-react'

const statusStyles = {
  Active:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Inactive: { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
  Blocked:  { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
}

const userTypeStyles = {
  Customer: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  Owner:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  Admin:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

function Avatar({ name = '', src, size = 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-sm'
  if (src && (src.startsWith('http') || src.startsWith('/uploads'))) {
    const fullSrc = src.startsWith('/uploads') ? `http://localhost:5000${src}` : src
    return (
      <img
        src={fullSrc}
        alt={name}
        className={`${sz} rounded-2xl object-cover shrink-0 border border-slate-200 shadow-2xs`}
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = 'none'
        }}
      />
    )
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'bg-amber-100 text-amber-800 border-amber-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-rose-100 text-rose-800 border-rose-200',
  ]
  const color = colors[(name ? name.charCodeAt(0) : 0) % colors.length]

  return (
    <div className={`${sz} rounded-2xl flex items-center justify-center font-bold border ${color} shrink-0 shadow-2xs`}>
      {initials}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-500">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
        <div className="text-xs font-semibold text-slate-800 mt-0.5 break-words">{value || 'N/A'}</div>
      </div>
    </div>
  )
}

export function UserProfilePanel({
  user,
  onClose,
  onEdit,
  onToggleStatus,
  onToggleBlock,
  onUploadAvatar,
}) {
  const [activeTab, setActiveTab] = useState('Details')
  const [isUploading, setIsUploading] = useState(false)

  if (!user) return null

  const sStyle = statusStyles[user.status] || statusStyles.Active
  const utStyle = userTypeStyles[user.userType] || userTypeStyles.Customer
  const listings = user.listings || []

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onUploadAvatar) return
    setIsUploading(true)
    try {
      await onUploadAvatar(user, file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
          <span className="text-sm font-black text-slate-900">User Profile Details</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Summary Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3.5 bg-white">
          <div className="relative group shrink-0">
            <Avatar name={user.name} src={user.avatar} size="lg" />
            {onUploadAvatar && (
              <label
                title="Change Photo"
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white shadow-md"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-slate-900 leading-snug truncate">{user.name}</h3>
            {user.businessName && (
              <p className="text-xs text-slate-500 truncate">{user.businessName}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${utStyle.bg} ${utStyle.text} ${utStyle.border}`}>
                {user.userType}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                {user.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Joined on {user.joinedOn}</p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-2">
          {[
            { key: 'Details', label: 'Details' },
            { key: 'Listings', label: `Listings (${listings.length || user.listingsCount || 0})` },
            { key: 'Activity', label: 'Activity' },
            { key: 'Documents', label: 'KYC & Docs' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-[#F5A623] text-[#D98200]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'Details' && (
            <>
              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Personal Information</h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 space-y-2.5">
                  <InfoRow icon={User} label="Full Name" value={user.name} />
                  <InfoRow icon={Mail} label="Email Address" value={user.email} />
                  <InfoRow icon={Phone} label="Phone Number" value={user.phone} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={user.dob || 'Not specified'} />
                  <InfoRow icon={User} label="Gender" value={user.gender || 'Not specified'} />
                  <InfoRow icon={MapPin} label="Location" value={user.location || `${user.city || ''}, ${user.state || ''}`} />
                  <InfoRow icon={Home} label="Full Address" value={user.address || user.location || 'India'} />
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Overview</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Role Type</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{user.userType}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md mt-1 inline-block border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-500" />
                      KYC Status
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {user.kycStatus || 'Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Registration Date
                    </span>
                    <span className="font-semibold text-slate-700">{user.joinedOn}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Active Machines/Listings
                    </span>
                    <span className="font-bold text-slate-800">{user.listingsCount || 0}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Listings' && (
            <div className="space-y-3">
              {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No Listings Recorded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">This user currently has 0 published machine listings.</p>
                </div>
              ) : (
                listings.map((lst, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-[#F5A623] shrink-0 font-bold text-xs">
                      {lst.machineType ? lst.machineType.slice(0, 2).toUpperCase() : 'MC'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{lst.title}</h5>
                      <p className="text-[11px] text-slate-500">{lst.category || lst.machineType} • {lst.status || 'Active'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="space-y-3 text-xs">
              <div className="flex gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                  <span className="font-bold text-slate-800">Account Created</span>
                  <span className="text-slate-400 ml-1.5 text-[10px]">{user.joinedOn}</span>
                  <p className="text-[11px] text-slate-500 mt-1">Profile registered with verified email {user.email}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex-1">
                  <span className="font-bold text-slate-800">Status Active</span>
                  <p className="text-[11px] text-slate-500 mt-1">User account is in good standing.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Identity Verification (KYC)</div>
                    <div className="text-[10px] text-slate-400">Government ID & Business registration</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {user.kycStatus || 'Verified'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex-1 py-2 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 bg-white rounded-xl cursor-pointer transition-colors shadow-2xs"
          >
            Edit Profile
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(user)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs ${
              user.status === 'Active'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>

          <button
            type="button"
            onClick={() => onToggleBlock(user)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs ${
              user.status === 'Blocked'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {user.status === 'Blocked' ? 'Unblock' : 'Block User'}
          </button>
        </div>
      </div>
    </div>
  )
}
