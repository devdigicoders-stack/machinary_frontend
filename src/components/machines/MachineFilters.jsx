import React from 'react'
import { Search, ChevronDown, RefreshCw } from 'lucide-react'

export function MachineFilters({
  searchTerm = '',
  onSearchChange,
  categoryFilter = 'All',
  onCategoryChange,
  machineTypeFilter = 'All',
  onMachineTypeChange,
  ownerFilter = 'All',
  onOwnerChange,
  statusFilter = 'All',
  onStatusChange,
  categories = [],
  owners = [],
  onReset,
  onApply,
  isLoading = false,
}) {
  const defaultCategories = [
    'Backhoe Loader',
    'Tipper Truck',
    'Excavator',
    'Tractor',
    'Truck',
  ]

  const machineTypes = [
    'All',
    'Commercial',
    'Construction',
    'Agriculture',
    'Heavy Equipment',
  ]

  const formattedCategories = categories
    .map((c) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean)

  const availableCategories = Array.from(
    new Set(['All', ...(formattedCategories.length > 0 ? formattedCategories : defaultCategories)])
  )

  const availableOwners = Array.from(new Set(['All', ...owners]))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onApply && onApply()
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs">
      <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
        {/* 1. Search Input */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Search Machine
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name, model, owner, reg number..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
            />
          </div>
        </div>

        {/* 2. Category Dropdown */}
        <div className="w-full sm:w-32 lg:w-36 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Category
          </label>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Machine Type Dropdown */}
        <div className="w-full sm:w-32 lg:w-36 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Type
          </label>
          <div className="relative">
            <select
              value={machineTypeFilter}
              onChange={(e) => onMachineTypeChange && onMachineTypeChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              {machineTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4. Owner Dropdown */}
        <div className="w-full sm:w-32 lg:w-36 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Owner
          </label>
          <div className="relative">
            <select
              value={ownerFilter}
              onChange={(e) => onOwnerChange && onOwnerChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              {availableOwners.map((o) => (
                <option key={o} value={o}>
                  {o === 'All' ? 'All Owners' : o}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 5. Status Dropdown */}
        <div className="w-full sm:w-28 lg:w-32 shrink-0">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 6. Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
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
