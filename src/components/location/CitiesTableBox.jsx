import React, { useState } from 'react'
import {
  Search,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'

export function CitiesTableBox({
  selectedStateName = 'Uttar Pradesh',
  cities = [],
  onAddCity,
  onActionClick,
  onStatusChange,
  loading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cities.map((c) => c.id || c._id))
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

  const filteredCities = cities.filter((c) =>
    (c.name || c.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.max(1, Math.ceil(filteredCities.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, filteredCities.length)
  const currentCities = filteredCities.slice(startIdx, endIdx)

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Box Header Toolbar */}
        <div className="p-3.5 border-b border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-white">
          <h2 className="text-sm font-bold text-slate-900 shrink-0">
            Cities in {selectedStateName} ({cities.length})
          </h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search city name..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#F5A623]/25 transition-all"
              />
            </div>

            {/* + Add City Button */}
            <button
              type="button"
              onClick={onAddCity}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add City</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={cities.length > 0 && selectedIds.length === cities.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-8 text-center">#</th>
                <th className="py-2.5 px-3">City Name</th>
                <th className="py-2.5 px-3 text-center">Pincode(s)</th>
                <th className="py-2.5 px-3 text-center">Tier</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-2 text-center w-10">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin w-5 h-5 border-2 border-[#F5A623] border-t-transparent rounded-full mb-1" />
                    <div className="text-[11px] font-semibold">Loading cities in {selectedStateName}...</div>
                  </td>
                </tr>
              ) : currentCities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="text-sm font-semibold">No cities found in {selectedStateName}</div>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Add City" to register equipment hubs</p>
                  </td>
                </tr>
              ) : (
                currentCities.map((row, idx) => {
                  const rowId = row.id || row._id
                  const isChecked = selectedIds.includes(rowId)

                  return (
                    <tr
                      key={rowId}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleRow(e, rowId)}
                          className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                        />
                      </td>

                      {/* # Index */}
                      <td className="py-3 px-2 text-center text-slate-400 font-medium">
                        {startIdx + idx + 1}
                      </td>

                      {/* City Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {row.name || row.city}
                      </td>

                      {/* Pincode(s) Count */}
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {row.pincodesCount || 1}
                      </td>

                      {/* Tier */}
                      <td className="py-3 px-3 text-center text-[11px] text-slate-500 font-medium">
                        {row.tier || 'Tier 2'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold ${
                            row.status === 'Active'
                              ? 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
                              : 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Action Menu */}
                      <td
                        className="py-3 px-2 text-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === rowId && (
                          <div className="absolute right-2 top-8 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                if (onActionClick) onActionClick(row, 'edit')
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit City</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onStatusChange) {
                                  onStatusChange(rowId, row.status === 'Active' ? 'Inactive' : 'Active')
                                }
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
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
                            <button
                              type="button"
                              onClick={() => {
                                if (onActionClick) onActionClick(row, 'delete')
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Delete City</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredCities.length > 0 ? startIdx + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-800">{endIdx}</span> of{' '}
          <span className="font-semibold text-slate-800">{filteredCities.length}</span> cities
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, pIdx) => {
            const pg = pIdx + 1
            return (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                  safePage === pg
                    ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            )
          })}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
