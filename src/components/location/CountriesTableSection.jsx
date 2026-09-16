import React, { useState } from 'react'
import {
  Search,
  ChevronDown,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function CountriesTableSection({
  countries,
  activeTab,
  onTabChange,
  onImportClick,
  onActionClick,
  onStatusChange,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Name (A - Z)')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(countries.map((c) => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleRow = (e, id) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setSortBy('Name (A - Z)')
  }

  // Filter & Sort
  let displayCountries = countries.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (sortBy === 'Name (A - Z)') {
    displayCountries = [...displayCountries].sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortBy === 'Name (Z - A)') {
    displayCountries = [...displayCountries].sort((a, b) => b.name.localeCompare(a.name))
  } else if (sortBy === 'Most States') {
    displayCountries = [...displayCountries].sort((a, b) => b.statesCount - a.statesCount)
  }

  return (
    <div className="space-y-3">
      {/* 1. Tabs & Import Button Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200/80 rounded-lg shadow-2xs">
          <button
            type="button"
            onClick={() => onTabChange('countries')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'countries'
                ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Countries ({countries.length})
          </button>
          <button
            type="button"
            onClick={() => onTabChange('states')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'states'
                ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            States (28)
          </button>
          <button
            type="button"
            onClick={() => onTabChange('cities')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cities'
                ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Cities (742)
          </button>
        </div>

        {/* Right: Import Button */}
        <button
          type="button"
          onClick={onImportClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Import</span>
        </button>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-3 shadow-2xs">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by country name, code..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
              />
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full sm:w-44 shrink-0">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all cursor-pointer"
              >
                <option value="Name (A - Z)">Name (A - Z)</option>
                <option value="Name (Z - A)">Name (Z - A)</option>
                <option value="Most States">Most States</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              className="flex-1 sm:flex-none px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* 3. Countries Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={countries.length > 0 && selectedIds.length === countries.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-2 w-8 text-center">#</th>
                <th className="py-3 px-3">Country Name</th>
                <th className="py-3 px-3">Country Code</th>
                <th className="py-3 px-3">No. of States</th>
                <th className="py-3 px-3">No. of Cities</th>
                <th className="py-3 px-3">No. of Pincodes</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Created On</th>
                <th className="py-3 px-3 text-center w-10">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {displayCountries.map((row, idx) => {
                const isChecked = selectedIds.includes(row.id)

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleRow(e, row.id)}
                        className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>

                    {/* # Index */}
                    <td className="py-3.5 px-2 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Country Name with Flag */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl leading-none">{row.flag || '🇮🇳'}</span>
                        <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {row.name}
                        </span>
                      </div>
                    </td>

                    {/* Country Code */}
                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      {row.code}
                    </td>

                    {/* No. of States */}
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {row.statesCount}
                    </td>

                    {/* No. of Cities */}
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {row.citiesCount}
                    </td>

                    {/* No. of Pincodes */}
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {row.pincodesCount}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-md text-[11px] font-bold ${
                          row.status === 'Active'
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
                            : 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Created On */}
                    <td className="py-3.5 px-3 font-medium text-slate-500">
                      {row.createdOn}
                    </td>

                    {/* Action Menu */}
                    <td
                      className="py-3.5 px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === row.id && (
                        <div className="absolute right-3 top-8 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'view')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'edit')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onStatusChange) {
                                onStatusChange(row.id, row.status === 'Active' ? 'Inactive' : 'Active')
                              }
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            {row.status === 'Active' ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span className="text-rose-600">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600">Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">1</span> to{' '}
            <span className="font-semibold text-slate-800">{displayCountries.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{countries.length}</span> countries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-[#F5A623] text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
