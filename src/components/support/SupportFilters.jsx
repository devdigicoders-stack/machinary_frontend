import React from 'react'
import { Search, Calendar, RotateCcw } from 'lucide-react'

export function SupportFilters({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assignedFilter,
  onAssignedChange,
  counts = { all: 0, open: 0, inprogress: 0, resolved: 0, closed: 0 },
  onReset,
}) {
  const tabs = [
    { label: 'All Tickets', count: counts.all || 0, key: 'All' },
    { label: 'Open', count: counts.open || 0, key: 'Open' },
    { label: 'In Progress', count: counts.inprogress || 0, key: 'In Progress' },
    { label: 'Resolved', count: counts.resolved || 0, key: 'Resolved' },
    { label: 'Closed', count: counts.closed || 0, key: 'Closed' },
  ]

  return (
    <div className="space-y-3">
      {/* Status Tabs with Dynamic Counts */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#F5A623] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#F5A623] hover:text-[#F5A623]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-3 shadow-2xs flex flex-wrap items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket ID, name, subject, phone..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] focus:border-[#F5A623] bg-white text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Ticket Type */}
        <div className="flex flex-col gap-0.5 min-w-[110px]">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Ticket Type</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Technical">Technical</option>
            <option value="Payment">Payment</option>
            <option value="Listing">Listing</option>
            <option value="Account">Account</option>
            <option value="Report">Report</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-0.5 min-w-[110px]">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-0.5 min-w-[100px]">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assigned To */}
        <div className="flex flex-col gap-0.5 min-w-[120px]">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Assigned To</label>
          <select
            value={assignedFilter}
            onChange={(e) => onAssignedChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
          >
            <option value="All">All Agents</option>
            <option value="Neha Sharma">Neha Sharma</option>
            <option value="Amit Kumar">Amit Kumar</option>
            <option value="Rahul Singh">Rahul Singh</option>
            <option value="Pooja Khanna">Pooja Khanna</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>

        {/* Reset Button */}
        {onReset && (
          <div className="flex items-end pt-3 sm:pt-0">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
