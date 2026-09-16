import React from 'react'

function SolidPersonIcon({ className = 'w-6 h-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M5 19C5 15.4 8 13.5 12 13.5C16 13.5 19 15.4 19 19V20H5V19Z" />
    </svg>
  )
}

export function CustomerStatsCards({ stats = {}, isLoading = false }) {
  const total = stats?.total ?? 0
  const active = stats?.active ?? 0
  const inactive = stats?.inactive ?? 0
  const newThisMonth = stats?.newThisMonth ?? 0

  const activePct = total > 0 ? Math.round((active / total) * 100) : 0

  const cards = [
    {
      label: 'Total Customers',
      value: total.toLocaleString('en-IN'),
      trend: `${total > 0 ? '+100%' : '0%'}`,
      trendUp: true,
      circleBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#B45309]',
      subtext: 'Registered database users',
    },
    {
      label: 'Active Customers',
      value: active.toLocaleString('en-IN'),
      trend: `${activePct}% active`,
      trendUp: true,
      circleBg: 'bg-[#D1FADF]',
      iconColor: 'text-[#027A48]',
      subtext: 'Operational accounts',
    },
    {
      label: 'Inactive Customers',
      value: inactive.toLocaleString('en-IN'),
      trend: `${total > 0 ? Math.round((inactive / total) * 100) : 0}%`,
      trendUp: false,
      circleBg: 'bg-[#FFE4E8]',
      iconColor: 'text-[#BE123C]',
      subtext: 'Needs review / follow-up',
    },
    {
      label: 'New This Month',
      value: newThisMonth.toLocaleString('en-IN'),
      trend: 'Current Month',
      trendUp: true,
      circleBg: 'bg-[#D1E9FF]',
      iconColor: 'text-[#0284C7]',
      subtext: 'Fresh registrations',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-4.5 shadow-xs flex items-center gap-3.5 transition-all hover:shadow-sm"
        >
          {/* User Icon Circle */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.circleBg} ${item.iconColor}`}
          >
            <SolidPersonIcon className="w-6 h-6" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-7 w-20 bg-slate-200 animate-pulse rounded my-0.5" />
            ) : (
              <div className="text-2xl sm:text-[25px] font-black text-slate-900 leading-tight">
                {item.value}
              </div>
            )}
            <span className="text-slate-500 text-xs font-semibold block truncate mt-0.5">
              {item.label}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span
                className={`font-bold text-[11px] px-1.5 py-0.2 rounded ${
                  item.trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {item.trend}
              </span>
              <span className="text-slate-400 font-normal text-[11px] truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
