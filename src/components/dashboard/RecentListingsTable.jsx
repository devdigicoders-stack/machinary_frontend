import React, { useState, useRef, useEffect } from 'react'
import { MapPin, MoreVertical, ExternalLink, Check, Power, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listingService } from '../../services/listingService'

export function RecentListingsTable({ listings = [], isLoading = false, onRefresh, showToast }) {
  const navigate = useNavigate()
  const [activeMenuId, setActiveMenuId] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const menuRef = useRef(null)

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleStatus = async (item) => {
    try {
      setProcessingId(item.id)
      setActiveMenuId(null)
      await listingService.toggleListingStatus(item.id)
      showToast?.(`Status updated for "${item.title}"`)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to toggle status:', err)
      showToast?.('Failed to update listing status')
    } finally {
      setProcessingId(null)
    }
  }

  const handleApprove = async (item) => {
    try {
      setProcessingId(item.id)
      setActiveMenuId(null)
      await listingService.approveListing(item.id)
      showToast?.(`Listing "${item.title}" approved successfully`)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to approve listing:', err)
      showToast?.('Failed to approve listing')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Recent Listings</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
        </h3>
        <button
          type="button"
          onClick={() => navigate('/buy-rent-listings')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto no-scrollbar pt-1 flex-1">
        <table className="w-full min-w-[580px] text-left border-collapse text-xs sm:text-[12.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 pr-2 w-6 text-center">#</th>
              <th className="py-2.5 px-2 w-14">Image</th>
              <th className="py-2.5 px-2">Title</th>
              <th className="py-2.5 px-2 w-20">Type</th>
              <th className="py-2.5 px-2">Location</th>
              <th className="py-2.5 px-2 whitespace-nowrap">Date</th>
              <th className="py-2.5 px-2 w-18">Status</th>
              <th className="py-2.5 pl-2 pr-1 text-center w-8">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && listings.length === 0 ? (
              [1, 2, 3, 4].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-3 pr-2 text-center">
                    <div className="h-3 w-3 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="w-12 h-7.5 bg-slate-200 rounded" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4 bg-slate-200 rounded w-14" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3 bg-slate-200 rounded w-20" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-3 bg-slate-200 rounded w-16" />
                  </td>
                  <td className="py-3 px-2">
                    <div className="h-4 bg-slate-200 rounded w-14" />
                  </td>
                  <td className="py-3 pl-2 text-center">
                    <div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <span>No listings found in MongoDB Atlas</span>
                </td>
              </tr>
            ) : (
              listings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-2.5 pr-2 font-bold text-slate-500 text-center">
                    {item.serial}
                  </td>
                  
                  {/* Vehicle Thumbnail */}
                  <td className="py-2.5 px-2">
                    <div className="w-12 h-7.5 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.src = item.fallbackImage || '/dashboard.png'
                        }}
                      />
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-2.5 px-2 font-semibold text-slate-800 whitespace-nowrap max-w-[180px] truncate" title={item.title}>
                    {item.title}
                  </td>

                  {/* Type Badge */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${item.typeColor}`}
                    >
                      {item.type}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[110px]" title={item.location}>
                        {item.location}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap text-[11.5px]">
                    {item.date}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action - 3 dots with Popover Menu */}
                  <td className="py-2.5 pl-2 pr-1 text-center whitespace-nowrap relative">
                    <button
                      type="button"
                      disabled={processingId === item.id}
                      onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                      title="Actions"
                    >
                      {processingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      ) : (
                        <MoreVertical className="w-4 h-4" />
                      )}
                    </button>

                    {activeMenuId === item.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-8 w-36 bg-white border border-slate-200 rounded-md shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                      >
                        <button
                          type="button"
                          onClick={() => navigate('/buy-rent-listings')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Details</span>
                        </button>

                        {item.isPending && (
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            className="w-full text-left px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 flex items-center gap-1.5 cursor-pointer font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Approve</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5 text-slate-400" />
                          <span>Toggle Status</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
