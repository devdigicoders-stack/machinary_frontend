import React from 'react'
import { Send, CheckCircle2, Clock, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function NotificationStatsCards({ stats }) {
  const items = [
    {
      id: 'total',
      title: 'Total Notifications',
      value: stats?.total ?? 0,
      trend: `${stats?.total ?? 0} sent across channels`,
      isUp: true,
      icon: Send,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      value: stats?.delivered ?? 0,
      trend: 'Successfully delivered',
      isUp: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'pending',
      title: 'Pending',
      value: stats?.pending ?? 0,
      trend: `${stats?.scheduled ?? 0} scheduled`,
      isUp: (stats?.pending || 0) === 0,
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'failed',
      title: 'Failed',
      value: stats?.failed ?? 0,
      trend: (stats?.failed || 0) > 0 ? 'Requires retry' : 'No failed broadcasts',
      isUp: (stats?.failed || 0) === 0,
      icon: XCircle,
      iconBg: 'bg-rose-50 text-rose-600',
    },
  ]

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
                  item.isUp ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {item.isUp ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{item.trend}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{item.trend}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
