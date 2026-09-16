import React, { useState } from 'react'
import {
  MoreVertical,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Slash,
  Trash2,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function ReportedTable({
  reports = [],
  onSelectReport,
  onResolveReport,
  onDismissReport,
  onDelistListing,
  loading = false,
}) {
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(reports.map((r) => r.reportId || r._id || r.id))
    } else {
      setSelectedRowIds([])
    }
  }

  const handleToggleRow = (e, id) => {
    e.stopPropagation()
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((item) => item !== id))
    } else {
      setSelectedRowIds([...selectedRowIds, id])
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
      case 'Resolved':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Dismissed':
      case 'Rejected':
        return 'bg-slate-100 text-slate-700 border border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Container with no-scrollbar */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          {/* Table Header */}
          <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={reports.length > 0 && selectedRowIds.length === reports.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Listing Details</th>
              <th className="py-3 px-3">Reported By</th>
              <th className="py-3 px-3">Violation Reason</th>
              <th className="py-3 px-3">Reported On</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2" />
                  <div className="text-xs font-semibold">Loading reported listings...</div>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="text-3xl mb-1">🛡️</div>
                  <div className="text-sm font-bold text-slate-700">No reported listings found</div>
                  <p className="text-xs text-slate-400 mt-0.5">All platform listings comply with guidelines</p>
                </td>
              </tr>
            ) : (
              reports.map((row, idx) => {
                const rowId = row.reportId || row._id || row.id
                const isChecked = selectedRowIds.includes(rowId)
                const imgUrl = getImageUrl(row.image)

                return (
                  <tr
                    key={rowId}
                    onClick={() => onSelectReport && onSelectReport(row)}
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

                    {/* Index Number */}
                    <td className="py-3 px-2 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Listing Details */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center p-0.5">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={row.listingTitle || row.title}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = '🚜'
                              }}
                            />
                          ) : (
                            <span className="text-lg">🚜</span>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-xs">
                            {row.listingTitle || row.title}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-normal">
                            Code: {row.listingCode || 'MH-1000'} | Category: {row.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Reported By */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">
                            {row.reporterName}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-normal">
                            {row.reporterEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-3 font-medium text-slate-700 max-w-xs truncate">
                      <div className="font-semibold text-slate-900 truncate">{row.reason}</div>
                      <div className="text-[10.5px] text-slate-400 truncate max-w-xs">{row.description}</div>
                    </td>

                    {/* Reported On */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-[11px]">
                          {formatDate(row.reportDate || row.date)}
                        </span>
                        <span className="text-[10.5px] text-slate-400">{row.reportTime || row.time || '10:00 AM'}</span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectReport && onSelectReport(row)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-md transition-colors cursor-pointer border border-slate-200/80 shadow-2xs"
                        >
                          View Details
                        </button>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === rowId && (
                            <div className="absolute right-0 top-8 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-20 animate-in fade-in duration-150 text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onSelectReport) onSelectReport(row)
                                  setActiveMenuId(null)
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>Inspect Report</span>
                              </button>

                              {row.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onResolveReport) onResolveReport(row.listingId || row._id, 'Kept Active')
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Mark Resolved</span>
                                </button>
                              )}

                              {row.status !== 'Dismissed' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onDismissReport) onDismissReport(row.listingId || row._id)
                                    setActiveMenuId(null)
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Slash className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Dismiss False Flag</span>
                                </button>
                              )}

                              <div className="border-t border-slate-100 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  if (onDelistListing) onDelistListing(row.listingId || row._id, row.listingTitle)
                                  setActiveMenuId(null)
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delist / Take Down</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{reports.length}</span> reported items
        </div>
      </div>
    </div>
  )
}
