import React from 'react'
import { Search, ChevronDown, Calendar } from 'lucide-react'

export function FeaturedFilters({
  searchTerm,
  onSearchChange,
  promotionTypeFilter,
  onPromotionTypeChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  dateRange,
  onDateRangeClick,
  onReset,
  onApply,
  categories = [],
}) {
  const categoryList = ['All', ...(categories.length > 0 ? categories : [
    'Backhoe Loaders',
    'Dump Trucks',
    'Excavators',
    'Wheel Loaders',
    'Cranes',
    'Road Rollers',
    'Concrete Equipment',
    'Generators',
  ])]

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs">
      <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
        
        {/* 1. Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, owner, category, location..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
            />
          </div>
        </div>

        {/* 2. Promotion Type Dropdown */}
        <div className="w-full sm:w-36 lg:w-40 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Promotion Type
          </label>
          <div className="relative">
            <select
              value={promotionTypeFilter}
              onChange={(e) => onPromotionTypeChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Featured">Featured</option>
              <option value="Spotlight">Spotlight</option>
              <option value="Top Listing">Top Listing</option>
              <option value="Promoted">Promoted</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Status Dropdown */}
        <div className="w-full sm:w-28 lg:w-32 shrink-0">
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
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Category Dropdown */}
        <div className="w-full sm:w-36 lg:w-40 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              {categoryList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 5. Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
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
  )
}
