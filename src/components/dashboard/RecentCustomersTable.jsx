import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, ExternalLink, Power, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { customerService } from '../../services/customerService'

export function RecentCustomersTable({ customers = [], isLoading = false, onRefresh, showToast }) {
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

  const handleToggleStatus = async (cust) => {
    try {
      setProcessingId(cust.id)
      setActiveMenuId(null)
      await customerService.toggleStatus(cust.id)
      showToast?.(`Status updated for "${cust.name}"`)
      onRefresh?.()
    } catch (err) {
      console.error('Failed to toggle customer status:', err)
      showToast?.('Failed to update customer status')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200/70 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100/80">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Recent Customers</span>
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />}
        </h3>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto no-scrollbar pt-1 flex-1">
        <table className="w-full min-w-[380px] text-left border-collapse text-xs sm:text-[12.5px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-2.5 pr-2 w-6 text-center">#</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-3 whitespace-nowrap">Joined On</th>
              <th className="py-2.5 px-2 w-20">Status</th>
              <th className="py-2.5 pl-2 pr-1 text-center w-8">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && customers.length === 0 ? (
              [1, 2, 3, 4].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-3 pr-2 text-center">
                    <div className="h-3 w-3 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7.5 h-7.5 rounded-full bg-slate-200" />
                      <div className="h-3.5 bg-slate-200 rounded w-28" />
                    </div>
                  </td>
                  <td className="py-3 px-3">
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
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <span>No registered customers found</span>
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-2.5 pr-2 font-bold text-slate-500 text-center">
                    {cust.serial}
                  </td>
                  
                  {/* Customer Avatar & Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      {cust.avatar ? (
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="w-7.5 h-7.5 rounded-full object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div
                          className={`w-7.5 h-7.5 rounded-full flex items-center justify-center font-bold text-[11px] border shrink-0 ${cust.avatarBg}`}
                        >
                          {cust.initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 whitespace-nowrap block truncate max-w-[140px]" title={cust.name}>
                          {cust.name}
                        </span>
                        {cust.email && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                            {cust.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11.5px]">
                    {cust.joinedOn}
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold border ${cust.statusColor}`}
                    >
                      {cust.status}
                    </span>
                  </td>

                  {/* Action - 3 dots with Popover Menu */}
                  <td className="py-2.5 pl-2 pr-1 text-center whitespace-nowrap relative">
                    <button
                      type="button"
                      disabled={processingId === cust.id}
                      onClick={() => setActiveMenuId(activeMenuId === cust.id ? null : cust.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                      title="Actions"
                    >
                      {processingId === cust.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      ) : (
                        <MoreVertical className="w-4 h-4" />
                      )}
                    </button>

                    {activeMenuId === cust.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-2 top-8 w-36 bg-white border border-slate-200 rounded-md shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 text-left"
                      >
                        <button
                          type="button"
                          onClick={() => navigate('/customers')}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cust)}
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
