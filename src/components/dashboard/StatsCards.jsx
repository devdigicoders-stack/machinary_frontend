import React from 'react'

// 1. Solid 3-person Users icon for Total Customers
function SolidUsersIcon({ className = 'w-6 h-6' }) {
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

// 2. Solid Single User icon for Total Owners
function SolidUserIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M5 19C5 15.4 8 13.5 12 13.5C16 13.5 19 15.4 19 19V20H5V19Z" />
    </svg>
  )
}

// 3. Solid Hydraulic Excavator icon for Total Listings
function SolidExcavatorIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="2" y="16" width="13" height="5" rx="2.5" />
      <path d="M3 10H10C10.5 10 11 10.5 11 11V15H3V10Z" />
      <rect x="4" y="11" width="3.5" height="3" rx="0.5" fill="#D1E9FF" />
      <path d="M9.5 12L15 6L18 8.5L16.5 13H15L14 11L10 13.5V12Z" />
      <path d="M18 8.5L21.5 11.5L20 14.5L17 13.5L18 8.5Z" />
    </svg>
  )
}

// 4. Solid Eye icon for Featured Listings
function SolidEyeIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" />
    </svg>
  )
}

export function StatsCards({ kpis, isLoading = false }) {
  const cards = [
    {
      label: 'Total Customers',
      value: kpis?.totalCustomers?.value ?? '0',
      trend: kpis?.totalCustomers?.trend ?? '12%',
      trendText: kpis?.totalCustomers?.trendText ?? '↑ 12%',
      isPositive: kpis?.totalCustomers?.isPositive ?? true,
      icon: SolidUsersIcon,
      circleBg: 'bg-[#FED34C]',
      iconColor: 'text-[#1E2024]',
    },
    {
      label: 'Total Owners',
      value: kpis?.totalOwners?.value ?? '0',
      trend: kpis?.totalOwners?.trend ?? '8%',
      trendText: kpis?.totalOwners?.trendText ?? '↑ 8%',
      isPositive: kpis?.totalOwners?.isPositive ?? true,
      icon: SolidUserIcon,
      circleBg: 'bg-[#D1FADF]',
      iconColor: 'text-[#027A48]',
    },
    {
      label: 'Total Listings',
      value: kpis?.totalListings?.value ?? '0',
      trend: kpis?.totalListings?.trend ?? '18%',
      trendText: kpis?.totalListings?.trendText ?? '↑ 18%',
      isPositive: kpis?.totalListings?.isPositive ?? true,
      icon: SolidExcavatorIcon,
      circleBg: 'bg-[#D1E9FF]',
      iconColor: 'text-[#0F5FC2]',
    },
    {
      label: 'Featured Listings',
      value: kpis?.featuredListings?.value ?? '0',
      trend: kpis?.featuredListings?.trend ?? '6%',
      trendText: kpis?.featuredListings?.trendText ?? '↑ 6%',
      isPositive: kpis?.featuredListings?.isPositive ?? true,
      icon: SolidEyeIcon,
      circleBg: 'bg-[#FFE4E8]',
      iconColor: 'text-[#BE123C]',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-4.5 shadow-xs flex items-center gap-3.5 animate-pulse"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-2.5 bg-slate-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((item, index) => {
        const IconComponent = item.icon

        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-4.5 shadow-xs hover:shadow-sm transition-shadow flex items-center gap-3.5 group"
          >
            {/* Solid Colorful Circle */}
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.circleBg} ${item.iconColor} transition-transform group-hover:scale-105 shadow-2xs`}
            >
              <IconComponent className="w-6 h-6" />
            </div>

            {/* Content info */}
            <div className="flex-1 min-w-0">
              <span className="text-slate-500 text-xs font-medium block truncate">
                {item.label}
              </span>
              <div className="text-2xl sm:text-[25px] font-black text-slate-900 leading-tight my-0.5 tracking-tight">
                {item.value}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={`font-bold ${
                    item.isPositive ? 'text-[#12B76A]' : 'text-rose-500'
                  }`}
                >
                  {item.trendText}
                </span>
                <span className="text-slate-400 font-normal text-[11px]">vs last month</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
