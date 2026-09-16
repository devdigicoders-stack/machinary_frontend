import React from 'react'

export function AnalyticsTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'listings', label: 'Listings' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'enquiries', label: 'Enquiries' },
    { id: 'performance', label: 'Top Performance' },
    { id: 'locations', label: 'Location Insights' },
  ]

  return (
    <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-lg shadow-2xs overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
