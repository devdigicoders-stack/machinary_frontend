import React from 'react'
import { Search, ChevronDown, RefreshCw } from 'lucide-react'

export function EnquiryFilters({
  activeTab = 'All',
  onTabChange,
  searchTerm = '',
  onSearchChange,
  enquiryType = 'All',
  onEnquiryTypeChange,
  statusFilter = 'All',
  onStatusChange,
  counts = { all: 0, new: 0, contacted: 0, converted: 0, closed: 0 },
  onReset,
  onApply,
  isLoading = false,
}) {
  const tabs = [
    { id: 'All', label: `All Enquiries (${counts?.all ?? 0})` },
    { id: 'New', label: `New (${counts?.new ?? 0})` },
    { id: 'Contacted', label: `Contacted (${counts?.contacted ?? 0})` },
    { id: 'Converted', label: `Converted (${counts?.converted ?? 0})` },
    { id: 'Closed', label: `Closed (${counts?.closed ?? 0})` },
  ]

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onApply && onApply()
    }
  }

  return (
    <div className="space-y-3">
      {/* 1. Status Pill Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 2. Filter Inputs Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3 w-full">
          {/* Search Input */}
          <div className="flex-1 min-w-[220px]">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Enquiry
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by customer, machine, phone, city..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
              />
            </div>
          </div>

          {/* Enquiry Type Dropdown */}
          <div className="w-36 sm:w-40 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Enquiry Type
            </label>
            <div className="relative">
              <select
                value={enquiryType}
                onChange={(e) => onEnquiryTypeChange && onEnquiryTypeChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="w-36 sm:w-40 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status Filter
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReset}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Filtering...</span>
                </>
              ) : (
                <span>Apply Filter</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
