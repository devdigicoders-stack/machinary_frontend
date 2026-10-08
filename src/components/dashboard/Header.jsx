import React, { useState, useEffect } from 'react'
import { Menu, Bell, ChevronDown, User, LogOut, Settings, Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authService, getAvatarUrl } from '../../services/authService'

export function Header({ onMenuClick }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const navigate = useNavigate()

  // Live ticking date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateUser = () => {
      const user = authService.getCurrentUser()
      if (user) setCurrentUser(user)
    }
    updateUser()

    window.addEventListener('admin-profile-updated', updateUser)
    return () => window.removeEventListener('admin-profile-updated', updateUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const adminName = currentUser?.name || 'Super Admin'
  const adminRole = currentUser?.role || 'Super Admin'
  const adminInitials = adminName.slice(0, 2).toUpperCase()

  const formattedDate = currentDateTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const formattedTime = currentDateTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left: Hamburger & Live Date/Time Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live Date & Time Display replacing search bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 transition-colors border border-slate-200/80 rounded-lg shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
            <span className="whitespace-nowrap">{formattedDate}</span>
          </div>

          <span className="text-slate-300 font-light select-none">|</span>

          <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
            <span className="whitespace-nowrap tracking-tight">{formattedTime}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] font-semibold text-emerald-700 uppercase tracking-wider">
              IST
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Notification Bell with Badge */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            3
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            {/* Avatar image / initials */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 text-[#F5A623] flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-200 shadow-xs shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={getAvatarUrl(currentUser.avatar)}
                  alt={adminName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                adminInitials
              )}
            </div>
            {/* Name & Role */}
            <div className="hidden sm:block text-left">
              <div className="text-xs sm:text-[13px] font-bold text-slate-800 group-hover:text-slate-950 leading-tight">
                {adminName}
              </div>
              <div className="text-[10.5px] font-medium text-slate-400 leading-tight">
                {adminRole}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'admin@gmail.com'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false)
                  navigate('/profile')
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false)
                  navigate('/profile/manage')
                }}
                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
