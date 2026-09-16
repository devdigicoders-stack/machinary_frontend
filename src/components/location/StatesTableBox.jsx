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

export function StatesTableBox({
  states = [],
  selectedStateId,
  onSelectState,
  onAddState,
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
      setSelectedIds(states.map((s) => s.id || s.name))
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

  const filteredStates = states.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.max(1, Math.ceil(filteredStates.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = Math.min(startIdx + pageSize, filteredStates.length)
  const currentStates = filteredStates.slice(startIdx, endIdx)

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
      <div>
        {/* Box Header Toolbar */}
        <div className="p-3.5 border-b border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-white">
          <h2 className="text-sm font-bold text-slate-900 shrink-0">
            States in India ({states.length})
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
                placeholder="Search state name..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#F5A623]/25 transition-all"
              />
            </div>

            {/* + Add State Button */}
            <button
              type="button"
              onClick={onAddState}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add State</span>
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
                    checked={states.length > 0 && selectedIds.length === states.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-8 text-center">#</th>
                <th className="py-2.5 px-3">State Name</th>
                <th className="py-2.5 px-3">State Code</th>
                <th className="py-2.5 px-3 text-center">No. of Cities</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-2 text-center w-10">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="inline-block animate-spin w-5 h-5 border-2 border-[#F5A623] border-t-transparent rounded-full mb-1" />
                    <div className="text-[11px] font-semibold">Loading states...</div>
                  </td>
                </tr>
              ) : currentStates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <div className="text-sm font-semibold">No states found</div>
                  </td>
                </tr>
              ) : (
                currentStates.map((row, idx) => {
                  const rowId = row.id || row.name
                  const isChecked = selectedIds.includes(rowId)
                  const isSelected = selectedStateId === row.name || selectedStateId === row.id

                  return (
                    <tr
                      key={rowId}
                      onClick={() => onSelectState && onSelectState(row)}
                      className={`transition-colors cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-50/70 border-l-4 border-l-[#F5A623]'
                          : 'hover:bg-slate-50/80'
                      }`}
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

                      {/* State Name */}
                      <td className="py-3 px-3 font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        <div className="flex items-center gap-1.5">
                          <span>{row.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-[#F5A623] text-slate-950 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* State Code */}
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {row.code}
                      </td>

                      {/* No. of Cities */}
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {row.citiesCount}
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
                          <div className="absolute right-2 top-8 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectState) onSelectState(row)
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Cities</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onStatusChange) {
                                  onStatusChange(row.name, row.status === 'Active' ? 'Inactive' : 'Active')
                                }
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              {row.status === 'Active' ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                  <span className="text-rose-600">Deactivate All</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-600">Activate All</span>
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
                              <span>Delete State</span>
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
          Showing <span className="font-semibold text-slate-800">{filteredStates.length > 0 ? startIdx + 1 : 0}</span> to{' '}
          <span className="font-semibold text-slate-800">{endIdx}</span> of{' '}
          <span className="font-semibold text-slate-800">{filteredStates.length}</span> states
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
