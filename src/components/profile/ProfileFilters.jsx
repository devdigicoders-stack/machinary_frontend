import React from 'react'
import { Search, Download, RotateCcw } from 'lucide-react'

export function ProfileFilters({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  userTypeFilter,
  onUserTypeChange,
  statusFilter,
  onStatusChange,
  onReset,
  counts = { all: 0, customers: 0, owners: 0, admins: 0 },
  onExport,
}) {
  const tabs = [
    { label: 'All Users', count: counts.all || 0, key: 'All' },
    { label: 'Customers', count: counts.customers || 0, key: 'Customer' },
    { label: 'Owners', count: counts.owners || 0, key: 'Owner' },
    { label: 'Admins', count: counts.admins || 0, key: 'Admin' },
  ]

  return (
    <div className="space-y-3">
      {/* Dynamic Tabs & Export Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap active:scale-95 ${
                activeTab === tab.key
                  ? 'bg-[#F5A623] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#F5A623] hover:text-[#D98200]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, location..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] focus:border-[#F5A623] bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* User Type */}
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">User Role</label>
          <select
            value={userTypeFilter}
            onChange={(e) => onUserTypeChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customer</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {onReset && (
          <div className="flex items-end pt-3 sm:pt-0">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
