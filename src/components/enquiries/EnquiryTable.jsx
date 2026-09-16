import React, { useState, useEffect, useRef } from 'react'
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  PhoneCall,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  CheckCircle2,
  ToggleLeft,
  ShoppingBag,
  Repeat,
  MapPin,
  Calendar,
  MessageSquare,
} from 'lucide-react'

export function EnquiryTable({
  enquiries = [],
  pagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  selectedEnquiryId,
  selectedIds = [],
  onSelectionChange,
  onSelectEnquiry,
  onUpdateStatus,
  onDeleteEnquiry,
  onBulkStatus,
  onBulkDelete,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Close 3-dots dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange && onSelectionChange(enquiries.map((q) => q._id || q.id))
    } else {
      onSelectionChange && onSelectionChange([])
    }
  }

  const handleToggleRow = (e, id) => {
    e.stopPropagation()
    if (selectedIds.includes(id)) {
      onSelectionChange && onSelectionChange(selectedIds.filter((item) => item !== id))
    } else {
      onSelectionChange && onSelectionChange([...selectedIds, id])
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-[#E0F2FE] text-[#0369A1] border border-sky-200'
      case 'Contacted':
        return 'bg-[#FEF3C7] text-[#92400E] border border-amber-200'
      case 'Converted':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Closed':
        return 'bg-[#F1F5F9] text-[#475569] border border-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const total = pagination?.total || 0
  const currentPage = pagination?.page || 1
  const limit = pagination?.limit || 10
  const totalPages = pagination?.totalPages || 1

  const fromRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const toRecord = Math.min(currentPage * limit, total)

  // Page Numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* ─── BULK ACTION BAR ─── */}
      {selectedIds.length > 0 && (
        <div className="bg-[#FEF3C7] border-b border-[#F5A623]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#F5A623] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-900">
              {selectedIds.length} enquiry record{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Contacted', selectedIds)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Mark Contacted</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Converted', selectedIds)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Converted</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Closed', selectedIds)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Closed</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkDelete && onBulkDelete(selectedIds)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="h-4 w-[1px] bg-amber-300 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => onSelectionChange && onSelectionChange([])}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[950px]">
          {/* Table Header */}
          <thead className="bg-[#F8FAFC] text-slate-500 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={enquiries.length > 0 && selectedIds.length === enquiries.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Enquiry Details</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Machine / Service</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3 text-center w-12">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-24 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-4 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-16 h-5 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-6 h-6 bg-slate-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : enquiries.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Enquiries Found</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Try changing your search term or status filter to view customer enquiries.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Enquiries
              enquiries.map((row, idx) => {
                const id = row._id || row.id
                const isSelected = selectedEnquiryId === id
                const isChecked = selectedIds.includes(id)
                const customerName = row.name || row.customerName || 'Customer'
                const initials = customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()

                const dateFormatted = row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : row.date || 'Recent'

                const timeFormatted = row.createdAt
                  ? new Date(row.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : row.time || ''

                return (
                  <tr
                    key={id}
                    onClick={() => onSelectEnquiry(row)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-50/70 hover:bg-amber-50/90'
                        : isChecked
                        ? 'bg-amber-50/40'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleToggleRow(e, id)}
                        className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>

                    {/* Index Number */}
                    <td className="py-3 px-2 text-center text-slate-400 font-bold">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-[#F5A623] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {row.enquiryId || `#ENQ-${1000 + idx}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{row.phone || row.customerPhone}</div>
                      <div className="text-[11px] text-slate-400">{row.email || row.customerEmail || 'No email'}</div>
                    </td>

                    {/* Machine / Service */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">
                        {row.machine || row.machineName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {row.fullMachineName || row.machine}
                      </div>
                    </td>

                    {/* Enquiry Type */}
                    <td className="py-3 px-3">
                      {row.enquiryType === 'Buy' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Buy</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Repeat className="w-3 h-3" />
                          <span>Rent</span>
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {row.location || row.preferredLocation || 'India'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-700">{dateFormatted}</div>
                      <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeFormatted}</span>
                      </div>
                    </td>

                    {/* Action 3-Dots */}
                    <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === id ? null : id)
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu Popup */}
                      {activeMenuId === id && (
                        <div
                          ref={menuRef}
                          className="absolute right-3 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onSelectEnquiry(row)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>View Full Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onUpdateStatus && onUpdateStatus(id, 'Contacted')
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                            <span>Mark Contacted</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onUpdateStatus && onUpdateStatus(id, 'Converted')
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Mark Converted</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onUpdateStatus && onUpdateStatus(id, 'Closed')
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Mark Closed</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onDeleteEnquiry && onDeleteEnquiry(row)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete Enquiry</span>
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

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>Showing </span>
          <span className="font-bold text-slate-800">
            {fromRecord} to {toRecord}
          </span>
          <span> of </span>
          <span className="font-bold text-slate-800">{total}</span>
          <span> enquiries</span>
        </div>

        {/* Center Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((pageItem, pIdx) => {
            if (pageItem === '...') {
              return (
                <span key={pIdx} className="px-1 text-slate-400">
                  ...
                </span>
              )
            }
            const isActive = pageItem === currentPage
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => onPageChange && onPageChange(pageItem)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#F5A623] text-slate-950 shadow-2xs'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageItem}
              </button>
            )
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <div className="relative">
            <select
              value={String(limit)}
              onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
              className="appearance-none pl-2.5 pr-6 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#F5A623] cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}
