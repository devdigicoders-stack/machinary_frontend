import React from 'react'

export function RecentEnquiriesCard({ enquiries = [], onViewAll }) {
  const items = enquiries || []

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">Recent Enquiries</h3>
          <button
            type="button"
            onClick={onViewAll}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent customer enquiries found.
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-1.5 w-6 text-center">#</th>
                  <th className="py-2 px-2.5">Customer</th>
                  <th className="py-2 px-2.5">Listing</th>
                  <th className="py-2 px-2 text-center">Type</th>
                  <th className="py-2 px-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.slice(0, 5).map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-1.5 text-center text-slate-400 font-medium text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2.5 font-bold text-slate-800 text-xs">
                      {row.customer}
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-600 font-medium truncate max-w-[140px]" title={row.listing}>
                      {row.listing}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          row.type === 'Rent'
                            ? 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
                            : 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-slate-500 font-medium text-[11px]">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
