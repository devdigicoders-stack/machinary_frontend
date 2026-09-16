import React, { useState } from 'react'
import {
  MoreVertical,
  MapPin,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function FeaturedTable({
  promotions = [],
  onViewDetails,
  onStatusChange,
  onRemovePromotion,
  loading = false,
}) {
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRowIds(promotions.map((p) => p._id || p.id))
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
      case 'Active':
        return 'bg-[#DCFCE7] text-[#15803D] border border-emerald-200'
      case 'Expired':
        return 'bg-[#FEE2E2] text-[#B91C1C] border border-rose-200'
      case 'Scheduled':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200'
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

  const getPromotionBadge = (promoType) => {
    switch (promoType) {
      case 'Spotlight':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
      case 'Featured':
        return 'bg-[#FEF3C7] text-[#B45309] border border-amber-200'
      case 'Top Listing':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Promoted':
        return 'bg-[#F3E8FF] text-[#7E22CE] border border-purple-200'
      default:
        return 'bg-amber-50 text-amber-800 border border-amber-200'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    return [loc.city, loc.state].filter(Boolean).join(', ') || 'India'
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
                  checked={promotions.length > 0 && selectedRowIds.length === promotions.length}
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
              <th className="py-3 px-3 text-center">Promotion Badge</th>
              <th className="py-3 px-3">Start Date</th>
              <th className="py-3 px-3">End Date</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-right font-bold text-slate-800">Views ↑</th>
              <th className="py-3 px-3 text-center w-10">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2" />
                  <div className="text-xs font-semibold">Loading promoted machinery from database...</div>
                </td>
              </tr>
            ) : promotions.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-400">
                  <div className="text-3xl mb-1">⭐</div>
                  <div className="text-sm font-bold text-slate-700">No promoted listings active</div>
                  <p className="text-xs text-slate-400 mt-0.5">Click "Add Promotion" to boost machine visibility</p>
                </td>
              </tr>
            ) : (
              promotions.map((row, idx) => {
                const rowId = row._id || row.id
                const isChecked = selectedRowIds.includes(rowId)
                const imgUrl = getImageUrl(row.image || (row.images && row.images[0]))

                return (
                  <tr
                    key={rowId}
                    onClick={() => onViewDetails && onViewDetails(row)}
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center p-0.5 relative">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
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
                          <Sparkles className="w-3 h-3 text-[#F5A623] absolute -top-1 -right-1" />
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-xs">
                            {row.title}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-normal">
                            {row.listingCode || 'MH-1000'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {row.category}
                    </td>

                    {/* Type */}
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
                      {row.ownerName || row.owner}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatLocation(row.location)}</span>
                      </div>
                    </td>

                    {/* Promotion Type */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${getPromotionBadge(
                          row.promotionType || 'Featured'
                        )}`}
                      >
                        ⭐ {row.promotionType || 'Featured'}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {formatDate(row.promotionStartDate || row.startDate || row.createdAt)}
                    </td>

                    {/* End Date */}
                    <td className="py-3 px-3 font-medium text-slate-600">
                      {formatDate(row.promotionEndDate || row.endDate || 'Ongoing')}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold ${getStatusBadge(
                          row.promotionStatus || (row.isFeatured ? 'Active' : 'Expired')
                        )}`}
                      >
                        {row.promotionStatus || (row.isFeatured ? 'Active' : 'Expired')}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {(row.promotionViews || row.viewsCount || 0).toLocaleString()}
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

                      {/* Dropdown Menu */}
                      {activeMenuId === rowId && (
                        <div className="absolute right-3 top-8 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-20 animate-in fade-in duration-150 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewDetails) onViewDetails(row)
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
                              if (onStatusChange) onStatusChange(rowId)
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
                          >
                            {row.promotionStatus === 'Active' || row.isFeatured ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>End Promotion</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Activate Promotion</span>
                              </>
                            )}
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            type="button"
                            onClick={() => {
                              if (onRemovePromotion) onRemovePromotion(rowId, row.title)
                              setActiveMenuId(null)
                            }}
                            className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Remove from Featured</span>
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
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{promotions.length}</span> promoted campaigns
        </div>
      </div>
    </div>
  )
}
