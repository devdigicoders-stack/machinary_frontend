import React, { useState } from 'react'
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Trash2,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  User,
  Clock,
  CheckCircle,
} from 'lucide-react'

export function NotificationTable({
  notifications = [],
  onActionClick,
  onStatusChange,
  totalCount = 0,
  currentPage = 1,
  setCurrentPage,
  itemsPerPage = 10,
  setItemsPerPage,
  isLoading = false,
  onBulkDelete,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map((n) => n.id || n._id))
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

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Push':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-sky-200">
            <Smartphone className="w-3 h-3 stroke-[2.2]" />
            <span>Push</span>
          </span>
        )
      case 'Email':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#F3E8FF] text-[#7E22CE] border border-purple-200">
            <Mail className="w-3 h-3 stroke-[2.2]" />
            <span>Email</span>
          </span>
        )
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] border border-emerald-200">
            <MessageSquare className="w-3 h-3 stroke-[2.2]" />
            <span>SMS</span>
          </span>
        )
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
            {type}
          </span>
        )
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Pending':
        return 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
      case 'Failed':
        return 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
      case 'Scheduled':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
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
                  checked={notifications.length > 0 && selectedIds.length === notifications.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Title</th>
              <th className="py-3 px-3">Message Preview</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-3">Audience</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Scheduled At</th>
              <th className="py-3 px-3">Created On</th>
              <th className="py-3 px-3 text-center w-10">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading notifications...</span>
                  </div>
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-600">No notifications found</span>
                    <span className="text-xs text-slate-400">Try adjusting your filters or broadcast a new message</span>
                  </div>
                </td>
              </tr>
            ) : (
              notifications.map((row, idx) => {
                const rowId = row.id || row._id
                const isChecked = selectedIds.includes(rowId)

                return (
                  <tr
                    key={rowId}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleRow(e, rowId)}
                        className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>

                    {/* # Index */}
                    <td className="py-3.5 px-2 text-center text-slate-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-3 font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {row.title}
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-3 text-slate-500 max-w-[240px] truncate" title={row.message}>
                      {row.message}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3 text-center">
                      {getTypeBadge(row.type)}
                    </td>

                    {/* Audience */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {(row.audience || '').includes('All') ? (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{row.audience || row.targetAudience}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Scheduled At */}
                    <td className="py-3.5 px-3 text-slate-600">
                      {row.scheduledDate ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{row.scheduledDate}</span>
                          <span className="text-[10.5px] text-slate-400">{row.scheduledTime}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>

                    {/* Created On */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col text-slate-600">
                        <span className="font-medium text-slate-800">{row.createdDate}</span>
                        <span className="text-[10.5px] text-slate-400">{row.createdTime}</span>
                      </div>
                    </td>

                    {/* Action Menu */}
                    <td
                      className="py-3.5 px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === rowId ? null : rowId)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Action Dropdown Menu */}
                      {activeMenuId === rowId && (
                        <div className="absolute right-3 top-8 w-38 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'view')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'resend')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Resend</span>
                          </button>
                          {row.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onStatusChange) onStatusChange(rowId, 'Delivered')
                                setActiveMenuId(null)
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Mark Delivered</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'delete')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete</span>
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

      {/* Bulk Delete Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-900">
            {selectedIds.length} notification(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded cursor-pointer"
            >
              Deselect All
            </button>
            <button
              type="button"
              onClick={() => {
                if (onBulkDelete) onBulkDelete(selectedIds)
                setSelectedIds([])
              }}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * itemsPerPage, totalCount)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{totalCount}</span> notifications
        </div>

        {/* Center: Pagination numbers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage && setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) {
                acc.push('ellipsis')
              }
              acc.push(p)
              return acc
            }, [])
            .map((item, idx) => {
              if (item === 'ellipsis') {
                return (
                  <span key={`dots-${idx}`} className="px-1 text-slate-400">
                    ...
                  </span>
                )
              }
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCurrentPage && setCurrentPage(item)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                    currentPage === item
                      ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              )
            })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage && setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Show per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              if (setItemsPerPage) setItemsPerPage(Number(e.target.value))
              if (setCurrentPage) setCurrentPage(1)
            }}
            className="border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}
