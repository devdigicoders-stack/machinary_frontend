import { Flag, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function ReportedStatsCards({ stats }) {
  let items = []

  if (stats && typeof stats === 'object') {
    items = [
      {
        id: 'total',
        title: 'Total Reports',
        value: (stats.total ?? 0).toLocaleString(),
        trend: 'Reported by users',
        isUp: true,
        trendColor: 'text-rose-600',
        icon: Flag,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'pending',
        title: 'Pending Review',
        value: (stats.pending ?? 0).toLocaleString(),
        trend: 'Needs admin decision',
        isUp: false,
        trendColor: 'text-amber-600',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600',
      },
      {
        id: 'resolved',
        title: 'Resolved Cases',
        value: (stats.resolved ?? 0).toLocaleString(),
        trend: 'Actions completed',
        isUp: true,
        trendColor: 'text-emerald-600',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'severity',
        title: 'High Severity',
        value: (stats.highSeverity ?? 0).toLocaleString(),
        trend: 'Fraud / Policy breach',
        isUp: false,
        trendColor: 'text-rose-600',
        icon: AlertTriangle,
        iconBg: 'bg-rose-100 text-rose-700',
      },
    ]
  } else {
    items = [
      {
        id: 'total',
        title: 'Total Reports',
        value: '0',
        trend: '0% this month',
        isUp: true,
        trendColor: 'text-slate-500',
        icon: Flag,
        iconBg: 'bg-rose-50 text-rose-500',
      },
      {
        id: 'pending',
        title: 'Pending Review',
        value: '0',
        trend: 'All caught up',
        isUp: false,
        trendColor: 'text-emerald-600',
        icon: Clock,
        iconBg: 'bg-amber-50 text-amber-600',
      },
      {
        id: 'resolved',
        title: 'Resolved',
        value: '0',
        trend: 'Zero active violations',
        isUp: true,
        trendColor: 'text-emerald-600',
        icon: CheckCircle2,
        iconBg: 'bg-emerald-50 text-emerald-600',
      },
      {
        id: 'severity',
        title: 'High Severity',
        value: '0',
        trend: 'No urgent flags',
        isUp: false,
        trendColor: 'text-slate-500',
        icon: AlertTriangle,
        iconBg: 'bg-rose-100 text-rose-700',
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
              <div className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${item.trendColor}`}>
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
