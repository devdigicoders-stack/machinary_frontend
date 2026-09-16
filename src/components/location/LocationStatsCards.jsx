import React from 'react'
import { Globe, Building2, Building, MapPin, ArrowUpRight } from 'lucide-react'

export function LocationStatsCards({ stats = {} }) {
  const items = [
    {
      id: 'countries',
      title: 'Total Countries',
      value: (stats?.totalCountries ?? 1).toString(),
      trend: 'Active marketplace',
      icon: Globe,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'states',
      title: 'Total States',
      value: (stats?.totalStates ?? 28).toString(),
      trend: 'Pan-India presence',
      icon: Building2,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'cities',
      title: 'Total Cities',
      value: (stats?.totalCities ?? 112).toLocaleString(),
      trend: `${stats?.activeCities ?? stats?.totalCities ?? 112} active hubs`,
      icon: Building,
      iconBg: 'bg-rose-50 text-rose-500',
    },
    {
      id: 'pincodes',
      title: 'Total Pincodes',
      value: (stats?.totalPincodes ?? 8136).toLocaleString(),
      trend: 'Nationwide coverage',
      icon: MapPin,
      iconBg: 'bg-amber-50 text-amber-600',
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
              <div className="text-[11px] font-semibold flex items-center gap-0.5 mt-1 text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{item.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
