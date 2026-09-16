import React from 'react'
import { Search, ChevronDown, Calendar } from 'lucide-react'

export function ContentFilters({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  pageTypeFilter,
  onPageTypeChange,
  statusFilter,
  onStatusChange,
  lastUpdatedFilter,
  onLastUpdatedClick,
  onReset,
  onApply,
  counts = { all: 24, static: 12, dynamic: 8, legal: 4, other: 0 },
}) {
  const tabs = [
    { id: 'all', label: `All Pages (${counts.all})` },
    { id: 'static', label: `Static Pages (${counts.static})` },
    { id: 'dynamic', label: `Dynamic Pages (${counts.dynamic})` },
    { id: 'legal', label: `Legal (${counts.legal})` },
    { id: 'other', label: `Other (${counts.other})` },
  ]

  return (
    <div className="space-y-3">
      {/* 1. Category Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-lg shadow-2xs overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
          
          {/* Search Input */}
          <div className="flex-1 min-w-[220px] relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by page title, URL, content..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
              />
            </div>
          </div>

          {/* Page Type Dropdown */}
          <div className="w-full sm:w-36 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Page Type
            </label>
            <div className="relative">
              <select
                value={pageTypeFilter}
                onChange={(e) => onPageTypeChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Static">Static</option>
                <option value="Dynamic">Dynamic</option>
                <option value="Legal">Legal</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-36 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Last Updated Date Range */}
          <div className="w-full sm:w-44 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Last Updated
            </label>
            <button
              type="button"
              onClick={onLastUpdatedClick}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs text-slate-700 font-medium cursor-pointer shadow-2xs transition-all"
            >
              <div className="flex items-center gap-2 truncate">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{lastUpdatedFilter || 'All Time'}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApply}
              className="flex-1 sm:flex-none px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
