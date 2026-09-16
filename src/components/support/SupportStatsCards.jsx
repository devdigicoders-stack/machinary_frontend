import React from 'react'
import { Headphones, CheckCircle2, Clock, AlertCircle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function SupportStatsCards({ stats }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Tickets',
      value: stats?.total ?? 0,
      trend: `${stats?.total ?? 0} submitted tickets`,
      isUp: true,
      icon: Headphones,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      trendColor: 'text-emerald-600',
    },
    {
      id: 'resolved',
      title: 'Resolved',
      value: stats?.resolved ?? 0,
      trend: `${stats?.resolved ?? 0} resolved successfully`,
      isUp: true,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      trendColor: 'text-emerald-600',
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      value: stats?.inprogress ?? 0,
      trend: `${stats?.inprogress ?? 0} active investigations`,
      isUp: true,
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      trendColor: 'text-amber-600',
    },
    {
      id: 'open',
      title: 'Open',
      value: stats?.open ?? 0,
      trend: (stats?.open || 0) > 0 ? `${stats?.open} awaiting response` : 'No pending tickets',
      isUp: (stats?.open || 0) === 0,
      icon: AlertCircle,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      trendColor: (stats?.open || 0) > 0 ? 'text-rose-600' : 'text-emerald-600',
    },
    {
      id: 'closed',
      title: 'Closed',
      value: stats?.closed ?? 0,
      trend: `${stats?.closed ?? 0} archived tickets`,
      isUp: true,
      icon: XCircle,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-500',
      trendColor: 'text-slate-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3"
          >
            <div className={`w-11 h-11 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 stroke-[2.2] ${item.iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-black text-slate-900 leading-none">{item.value}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{item.title}</div>
              <div className={`text-[10px] font-semibold flex items-center gap-0.5 mt-1 ${item.trendColor} truncate`}>
                {item.isUp ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5] shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5] shrink-0" />
                )}
                <span className="truncate">{item.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
