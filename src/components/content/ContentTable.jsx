import React, { useState } from 'react'
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react'

export function ContentTable({
  pages = [],
  onActionClick,
  onStatusChange,
  totalCount = 10,
  currentPage = 1,
  totalPages = 1,
  limit = 10,
  onPageChange,
  onLimitChange,
  loading = false,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pages.map((p) => p._id || p.id))
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

  const getPageTypeBadge = (type) => {
    switch (type) {
      case 'Static':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
      case 'Legal':
        return 'bg-[#F3E8FF] text-[#7E22CE] border border-purple-200'
      case 'Dynamic':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Draft':
        return 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
      case 'Under Review':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const startRecord = pages.length === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = pages.length === 0 ? 0 : startRecord + pages.length - 1

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
                  checked={pages.length > 0 && selectedIds.length === pages.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Page Title</th>
              <th className="py-3 px-3">URL / Slug</th>
              <th className="py-3 px-3 text-center">Page Type</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Last Updated</th>
              <th className="py-3 px-3">Updated By</th>
              <th className="py-3 px-3 text-center w-10">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2" />
                  <div className="text-xs font-semibold">Loading CMS pages from database...</div>
                </td>
              </tr>
            ) : pages.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <div className="text-sm font-bold text-slate-700">No CMS pages found</div>
                  <p className="text-xs text-slate-400 mt-0.5">Click "+ Add New Page" to publish content</p>
                </td>
              </tr>
            ) : (
              pages.map((row, idx) => {
                const rowId = row._id || row.id
                const isChecked = selectedIds.includes(rowId)

                return (
                  <tr
                    key={rowId}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onActionClick && onActionClick(row, 'view')}
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
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Page Title & Subtitle */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-xs">
                          {row.title}
                        </span>
                        <span className="text-[10.5px] text-slate-400 font-normal">
                          {row.subtitle || 'Website page content'}
                        </span>
                      </div>
                    </td>

                    {/* URL / Slug */}
                    <td className="py-3.5 px-3 font-mono text-[11.5px] text-slate-600">
                      {row.slug}
                    </td>

                    {/* Page Type Pill */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getPageTypeBadge(
                          row.pageType
                        )}`}
                      >
                        {row.pageType}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-0.5 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Last Updated (Date & Time stacked) */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col text-slate-600">
                        <span className="font-medium text-slate-800">{row.updatedDate}</span>
                        <span className="text-[10.5px] text-slate-400">{row.updatedTime}</span>
                      </div>
                    </td>

                    {/* Updated By (Avatar + Name) */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        {row.authorAvatar ? (
                          <img
                            src={row.authorAvatar}
                            alt={row.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {(row.authorName || 'A')[0]}
                          </div>
                        )}
                        <span className="font-semibold text-slate-800 text-xs">
                          {row.authorName || 'Admin'}
                        </span>
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
                        <div className="absolute right-3 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'view')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>View Page</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'edit')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Content</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onStatusChange) onStatusChange(rowId)
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                          >
                            {row.status === 'Published' ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Switch to Draft</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Publish Live</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onActionClick) onActionClick(row, 'delete')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete Page</span>
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

      {/* Dynamic Pagination Footer */}
      <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{startRecord}</span> to{' '}
          <span className="font-semibold text-slate-800">{endRecord}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> pages
        </div>

        {/* Center: Pagination numbers */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, pIdx) => {
            const pg = pIdx + 1
            return (
              <button
                key={pg}
                type="button"
                onClick={() => onPageChange && onPageChange(pg)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            )
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Show per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
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
