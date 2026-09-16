import React from 'react'
import { FileText, CheckCircle2, Clock, FileX, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function ListingStatsCards({ stats }) {
  let items = []

  if (Array.isArray(stats) && stats.length > 0) {
    items = stats
  } else if (stats && typeof stats === 'object') {
    items = [
      {
        id: 'total',
        title: 'Total Listings',
        value: stats.total?.toLocaleString() ?? '0',
        trend: '+12% this month',
        isUp: true,
        icon: FileText,
        iconBg: 'bg-amber-50 text-amber-700',
      },
      {
        id: 'active',
        title: 'Active Listings',
        value: stats.active?.toLocaleString() ?? '0',
        trend: 'Live on platform',
        isUp: true,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'pending',
        title: 'Pending Approval',
        value: stats.pending?.toLocaleString() ?? '0',
        trend: 'Requires moderation',
        isUp: false,
        icon: Clock,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'inactive',
        title: 'Rejected / Inactive',
        value: (stats.rejected ?? 0)?.toLocaleString(),
        trend: 'Platform restricted',
        isUp: false,
        icon: FileX,
        iconBg: 'bg-slate-100 text-slate-600',
      },
    ]
  } else {
    items = [
      {
        id: 'total',
        title: 'Total Listings',
        value: '0',
        trend: '12% vs last month',
        isUp: true,
        icon: FileText,
        iconBg: 'bg-amber-50 text-amber-700',
      },
      {
        id: 'active',
        title: 'Active Listings',
        value: '0',
        trend: '8% vs last month',
        isUp: true,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'pending',
        title: 'Pending Approval',
        value: '0',
        trend: '5% vs last month',
        isUp: false,
        icon: Clock,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'inactive',
        title: 'Rejected / Inactive',
        value: '0',
        trend: '12% vs last month',
        isUp: false,
        icon: FileX,
        iconBg: 'bg-slate-100 text-slate-600',
      },
    ]
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3.5"
          >
            {/* Left Icon */}
            <div className={`w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Content */}
            <div className="min-w-0">
              <div className="text-2xl font-black text-slate-900 leading-none">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                {item.title}
              </div>
              <div
                className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${
                  item.isUp ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {item.isUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{item.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
