import React from 'react'
import { Crown, CheckCircle2, Clock, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function FeaturedStatsCards({ stats }) {
  let items = []

  if (stats && typeof stats === 'object') {
    items = [
      {
        id: 'total',
        title: 'Total Promoted',
        value: (stats.total ?? 0).toLocaleString(),
        trend: 'Boosted on marketplace',
        isUp: true,
        icon: Crown,
        iconBg: 'bg-amber-50 text-amber-600',
      },
      {
        id: 'active',
        title: 'Active Campaigns',
        value: (stats.active ?? 0).toLocaleString(),
        trend: 'Featured now',
        isUp: true,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'expired',
        title: 'Expired Promotions',
        value: (stats.expired ?? 0).toLocaleString(),
        trend: 'Ready for renewal',
        isUp: false,
        icon: Clock,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'views',
        title: 'Promotion Views',
        value: (stats.totalViews ?? 0).toLocaleString(),
        trend: '⚡ Organic impressions',
        isUp: true,
        icon: Eye,
        iconBg: 'bg-sky-50 text-sky-600',
      },
    ]
  } else {
    items = [
      {
        id: 'total',
        title: 'Total Promoted',
        value: '0',
        trend: '0% this month',
        isUp: true,
        icon: Crown,
        iconBg: 'bg-amber-50 text-amber-600',
      },
      {
        id: 'active',
        title: 'Active Campaigns',
        value: '0',
        trend: 'None running',
        isUp: true,
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'expired',
        title: 'Expired Promotions',
        value: '0',
        trend: 'All up to date',
        isUp: false,
        icon: Clock,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'views',
        title: 'Promotion Views',
        value: '0',
        trend: '0 impressions',
        isUp: true,
        icon: Eye,
        iconBg: 'bg-sky-50 text-sky-600',
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
