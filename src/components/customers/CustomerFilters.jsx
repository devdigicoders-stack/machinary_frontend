import React from 'react'
import { Search, ChevronDown, RefreshCw } from 'lucide-react'

export function CustomerFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  regTypeFilter,
  onRegTypeChange,
  locationFilter,
  onLocationChange,
  onReset,
  onApply,
  isLoading = false,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onApply && onApply()
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-wrap lg:flex-nowrap items-end gap-2.5 sm:gap-3 w-full">
        {/* 1. Search Bar */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Search Customer
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, email, phone, city..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 focus:border-[#F5A623] transition-all"
            />
          </div>
        </div>

        {/* 2. Status Dropdown */}
        <div className="w-28 sm:w-32 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 focus:border-[#F5A623] transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Registration Type */}
        <div className="w-36 sm:w-40 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Registration Type
          </label>
          <div className="relative">
            <select
              value={regTypeFilter}
              onChange={(e) => onRegTypeChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 focus:border-[#F5A623] transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Business">Business</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Location Dropdown */}
        <div className="w-36 sm:w-40 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Location
          </label>
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-[13px] text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 focus:border-[#F5A623] transition-all cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Lucknow">Lucknow, UP</option>
              <option value="Delhi">Delhi, DL</option>
              <option value="Noida">Noida, UP</option>
              <option value="Kanpur">Kanpur, UP</option>
              <option value="Varanasi">Varanasi, UP</option>
              <option value="Agra">Agra, UP</option>
              <option value="Prayagraj">Prayagraj, UP</option>
              <option value="Gorakhpur">Gorakhpur, UP</option>
              <option value="Jaipur">Jaipur, RJ</option>
              <option value="Indore">Indore, MP</option>
              <option value="Ahmedabad">Ahmedabad, GJ</option>
              <option value="Dehradun">Dehradun, UK</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 5. Buttons: Reset & Apply Filter */}
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
  )
}
