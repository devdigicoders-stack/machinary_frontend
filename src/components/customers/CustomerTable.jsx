import React, { useState, useEffect, useRef } from 'react'
import {
  Phone,
  MapPin,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Building2,
  User,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { getAvatarUrl } from '../../services/authService'

const avatarBgs = [
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-orange-100 text-orange-700 border-orange-200',
]

export function CustomerTable({
  customers = [],
  pagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  selectedIds = [],
  onSelectionChange,
  onPageChange,
  onPerPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onBulkStatus,
  onBulkDelete,
  isLoading = false,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length && customers.length > 0) {
      onSelectionChange && onSelectionChange([])
    } else {
      onSelectionChange && onSelectionChange(customers.map((c) => c._id || c.id))
    }
  }

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange && onSelectionChange(selectedIds.filter((item) => item !== id))
    } else {
      onSelectionChange && onSelectionChange([...selectedIds, id])
    }
  }

  const total = pagination?.total || 0
  const currentPage = pagination?.page || 1
  const limit = pagination?.limit || 10
  const totalPages = pagination?.totalPages || 1

  const fromRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const toRecord = Math.min(currentPage * limit, total)

  // Generate page numbers for pagination bar
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
    <div className="bg-white rounded-lg border border-slate-200/70 shadow-xs overflow-hidden">
      {/* ─── BULK ACTION BAR ─── */}
      {selectedIds.length > 0 && (
        <div className="bg-[#FEF3C7] border-b border-[#F5A623]/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-[#F5A623] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-bold text-slate-900">
              {selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Active', selectedIds)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Active</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Inactive', selectedIds)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ToggleLeft className="w-3.5 h-3.5" />
              <span>Mark Inactive</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkDelete && onBulkDelete(selectedIds)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <div className="h-4 w-[1px] bg-amber-300 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={() => onSelectionChange && onSelectionChange([])}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table with smooth scroll */}
      <div className="w-full overflow-x-auto no-scrollbar relative">
        <table className="w-full min-w-[980px] text-left border-collapse text-xs sm:text-[12.5px]">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
              {/* Checkbox Header */}
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === customers.length && customers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-10 text-center">#</th>
              <th className="py-3 px-3">Customer Details</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 whitespace-nowrap">Registration Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-center">Listings</th>
              <th className="py-3 px-3 text-center w-12">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-2 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="space-y-1">
                        <div className="w-28 h-3.5 bg-slate-200 rounded" />
                        <div className="w-36 h-3 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-24 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-16 h-5 bg-slate-200 rounded-md" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-6 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-6 h-6 bg-slate-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Customers Found</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Try adjusting your search criteria or filter options to find customers.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Customer Records
              customers.map((cust, idx) => {
                const id = cust._id || cust.id
                const isSelected = selectedIds.includes(id)
                const initials = (cust.name || 'CU')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()

                const bgClass = avatarBgs[idx % avatarBgs.length]
                const regDateFormatted = cust.createdAt
                  ? new Date(cust.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : cust.regDate || 'Recently'

                return (
                  <tr
                    key={id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>

                    {/* # Index */}
                    <td className="py-3 px-2 text-center font-bold text-slate-500">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Customer Details */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border ${
                            cust.avatar ? 'border-slate-200' : bgClass
                          }`}
                        >
                          {cust.avatar ? (
                            <img
                              src={getAvatarUrl(cust.avatar)}
                              alt={cust.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span>{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 leading-tight truncate max-w-[160px]">
                            {cust.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate max-w-[170px]">
                            {cust.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-[12px]">{cust.phone}</span>
                      </div>
                    </td>

                    {/* Registration Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {cust.registrationType === 'Business' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Building2 className="w-3 h-3" />
                            <span>Business</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Individual</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.location || cust.city || 'India'}</span>
                      </div>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[12px]">
                      {regDateFormatted}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          cust.status === 'Active'
                            ? 'bg-[#DCFCE7] text-[#15803D] border-emerald-200'
                            : cust.status === 'Blocked'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-[#FFE4E6] text-[#BE123C] border-rose-200'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    {/* Listings Count */}
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {cust.listings || 0}
                    </td>

                    {/* Action Dropdown Menu */}
                    <td className="py-3 px-3 text-center whitespace-nowrap relative">
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
                          className="absolute right-3 top-10 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onView && onView(cust)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>View Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onEdit && onEdit(cust)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-500" />
                            <span>Edit Customer</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onToggleStatus && onToggleStatus(cust)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            {cust.status === 'Active' ? (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5 text-rose-500" />
                                <span>Mark Inactive</span>
                              </>
                            ) : (
                              <>
                                <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Mark Active</span>
                              </>
                            )}
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onDelete && onDelete(cust)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete Customer</span>
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

      {/* Pagination Footer Bar */}
      <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        {/* Left Status Counter */}
        <div>
          <span>Showing </span>
          <span className="font-bold text-slate-800">
            {fromRecord} to {toRecord}
          </span>
          <span> of </span>
          <span className="font-bold text-slate-800">{total}</span>
          <span> customers</span>
        </div>

        {/* Center Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Previous Page */}
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
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

          {/* Next Page */}
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

        {/* Right Rows Per Page Selector */}
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
