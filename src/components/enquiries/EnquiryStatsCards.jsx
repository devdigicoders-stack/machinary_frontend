import {
  MessageSquare,
  Mail,
  Phone,
  Handshake,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

export function EnquiryStatsCards({
  counts = { all: 0, new: 0, contacted: 0, converted: 0, closed: 0 },
  isLoading = false,
}) {
  const allCount = counts?.all ?? 0
  const newCount = counts?.new ?? 0
  const contactedCount = counts?.contacted ?? 0
  const convertedCount = counts?.converted ?? 0
  const closedCount = counts?.closed ?? 0

  const conversionRate =
    allCount > 0 ? Math.round((convertedCount / allCount) * 100) : 0

  const cards = [
    {
      id: 'total',
      title: 'Total Enquiries',
      value: allCount.toLocaleString('en-IN'),
      trend: `${allCount > 0 ? '+100%' : '0%'}`,
      isUp: true,
      icon: MessageSquare,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'new',
      title: 'New Enquiries',
      value: newCount.toLocaleString('en-IN'),
      trend: `${allCount > 0 ? Math.round((newCount / allCount) * 100) : 0}% of all`,
      isUp: true,
      icon: Mail,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'contacted',
      title: 'Contacted',
      value: contactedCount.toLocaleString('en-IN'),
      trend: `${allCount > 0 ? Math.round((contactedCount / allCount) * 100) : 0}% in progress`,
      isUp: true,
      icon: Phone,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'converted',
      title: 'Converted',
      value: convertedCount.toLocaleString('en-IN'),
      trend: `${conversionRate}% win rate`,
      isUp: true,
      icon: Handshake,
      iconBg: 'bg-green-50 text-green-600',
    },
    {
      id: 'closed',
      title: 'Closed',
      value: closedCount.toLocaleString('en-IN'),
      trend: 'Resolved',
      isUp: false,
      icon: CheckCircle2,
      iconBg: 'bg-rose-50 text-rose-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3.5"
          >
            {/* Left Icon */}
            <div
              className={`w-11 h-11 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="h-6 w-16 bg-slate-200 animate-pulse rounded my-0.5" />
              ) : (
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {item.value}
                </div>
              )}
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
                <span className="truncate">{item.trend}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
