import React from 'react'
import { Users, UserCheck, HardHat, ShieldCheck, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export function ProfileStatsCards({ stats = {}, isLoading = false }) {
  const cards = [
    {
      id: 'total',
      title: 'Total Users',
      value: stats.total ?? 0,
      subtext: `${stats.active ?? 0} active users`,
      icon: Users,
      iconBg: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-blue-600',
      tagColor: 'text-blue-700 bg-blue-50',
    },
    {
      id: 'customers',
      title: 'Customers',
      value: stats.customers ?? 0,
      subtext: 'Buyers & Renters',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 border border-emerald-100',
      iconColor: 'text-emerald-600',
      tagColor: 'text-emerald-700 bg-emerald-50',
    },
    {
      id: 'owners',
      title: 'Owners',
      value: stats.owners ?? 0,
      subtext: 'Fleet & Machine owners',
      icon: HardHat,
      iconBg: 'bg-amber-50 border border-amber-100',
      iconColor: 'text-amber-600',
      tagColor: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'admins',
      title: 'Admins & Staff',
      value: stats.admins ?? 0,
      subtext: 'Portal Managers',
      icon: ShieldCheck,
      iconBg: 'bg-purple-50 border border-purple-100',
      iconColor: 'text-purple-600',
      tagColor: 'text-purple-700 bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-sm hover:border-[#F5A623]/40 transition-all flex items-center gap-3.5 group"
          >
            <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
              <Icon className={`w-6 h-6 stroke-[2] ${item.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-6 w-12 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 truncate">{item.title}</div>
                  <div className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item.subtext}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
