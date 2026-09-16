import { Users, ListChecks, Eye, ArrowUpRight } from 'lucide-react'

export function AnalyticsStatsCards({ stats }) {
  const items = [
    {
      id: 'users',
      title: 'Total Users',
      value: stats?.totalUsers || '0',
      trend: `${stats?.totalUsersRaw || stats?.totalUsers || 0} verified accounts`,
      icon: Users,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'listings',
      title: 'Total Listings',
      value: stats?.totalListings || '0',
      trend: `${stats?.totalListingsRaw || stats?.totalListings || 0} live machines`,
      icon: ListChecks,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'views',
      title: 'Total Views',
      value: stats?.totalViews || '0',
      trend: 'Platform equipment impressions',
      icon: Eye,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: stats?.totalRevenue || '₹ 0',
      trend: 'Platform listing & promotion revenue',
      isRupee: true,
      iconBg: 'bg-rose-50 text-rose-500',
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
              {item.isRupee ? (
                <span className="text-xl font-black">₹</span>
              ) : (
                <Icon className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0">
              <div className="text-2xl font-black text-slate-900 leading-none">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                {item.title}
              </div>
              <div className="text-[11px] font-semibold flex items-center gap-0.5 mt-1 text-emerald-600 truncate">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                <span className="truncate">{item.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
