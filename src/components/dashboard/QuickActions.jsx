import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'

// Solid / Bold message bubble icon for View Enquiries
function SolidMessageIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 4H20C21.1 4 22 4.9 22 6V16C22 17.1 21.1 18 20 18H7L3 21.5V6C3 4.9 3.9 4 4 4ZM6 8V10H18V8H6ZM6 12V14H14V12H6Z" />
    </svg>
  )
}

// Solid Users icon for Manage Users
function SolidUsersGroupIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M7.5 17.5C7.5 14.8 9.5 13 12 13C14.5 13 16.5 14.8 16.5 17.5V18.5H7.5V17.5Z" />
      <circle cx="6.5" cy="8.5" r="2.4" />
      <path d="M2.5 17.5C2.5 15.3 4.2 14 6.2 14C6.8 14 7.4 14.1 8 14.4C7.4 15.2 7 16.3 7 17.5V18.5H2.5V17.5Z" />
      <circle cx="17.5" cy="8.5" r="2.4" />
      <path d="M21.5 17.5C21.5 15.3 19.8 14 17.8 14C17.2 14 16.6 14.1 16 14.4C16.6 15.2 17 16.3 17 17.5V18.5H21.5V17.5Z" />
    </svg>
  )
}

// Solid Bar Chart icon for View Reports
function SolidBarChartIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="4" y="12" width="3.5" height="8" rx="1" />
      <rect x="10.25" y="7" width="3.5" height="13" rx="1" />
      <rect x="16.5" y="3" width="3.5" height="17" rx="1" />
    </svg>
  )
}

// Solid Bell icon for Send Notification
function SolidBellIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C10.34 2 9 3.34 9 5V5.29C6.71 6.36 5 8.68 5 11.5V16.5L3 18.5V19.5H21V18.5L19 16.5V11.5C19 8.68 17.29 6.36 15 5.29V5C15 3.34 13.66 2 12 2ZM10 20.5C10 21.6 10.9 22.5 12 22.5C13.1 22.5 14 21.6 14 20.5H10Z" />
    </svg>
  )
}

export function QuickActions({ badges = {} }) {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Add New Listing',
      icon: Plus,
      isLucide: true,
      path: '/buy-rent-listings',
      tileBg: 'bg-[#FFF8EE] hover:bg-[#FFF3E2] border-amber-100',
      circleBg: 'bg-[#FED34C] text-slate-900',
      textColor: 'text-slate-900',
    },
    {
      label: 'View Enquiries',
      icon: SolidMessageIcon,
      isLucide: false,
      path: '/enquiries',
      badge: badges.newEnquiries > 0 ? badges.newEnquiries : null,
      badgeColor: 'bg-amber-500 text-slate-950',
      tileBg: 'bg-[#F0FDF4] hover:bg-[#E1FBE8] border-emerald-100',
      circleBg: 'bg-[#C6F6D5] text-[#027A48]',
      textColor: 'text-[#027A48]',
    },
    {
      label: 'Approve Listings',
      icon: Check,
      isLucide: true,
      path: '/listings/approval',
      badge: badges.pendingApprovals > 0 ? badges.pendingApprovals : null,
      badgeColor: 'bg-rose-500 text-white',
      tileBg: 'bg-[#F0F9FF] hover:bg-[#E0F2FE] border-sky-100',
      circleBg: 'bg-[#BAE6FD] text-[#0F5FC2]',
      textColor: 'text-[#0F5FC2]',
    },
    {
      label: 'Send Notification',
      icon: SolidBellIcon,
      isLucide: false,
      path: '/notifications',
      tileBg: 'bg-[#FAF5FF] hover:bg-[#F3E8FF] border-purple-100',
      circleBg: 'bg-[#E9D8FD] text-[#553C9A]',
      textColor: 'text-[#2A1B54]',
    },
    {
      label: 'Manage Users',
      icon: SolidUsersGroupIcon,
      isLucide: false,
      path: '/customers',
      tileBg: 'bg-[#FFF1F2] hover:bg-[#FFE4E6] border-rose-100',
      circleBg: 'bg-[#FED7E2] text-[#9B2C2C]',
      textColor: 'text-[#9B2C2C]',
    },
    {
      label: 'View Reports',
      icon: SolidBarChartIcon,
      isLucide: false,
      path: '/analytics',
      tileBg: 'bg-[#F0FDFA] hover:bg-[#CCFBF1] border-teal-100',
      circleBg: 'bg-[#B2F5EA] text-[#234E52]',
      textColor: 'text-[#234E52]',
    },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h3>
        <button
          type="button"
          onClick={() => navigate('/buy-rent-listings')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Grid of 6 Action Tiles (3 cols x 2 rows) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 flex-1">
        {actions.map((act, idx) => {
          const IconComponent = act.icon

          return (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(act.path)}
              className={`relative p-2.5 sm:p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:scale-[1.02] shadow-2xs ${act.tileBg}`}
            >
              {/* Dynamic Notification Badge */}
              {act.badge && (
                <span
                  className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse ${act.badgeColor}`}
                >
                  {act.badge}
                </span>
              )}

              {/* Icon Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 shadow-2xs ${act.circleBg}`}
              >
                {act.isLucide ? (
                  <IconComponent className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <IconComponent className="w-5 h-5" />
                )}
              </div>

              {/* Action Label */}
              <span className={`text-[11.5px] sm:text-xs font-bold leading-tight ${act.textColor}`}>
                {act.label}
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
