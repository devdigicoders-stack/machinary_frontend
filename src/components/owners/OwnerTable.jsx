import { useState, useEffect, useRef } from 'react'
import {
  MoreVertical,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
} from 'lucide-react'

export function OwnerTable({
  owners = [],
  pagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
  selectedIds = [],
  onSelectionChange,
  onSelectOwner,
  onStatusToggle,
  onEditClick,
  onDeleteClick,
  onBulkStatus,
  onBulkDelete,
  onPageChange,
  onPerPageChange,
  isLoading = false,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Close 3-dots popup on outside click
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
      onSelectionChange && onSelectionChange(owners.map((o) => o._id || o.id))
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

  const total = pagination?.total || 0
  const currentPage = pagination?.page || 1
  const limit = pagination?.limit || 10
  const totalPages = pagination?.totalPages || 1

  const fromRecord = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const toRecord = Math.min(currentPage * limit, total)

  // Pagination page numbers generator
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
              {selectedIds.length} owner record{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Active', selectedIds)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Activate</span>
            </button>

            <button
              type="button"
              onClick={() => onBulkStatus && onBulkStatus('Inactive', selectedIds)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Deactivate</span>
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

      {/* Table Container with no-scrollbar */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap min-w-[900px]">
          {/* Table Header */}
          <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={owners.length > 0 && selectedIds.length === owners.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Owner Details</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 text-center">Machines</th>
              <th className="py-3 px-3">Join Date</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center w-10">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: 6 }).map((_, idx) => (
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
                        <div className="w-36 h-2.5 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-24 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-10 h-5 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="w-20 h-3.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-16 h-5 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="w-6 h-6 bg-slate-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : owners.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No Owners Found</p>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Try adjusting your search terms or filters to find registered owners.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Owners
              owners.map((row, idx) => {
                const id = row._id || row.id
                const isChecked = selectedIds.includes(id)
                const isActive = row.status === 'Active'

                const initials =
                  row.initials ||
                  (row.name
                    ? row.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'OW')

                const joinDateFormatted = row.createdAt
                  ? new Date(row.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : row.joinDate || 'Recent'

                return (
                  <tr
                    key={id}
                    onClick={() => onSelectOwner && onSelectOwner(row)}
                    className={`transition-colors cursor-pointer group ${
                      isChecked ? 'bg-amber-50/40' : 'hover:bg-slate-50/80'
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
                    <td className="py-3 px-2 text-center text-slate-400 font-medium">
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Owner Details (Avatar + Name + Business/Email) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        {row.avatarImg ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={row.avatarImg}
                              alt={row.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerText = initials
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              row.avatarBg || 'bg-slate-900 text-[#F5A623]'
                            }`}
                          >
                            {initials}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-xs truncate">
                            {row.name}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-normal truncate max-w-[170px]">
                            {row.businessName ? row.businessName : row.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{row.phone}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {row.location || `${row.city || 'India'}, ${row.state || ''}`}
                        </span>
                      </div>
                    </td>

                    {/* Machines Count Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-3 py-0.5 rounded-md text-[11px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-sky-200">
                        {row.machines ?? row.fleetSize ?? 1}
                      </span>
                    </td>

                    {/* Join Date */}
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {joinDateFormatted}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${
                          isActive
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
                            : 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    {/* Action Menu (3-Dots) */}
                    <td
                      className="py-3 px-3 text-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === id ? null : id)}
                        className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
                        title="Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Action Dropdown Menu */}
                      {activeMenuId === id && (
                        <div
                          ref={menuRef}
                          className="absolute right-3 top-8 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in duration-150 text-left"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onSelectOwner && onSelectOwner(row)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>View Full Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onStatusToggle && onStatusToggle(id, isActive ? 'Inactive' : 'Active')
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            {isActive ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                <span>Deactivate Owner</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate Owner</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onEditClick && onEditClick(row)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Edit Details</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null)
                              onDeleteClick && onDeleteClick(row)
                            }}
                            className="w-full px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete Owner</span>
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
      <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>Showing </span>
          <span className="font-semibold text-slate-800">{fromRecord}</span>
          <span> to </span>
          <span className="font-semibold text-slate-800">{toRecord}</span>
          <span> of </span>
          <span className="font-semibold text-slate-800">{total}</span>
          <span> owners</span>
        </div>

        {/* Center: Pagination numbers with amber active */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {getPageNumbers().map((pageItem, pIdx) => {
            if (pageItem === '...') {
              return (
                <span key={pIdx} className="px-1 text-slate-400">
                  ...
                </span>
              )
            }
            const isCurrent = pageItem === currentPage
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => onPageChange && onPageChange(pageItem)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isCurrent
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
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Show per page */}
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={limit}
            onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
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
