import React, { useState } from 'react'
import {
  MoreVertical,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function ListingTable({
  listings = [],
  pagination = {},
  onPageChange,
  onLimitChange,
  onViewListing,
  onEditListing,
  onDeleteListing,
  onStatusChange,
  onBulkDelete,
  onBulkStatus,
  loading = false,
}) {
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(listings.map((l) => l._id || l.id))
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

  const getStatusBadge = (status, approvalStatus) => {
    if (approvalStatus === 'Pending') {
      return 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
    }
    if (approvalStatus === 'Rejected') {
      return 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
    }
    switch (status) {
      case 'Active':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Rent':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
      case 'Sale':
        return 'bg-[#FEF3C7] text-[#D97706] border border-amber-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  const formatPrice = (row) => {
    const rawPrice = row.rateOrPrice || row.price || '0'
    const formatted = rawPrice.startsWith('₹') ? rawPrice : `₹ ${rawPrice}`
    return row.rateUnit ? `${formatted} / ${row.rateUnit}` : formatted
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    const parts = [loc.city, loc.state].filter(Boolean)
    return parts.join(', ') || 'India'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const currentPage = pagination.page || 1
  const totalPages = pagination.pages || 1
  const totalCount = pagination.total ?? listings.length
  const limit = pagination.limit || 50

  const startRecord = listings.length === 0 ? 0 : (currentPage - 1) * limit + 1
  const endRecord = listings.length === 0 ? 0 : startRecord + listings.length - 1

  return (
    <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Bulk Action Bar (when rows are checked) */}
      {selectedRowIds.length > 0 && (
        <div className="bg-amber-50/80 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <span>{selectedRowIds.length} listing(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onBulkStatus) onBulkStatus(selectedRowIds, 'Active')
                setSelectedRowIds([])
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer"
            >
              Mark Active
            </button>
            <button
              type="button"
              onClick={() => {
                if (onBulkStatus) onBulkStatus(selectedRowIds, 'Inactive')
                setSelectedRowIds([])
              }}
              className="px-2.5 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer"
            >
              Mark Inactive
            </button>
            <button
              type="button"
              onClick={() => {
                if (onBulkDelete) onBulkDelete(selectedRowIds)
                setSelectedRowIds([])
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container with no-scrollbar */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          {/* Table Header */}
          <thead className="bg-[#F8FAFC] text-slate-600 font-bold border-b border-slate-200 uppercase text-[10.5px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8 text-center">
                <input
                  type="checkbox"
                  checked={listings.length > 0 && selectedRowIds.length === listings.length}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="py-3 px-2 w-8 text-center">#</th>
              <th className="py-3 px-3">Listing Details</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-center">Type</th>
              <th className="py-3 px-3">Owner</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 font-bold text-slate-900">Price</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Created On</th>
              <th className="py-3 px-3 text-center w-10">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2"></div>
                  <div className="text-xs font-semibold">Loading live listings from database...</div>
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="text-3xl mb-1">🚜</div>
                  <div className="text-sm font-bold text-slate-700">No listings found</div>
                  <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or add a new machine listing</p>
                </td>
              </tr>
            ) : (
              listings.map((row, idx) => {
                const rowId = row._id || row.id
                const isChecked = selectedRowIds.includes(rowId)
                const imageUrl = getImageUrl(row.image || (row.images && row.images[0]))

                return (
                  <tr
                    key={rowId}
                    onClick={() => onViewListing && onViewListing(row)}
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
                      {(currentPage - 1) * limit + idx + 1}
                    </td>

                    {/* Listing Details */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center p-0.5 relative">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={row.title}
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.parentElement.innerHTML = '🚜'
                              }}
                            />
                          ) : (
                            <span className="text-lg">🚜</span>
                          )}
                          {row.isFeatured && (
                            <span
                              className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white"
                              title="Promoted / Featured"
                            />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-xs">
                              {row.title}
                            </span>
                            {row.listingCode && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                {row.listingCode}
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] text-slate-400 font-normal truncate max-w-[220px]">
                            {row.subtitle || row.description || `Model Year ${row.modelYear || '2023'}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {row.category}
                    </td>

                    {/* Type Pill Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getTypeBadge(
                          row.type
                        )}`}
                      >
                        {row.type}
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <div>{row.ownerName || row.owner}</div>
                      {row.ownerPhone && (
                        <div className="text-[10px] font-normal text-slate-400">{row.ownerPhone}</div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatLocation(row.location)}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatPrice(row)}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.status,
                          row.approvalStatus
                        )}`}
                      >
                        {row.approvalStatus === 'Pending'
                          ? 'Pending Approval'
                          : row.approvalStatus === 'Rejected'
                          ? 'Rejected'
                          : row.status}
                      </span>
                    </td>

                    {/* Created On */}
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {formatDate(row.createdAt || row.createdOn)}
                    </td>

                    {/* Action Menu */}
                    <td
                      className="py-3 px-3 text-center relative"
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
                        <div className="absolute right-3 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-20 animate-in fade-in duration-150 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewListing) onViewListing(row)
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
                              if (onEditListing) onEditListing(row)
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Edit Listing</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onStatusChange) onStatusChange(rowId, row.status === 'Active' ? 'Inactive' : 'Active')
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                          >
                            {row.status === 'Active' ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Set Inactive</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Set Active</span>
                              </>
                            )}
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              if (onDeleteListing) onDeleteListing(rowId, row.title)
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Delete Listing</span>
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
          <span className="font-semibold text-slate-800">{totalCount.toLocaleString()}</span> listings
        </div>

        {/* Center: Pagination controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, pIdx) => {
            const pageNum = pIdx + 1
            const isCurrent = pageNum === currentPage
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange && onPageChange(pageNum)}
                className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          {totalPages > 5 && <span className="px-1 text-slate-400">...</span>}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
            onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            className="border border-slate-200 rounded-md px-2 py-1 text-xs font-medium text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}
