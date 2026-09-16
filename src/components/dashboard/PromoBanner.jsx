import React, { useState, useEffect } from 'react'
import { authService } from '../../services/authService'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

export function PromoBanner({ pendingApprovals = 0, newEnquiries = 0 }) {
  const [adminName, setAdminName] = useState(() => {
    const user = authService.getCurrentUser()
    return user?.name || 'Admin'
  })

  useEffect(() => {
    const updateAdmin = () => {
      const user = authService.getCurrentUser()
      if (user?.name) setAdminName(user.name)
    }
    updateAdmin()
    window.addEventListener('admin-profile-updated', updateAdmin)
    return () => window.removeEventListener('admin-profile-updated', updateAdmin)
  }, [])

  // Dynamic greeting based on current local time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning,'
    if (hour < 17) return 'Good afternoon,'
    return 'Good evening,'
  }

  return (
    <div className="w-full bg-[#FFF8EC] border border-amber-200/60 rounded-lg overflow-hidden shadow-xs flex flex-col md:flex-row items-stretch">
      
      {/* 1. Left Welcome Section */}
      <div className="w-full md:w-[32%] lg:w-[32%] bg-[#FFF5E2] px-5 sm:px-6 py-3.5 sm:py-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-amber-200/50 shrink-0">
        <span className="text-slate-600 font-semibold text-xs tracking-wide flex items-center gap-1.5">
          <span>{getGreeting()}</span>
        </span>
        <h2 className="text-xl sm:text-[23px] font-black text-slate-900 tracking-tight leading-tight mt-0.5 flex items-center gap-1.5">
          <span className="truncate max-w-[200px]" title={adminName}>
            {adminName}
          </span>
          <span className="text-xl sm:text-2xl shrink-0">👋</span>
        </h2>
        
        {/* Dynamic Activity Pill */}
        <div className="mt-2">
          {pendingApprovals > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-[10.5px] font-semibold">
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{pendingApprovals} listing{pendingApprovals > 1 ? 's' : ''} awaiting approval</span>
            </div>
          ) : newEnquiries > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80 text-[10.5px] font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{newEnquiries} new customer enquiry</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200 text-[10.5px] font-medium">
              <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>All systems active &amp; healthy</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Machinery Showcase Section */}
      <div className="flex-1 bg-gradient-to-r from-[#FFF8ED] via-[#FAF6EE] to-[#FFFDF9] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between relative overflow-hidden">
        
        {/* Slogan & Horizontal Gold Line */}
        <div className="relative z-10 max-w-[190px] sm:max-w-[210px] shrink-0 pl-1">
          <h3 className="text-sm sm:text-[16px] xl:text-lg font-black text-slate-900 leading-[1.15] tracking-tight">
            Build<br />
            Move<br />
            Grow Together
          </h3>
          <p className="text-[9.5px] sm:text-[10.5px] text-slate-500 font-medium mt-1 leading-tight">
            India&apos;s Trusted Machinery &amp; Transport Marketplace
          </p>
          {/* Horizontal Golden Line as shown in mockup */}
          <div className="w-10 h-1 bg-[#F5A623] rounded-full mt-2 shadow-2xs" />
        </div>

        {/* Center Machinery Image - Grounded to Bottom */}
        <div className="flex-1 flex items-end justify-center px-2 relative z-0 h-22 sm:h-25 xl:h-28 self-end -mb-0.5">
          <img
            src="/dashboard.png"
            alt="Heavy Machinery Showcase"
            className="h-full max-h-full object-contain object-bottom filter drop-shadow-sm transform scale-105 hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Right Slogan Text */}
        <div className="relative z-10 text-right shrink-0 hidden sm:block pr-1 pl-2">
          <div className="text-slate-900 font-black text-[10.5px] sm:text-[11.5px] xl:text-xs leading-tight tracking-tighter uppercase">
            HEAVY<br />
            MACHINES<br />
            BIGGER<br />
            POSSIBILITIES
          </div>
        </div>

      </div>

    </div>
  )
}
