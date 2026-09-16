import React from 'react'
import {
  User,
  UserCheck,
  UserX,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export function OwnerStatsCards({
  stats = { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
  isLoading = false,
}) {
  const total = stats?.total ?? 0
  const active = stats?.active ?? 0
  const inactive = stats?.inactive ?? 0
  const newThisMonth = stats?.newThisMonth ?? 0

  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0
  const inactiveRate = total > 0 ? Math.round((inactive / total) * 100) : 0

  const cards = [
    {
      id: 'total',
      title: 'Total Owners',
      value: total.toLocaleString('en-IN'),
      trend: `${total > 0 ? '+100%' : '0%'} platform base`,
      isUp: true,
      icon: User,
      iconBg: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'active',
      title: 'Active Owners',
      value: active.toLocaleString('en-IN'),
      trend: `${activeRate}% active rate`,
      isUp: true,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'inactive',
      title: 'Inactive Owners',
      value: inactive.toLocaleString('en-IN'),
      trend: `${inactiveRate}% inactive`,
      isUp: false,
      icon: UserX,
      iconBg: 'bg-rose-50 text-rose-500',
    },
    {
      id: 'new',
      title: 'New This Month',
      value: newThisMonth.toLocaleString('en-IN'),
      trend: `${newThisMonth} joined this month`,
      isUp: true,
      icon: UserPlus,
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5 animate-pulse"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-16 h-6 bg-slate-200 rounded" />
                <div className="w-24 h-3 bg-slate-100 rounded" />
                <div className="w-20 h-2.5 bg-slate-100 rounded" />
              </div>
            </div>
          ))
        : cards.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3.5"
              >
                {/* Left Icon Container */}
                <div
                  className={`w-12 h-12 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
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
