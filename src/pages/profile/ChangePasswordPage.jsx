import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  Smartphone,
  Laptop,
  Clock,
  Check,
  Loader2,
  Info,
  Calendar,
} from 'lucide-react'
import { Toast } from '../../components/common/Toast'
import { authService } from '../../services/authService'

// Helper to detect current browser & OS
function detectCurrentDevice() {
  const ua = navigator.userAgent
  let browser = 'Browser'
  let os = 'Desktop'

  if (ua.includes('Edg/')) browser = 'Microsoft Edge'
  else if (ua.includes('Chrome/')) browser = 'Google Chrome'
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari'
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox'
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera'

  if (ua.includes('Windows NT 10.0')) os = 'Windows 11 / 10'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { browser, os }
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingOutSessions, setIsLoggingOutSessions] = useState(false)

  // Real admin profile data from MongoDB Atlas
  const [adminProfile, setAdminProfile] = useState(null)
  const [sessionCount, setSessionCount] = useState(2)
  const currentDevice = detectCurrentDevice()

  // Load Admin Profile
  useEffect(() => {
    const cached = authService.getCurrentUser()
    if (cached) setAdminProfile(cached)

    authService
      .getProfile()
      .then((res) => {
        if (res?.data) {
          setAdminProfile(res.data)
        }
      })
      .catch((err) => {
        console.error('Failed to load profile for security status:', err)
      })
  }, [])

  // Password criteria verification
  const hasMinLength = newPassword.length >= 8
  const hasUpper = /[A-Z]/.test(newPassword)
  const hasLower = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const isMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword)

  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' }
    if (strengthScore <= 3) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' }
    if (strengthScore === 4) return { label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' }
    return { label: 'Very Strong', color: 'bg-emerald-500', text: 'text-emerald-500' }
  }

  const strength = getStrengthLabel()

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Handle Password Submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentPassword) {
      showToast('Please enter your current password')
      return
    }

    if (strengthScore < 3) {
      showToast('New password is not strong enough. Please meet the required criteria.')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authService.changePassword(currentPassword, newPassword)
      setIsSubmitting(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Update state timestamp
      const now = new Date()
      setAdminProfile((prev) => ({
        ...prev,
        lastPasswordChange: response?.data?.lastPasswordChange || now.toISOString(),
      }))

      showToast(response.message || 'Password updated successfully in MongoDB Atlas!')
    } catch (error) {
      setIsSubmitting(false)
      const msg =
        error.response?.data?.message ||
        'Failed to update password. Please check that your current password is correct.'
      showToast(msg)
    }
  }

  // Handle Logout other sessions
  const handleLogoutOtherSessions = async () => {
    setIsLoggingOutSessions(true)
    try {
      const res = await authService.logoutOtherSessions()
      setSessionCount(1)
      showToast(res.message || 'Logged out from all other sessions successfully')
    } catch (err) {
      showToast('Failed to logout other sessions')
    } finally {
      setIsLoggingOutSessions(false)
    }
  }

  // Format last password change date
  const lastChangeDate = adminProfile?.lastPasswordChange
    ? new Date(adminProfile.lastPasswordChange).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : adminProfile?.updatedAt
    ? new Date(adminProfile.updatedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recent'

  const is2FA = adminProfile?.is2FAActive ?? true

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-800 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/profile" className="hover:text-slate-800 transition-colors">
              Profile
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Change Password</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-[#F5A623]" />
            <span>Change Password</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your credentials and review active security sessions across devices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Last Changed pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Changed: {lastChangeDate}</span>
          </div>

          {/* 2FA Status */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              is2FA
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {is2FA ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2FA Active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>2FA Inactive</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Password Update Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5A623]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Update Credentials</h2>
                <p className="text-xs text-slate-500">
                  Verify current password and set a strong new password
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Password Strength:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all rounded-full ${
                            level <= strengthScore ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${
                      isMatch ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {isMatch ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Submit / Clear Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword || !isMatch}
                  className="px-5 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#F5A623]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating in Database...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Password Rules & Active Sessions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rules Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
              <span>Password Security Requirements</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                {hasMinLength ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasMinLength ? 'text-emerald-700 font-medium' : ''}>
                  At least 8 characters long
                </span>
              </li>
              <li className="flex items-center gap-2">
                {hasUpper ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasUpper ? 'text-emerald-700 font-medium' : ''}>
                  At least one uppercase letter (A-Z)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {hasLower ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasLower ? 'text-emerald-700 font-medium' : ''}>
                  At least one lowercase letter (a-z)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {hasNumber ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasNumber ? 'text-emerald-700 font-medium' : ''}>
                  At least one numeric digit (0-9)
                </span>
              </li>
              <li className="flex items-center gap-2">
                {hasSpecial ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={hasSpecial ? 'text-emerald-700 font-medium' : ''}>
                  At least one special character (!@#$%^&amp;*)
                </span>
              </li>
            </ul>
          </div>

          {/* Active Logged-in Devices */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#F5A623]" />
                <span>Active Sessions</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {sessionCount} {sessionCount === 1 ? 'Device' : 'Devices'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Current device (detected dynamically) */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    <Laptop className="w-4 h-4 text-[#D98200]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">
                        {currentDevice.browser} on {currentDevice.os}
                      </span>
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                        Current
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {adminProfile?.location || 'India'} • Local Host Session
                    </p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Now
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary session */}
              {sessionCount > 1 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Smartphone className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">Mobile Browser Session</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">India • Secondary Session</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Last active: Today
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {sessionCount > 1 && (
              <button
                type="button"
                disabled={isLoggingOutSessions}
                onClick={handleLogoutOtherSessions}
                className="w-full mt-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingOutSessions ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing out other devices...</span>
                  </>
                ) : (
                  <span>Sign out from all other devices</span>
                )}
              </button>
            )}
          </div>

          {/* Security Recommendations */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-4 sm:p-5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold mb-2 text-amber-900">
              <Info className="w-4 h-4 text-[#D98200]" />
              <span>Admin Security Best Practices</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-800 leading-relaxed list-disc list-inside">
              <li>Use passwords that you do not use for any other platform or email account.</li>
              <li>Avoid sharing administrative logins; create individual staff accounts instead.</li>
              <li>Update your credentials periodically to maintain portal security.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
