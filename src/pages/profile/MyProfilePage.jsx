import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, Pencil, Mail, Phone, Calendar, Clock, MapPin,
  Lock, Bell, Settings, User, Shield, Image, Upload, Trash2,
  Camera, ChevronDown, CheckCircle2, RefreshCw
} from 'lucide-react'
import { Toast } from '../../components/common/Toast'
import { authService, getAvatarUrl } from '../../services/authService'

// ─── Avatar with camera overlay ─────────────────────────────────────────────
function ProfileAvatar({ size = 'xl', avatarUrl, name = 'AD', onUploadClick, isUploading = false }) {
  const sz = size === 'xl' ? 'w-28 h-28' : 'w-12 h-12'
  const initials = (name || 'AD').slice(0, 2).toUpperCase()
  const resolvedUrl = getAvatarUrl(avatarUrl)

  return (
    <div className="relative inline-block">
      <div className={`${sz} rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-[#F5A623] to-amber-700 flex items-center justify-center text-white font-black text-2xl select-none relative`}>
        {resolvedUrl ? (
          <img
            src={resolvedUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>
      {size === 'xl' && (
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          title="Change Profile Photo"
          className="absolute bottom-1 right-1 w-8 h-8 bg-[#F5A623] rounded-full flex items-center justify-center shadow-md hover:bg-[#E09400] cursor-pointer border-2 border-white transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
        </button>
      )}
    </div>
  )
}

// ─── Input Field ─────────────────────────────────────────────────────────────
function FormInput({ label, value, onChange, type = 'text', disabled, icon, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 text-xs border rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#F5A623] focus:border-[#F5A623] ${
            disabled ? 'bg-slate-50 text-slate-500 cursor-default' : 'bg-white'
          } ${icon ? 'pr-9' : ''}`}
        />
        {icon && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function FormSelect({ label, value, onChange, disabled, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-3 py-2.5 text-xs border rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#F5A623] focus:border-[#F5A623] appearance-none ${
            disabled ? 'bg-slate-50 text-slate-500 cursor-default' : 'bg-white cursor-pointer'
          }`}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-[#F5A623]">
          <Icon className="w-4 h-4 stroke-[2]" />
        </div>
        <h2 className="text-sm font-black text-slate-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Quick Action Item ────────────────────────────────────────────────────────
function QuickActionItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
        active
          ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F5A623]/30'
          : 'text-slate-600 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#F5A623]' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MyProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [toastMessage, setToastMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [activeAction, setActiveAction] = useState('Edit Profile')

  // Original Profile Snapshot (to restore on cancel)
  const [originalProfile, setOriginalProfile] = useState(null)

  // Dynamic Profile States
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('15 Aug 1995')
  const [gender, setGender] = useState('Male')
  const [location, setLocation] = useState('Lucknow, Uttar Pradesh')
  const [role, setRole] = useState('Super Admin')
  const [status, setStatus] = useState('Active')
  const [avatar, setAvatar] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Populate data helper
  const populateData = (data) => {
    if (!data) return
    setFullName(data.name || '')
    setEmail(data.email || '')
    setPhone(data.phone || '')
    setDob(data.dob || '15 Aug 1995')
    setGender(data.gender || 'Male')
    setLocation(data.location || 'Lucknow, Uttar Pradesh')
    setRole(data.role || 'Super Admin')
    setStatus(data.status || 'Active')
    setAvatar(data.avatar || '')
    setCreatedAt(data.createdAt || '')

    setOriginalProfile(data)
  }

  // Fetch real profile from MongoDB API
  useEffect(() => {
    const cached = authService.getCurrentUser()
    if (cached) populateData(cached)

    authService
      .getProfile()
      .then((res) => {
        if (res.data) {
          populateData(res.data)
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
      })
  }, [])

  // Save Personal Information
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await authService.updateProfile({
        name: fullName,
        phone,
        dob,
        gender,
        location,
      })
      setIsSaving(false)
      setIsEditing(false)
      if (response.data) {
        populateData(response.data)
      }
      showToast('Personal information updated successfully in database!')
    } catch (error) {
      setIsSaving(false)
      showToast(error.response?.data?.message || 'Failed to update profile')
    }
  }

  // Cancel Edit
  const handleCancel = () => {
    if (originalProfile) {
      populateData(originalProfile)
    }
    setIsEditing(false)
  }

  // Dynamic Photo Upload Handler (Multipart Form Data to backend /uploads/profiles, NOT Cloudinary)
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5 MB')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    setIsUploadingPhoto(true)
    try {
      const response = await authService.uploadAvatar(formData)
      setIsUploadingPhoto(false)
      if (response?.data?.avatar) {
        setAvatar(response.data.avatar)
        if (response.data.admin) {
          populateData(response.data.admin)
        }
      }
      showToast('Profile photo uploaded and saved locally in backend uploads folder!')
    } catch (error) {
      setIsUploadingPhoto(false)
      showToast(error.response?.data?.message || 'Failed to upload photo')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove Photo Handler
  const handleRemovePhoto = async () => {
    try {
      await authService.updateProfile({ avatar: '' })
      setAvatar('')
      showToast('Profile photo removed successfully.')
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove photo')
    }
  }

  // Format joining date
  const formattedJoiningDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '16 Sep 2026'

  return (
    <div className="space-y-5">
      <Toast message={toastMessage} />

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Breadcrumb & Title Bar */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">My Profile</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              My Profile
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
              View and manage your personal information, account settings and preferences.
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditing(!isEditing)
              if (!isEditing) showToast('Edit mode enabled. You can now modify fields.')
            }}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#F5A623] hover:bg-[#E09400] text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-[#F5A623]/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <Pencil className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5 flex flex-col items-center text-center">
            <ProfileAvatar
              size="xl"
              avatarUrl={avatar}
              name={fullName}
              onUploadClick={() => fileInputRef.current?.click()}
              isUploading={isUploadingPhoto}
            />
            <h2 className="mt-4 text-base font-black text-slate-900">{fullName || 'Super Admin'}</h2>
            <span className="mt-1.5 inline-block px-3 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-full">
              {role || 'Super Admin'}
            </span>
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[11px] font-bold text-emerald-700">{status || 'Active'}</span>
            </div>

            {/* Contact Info */}
            <div className="w-full mt-5 space-y-2.5 text-left border-t border-slate-100 pt-4">
              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-slate-400">Email</div>
                  <div className="text-xs font-medium text-slate-800 truncate">{email}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-slate-400">Phone</div>
                  <div className="text-xs font-medium text-slate-800">
                    {phone || 'Not added yet'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-slate-400">Member Since</div>
                  <div className="text-xs font-medium text-slate-800">{formattedJoiningDate}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-slate-400">Last Active</div>
                  <div className="text-xs font-medium text-slate-800">Active Session</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-semibold text-slate-400">Location</div>
                  <div className="text-xs font-medium text-slate-800">{location}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4">
            <h3 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <QuickActionItem
                icon={Pencil}
                label="Edit Personal Info"
                active={activeAction === 'Edit Profile' && isEditing}
                onClick={() => {
                  setActiveAction('Edit Profile')
                  setIsEditing(true)
                  showToast('Edit mode enabled')
                }}
              />
              <QuickActionItem
                icon={Lock}
                label="Change Password"
                active={false}
                onClick={() => navigate('/profile/password')}
              />
              <QuickActionItem
                icon={Settings}
                label="Account Settings"
                active={false}
                onClick={() => navigate('/profile/manage')}
              />
              <QuickActionItem
                icon={Bell}
                label="Notification Alerts"
                active={false}
                onClick={() => navigate('/notifications')}
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">
          {/* Personal Information */}
          <SectionCard icon={User} title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. Super Admin"
              />
              <FormInput
                label="Email Address (Login ID)"
                value={email}
                disabled={true}
                icon={<Lock className="w-3.5 h-3.5" />}
              />
              <FormInput
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. +91 98765 43210"
              />
              <FormInput
                label="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={!isEditing}
                icon={<Calendar className="w-3.5 h-3.5" />}
                placeholder="e.g. 15 Aug 1995"
              />
              <FormSelect
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isEditing}
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
              />
              <FormInput
                label="Location / City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g. Lucknow, Uttar Pradesh"
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#E09400] rounded-xl shadow-md shadow-[#F5A623]/25 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </SectionCard>

          {/* Account Information */}
          <SectionCard icon={Shield} title="Account & Security Status">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* User Role */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">User Role</label>
                <div className="px-3 py-2.5 text-xs border rounded-xl bg-slate-50 text-slate-800 font-bold border-slate-200">
                  {role || 'Super Admin'}
                </div>
              </div>
              {/* Account Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Account Status</label>
                <div className="px-3 py-2.5 text-xs border rounded-xl bg-slate-50 border-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span className="font-bold text-emerald-700">{status || 'Active'}</span>
                </div>
              </div>
              {/* Joining Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Registration Date</label>
                <div className="px-3 py-2.5 text-xs border rounded-xl bg-slate-50 text-slate-700 font-medium border-slate-200">
                  {formattedJoiningDate}
                </div>
              </div>
              {/* 2FA Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">Two-Factor Auth</label>
                <div className="px-3 py-2.5 text-xs border rounded-xl bg-emerald-50 border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Enabled
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Profile Photo Upload Section */}
          <SectionCard icon={Image} title="Profile Photo Management">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-start sm:self-auto">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-200 bg-gradient-to-br from-[#F5A623] to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-xs relative">
                  {avatar ? (
                    <img
                      src={getAvatarUrl(avatar)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span>{(fullName || 'AD').slice(0, 2).toUpperCase()}</span>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">Change or remove your profile picture</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Saved dynamically to backend local uploads folder (JPG, PNG, WebP up to 5MB). Synced in real-time.
                </p>
                <div className="flex items-center gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5A623] hover:bg-[#E09400] text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs shadow-[#F5A623]/20 disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        Upload Photo
                      </>
                    )}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  )
}
