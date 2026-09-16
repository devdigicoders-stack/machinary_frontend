import React from 'react'
import { MoreVertical, Eye, UserCheck, CheckCircle2, XCircle, Trash2, Clock, Inbox } from 'lucide-react'

const priorityStyles = {
  High:   { bg: 'bg-rose-50',   text: 'text-rose-600',   dot: 'bg-rose-500'   },
  Medium: { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-500'  },
  Low:    { bg: 'bg-emerald-50',text: 'text-emerald-600',dot: 'bg-emerald-500' },
}

const statusStyles = {
  Open:        { bg: 'bg-rose-50',   text: 'text-rose-600',    border: 'border-rose-200' },
  'In Progress':{ bg: 'bg-blue-50',  text: 'text-blue-600',    border: 'border-blue-200' },
  Resolved:    { bg: 'bg-emerald-50',text: 'text-emerald-700', border: 'border-emerald-200' },
  Closed:      { bg: 'bg-slate-100', text: 'text-slate-600',   border: 'border-slate-200' },
}

export function SupportTable({
  tickets = [],
  onSelectTicket,
  activeMenu,
  onMenuToggle,
  onAction,
  totalCount = 0,
  currentPage = 1,
  setCurrentPage = () => {},
  itemsPerPage = 10,
  setItemsPerPage = () => {},
  isLoading = false,
  selectedIds = [],
  onToggleSelect = () => {},
  onSelectAll = () => {},
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endEntry = Math.min(currentPage * itemsPerPage, totalCount)
  const isAllSelected = tickets.length > 0 && tickets.every(t => selectedIds.includes(t._id || t.id))

  const renderPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3.5 w-10 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  disabled={isLoading || tickets.length === 0}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">#</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ticket ID</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Subject</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">User</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Created On</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Assigned To</th>
              <th className="px-3 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pr-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: itemsPerPage > 5 ? 5 : itemsPerPage }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-4 h-3 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-16 h-4 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-44 h-4 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4">
                    <div className="w-24 h-3 bg-slate-200 rounded mb-1" />
                    <div className="w-32 h-2.5 bg-slate-100 rounded" />
                  </td>
                  <td className="px-3 py-4"><div className="w-16 h-5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-14 h-5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-16 h-5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-20 h-3 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4 text-right pr-4"><div className="w-6 h-6 bg-slate-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={11} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No Support Tickets Found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No complaints or tickets match your current filters. Try changing or resetting filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket, idx) => {
                const ticketKey = ticket._id || ticket.id
                const pStyle = priorityStyles[ticket.priority] || priorityStyles.Low
                const sStyle = statusStyles[ticket.status] || statusStyles.Closed
                const isSelected = selectedIds.includes(ticketKey)

                return (
                  <tr
                    key={ticketKey}
                    className={`hover:bg-amber-50/20 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-amber-50/40' : ''
                    }`}
                    onClick={() => onSelectTicket(ticket)}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(ticketKey)}
                        className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-800 whitespace-nowrap">
                      <span className="text-[#D98200] group-hover:underline">
                        {ticket.ticketId}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 font-medium max-w-[200px] truncate" title={ticket.subject}>
                      {ticket.subject}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-slate-900 whitespace-nowrap">{ticket.userName}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[160px]">{ticket.userEmail}</div>
                      {ticket.userPhone && (
                        <div className="text-slate-400 text-[10px]">{ticket.userPhone}</div>
                      )}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold text-[11px] ${pStyle.bg} ${pStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[11px] border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-600">
                      <div className="font-medium text-slate-700">{ticket.createdDate}</div>
                      <div className="text-slate-400 text-[10px]">{ticket.createdTime}</div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-700 whitespace-nowrap font-medium">
                      {ticket.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-3 py-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => onMenuToggle(ticketKey)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === ticketKey && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => onAction('view', ticket)}
                              className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Details
                            </button>

                            <button
                              type="button"
                              onClick={() => onAction('assign', ticket)}
                              className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                              Reassign
                            </button>

                            {ticket.status === 'Open' && (
                              <button
                                type="button"
                                onClick={() => onAction('inprogress', ticket)}
                                className="w-full text-left px-3.5 py-2 text-blue-600 hover:bg-blue-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                In Progress
                              </button>
                            )}

                            {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                              <button
                                type="button"
                                onClick={() => onAction('resolve', ticket)}
                                className="w-full text-left px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Mark Resolved
                              </button>
                            )}

                            {ticket.status !== 'Closed' && (
                              <button
                                type="button"
                                onClick={() => onAction('close', ticket)}
                                className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                Close Ticket
                              </button>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => onAction('delete', ticket)}
                              className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
        <span className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{startEntry}</span> to{' '}
          <span className="font-semibold text-slate-800">{endEntry}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> tickets
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Prev
          </button>

          {renderPageNumbers().map((p, idx) => (
            p === '...' ? (
              <span key={`dots-${idx}`} className="text-slate-400 text-xs px-1">...</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                disabled={isLoading}
                className={`px-2.5 py-1 text-xs rounded-lg border cursor-pointer font-medium transition-all ${
                  currentPage === p
                    ? 'bg-[#F5A623] text-white border-[#F5A623] font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                {p}
              </button>
            )
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}
