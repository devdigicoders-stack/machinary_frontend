import React from 'react'

export function TopCategoriesCard({ categories = [], onViewAll }) {
  const items = categories || []

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900">Top Categories</h3>
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
              No categories with active listings found.
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-1.5 w-6 text-center">#</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5 text-center">Total Listings</th>
                  <th className="py-2 px-2.5 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.slice(0, 5).map((cat, idx) => (
                  <tr key={cat.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-1.5 text-center text-slate-400 font-medium text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{cat.icon || '🚜'}</span>
                        <span className="font-bold text-slate-800 text-xs">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-medium text-slate-700">
                      {cat.listings}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-slate-900">
                      {cat.views}
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
