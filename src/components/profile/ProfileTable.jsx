import React from 'react'
import { MoreVertical, Eye, Edit3, UserX, ShieldAlert, Trash2, CheckCircle, UserCheck, Inbox } from 'lucide-react'
import { getAvatarUrl } from '../../utils/imageUtils'

const userTypeStyles = {
  Customer: { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  Owner:    { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  Admin:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
}

const statusStyles = {
  Active:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Inactive: { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
  Blocked:  { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
}

function Avatar({ name = '', src }) {
  const fullSrc = getAvatarUrl(src)
  if (fullSrc) {
    return (
      <img
        src={fullSrc}
        alt={name}
        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = 'none'
        }}
      />
    )
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-rose-100 text-rose-700 border-rose-200',
  ]
  const color = colors[(name ? name.charCodeAt(0) : 0) % colors.length]

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border ${color} shrink-0`}>
      {initials}
    </div>
  )
}

export function ProfileTable({
  users = [],
  onSelectUser,
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
  const isAllSelected = users.length > 0 && users.every(u => selectedIds.includes(u._id || u.id))

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
      <div className="overflow-x-auto min-h-[320px]">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3.5 w-10 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  disabled={isLoading || users.length === 0}
                  className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                />
              </th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">#</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Email Address</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Phone</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Role</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Location</th>
              <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Joined On</th>
              <th className="px-3 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap pr-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: itemsPerPage > 5 ? 5 : itemsPerPage }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="w-4 h-4 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-4 h-3 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </div>
                  </td>
                  <td className="px-3 py-4"><div className="w-32 h-3.5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-24 h-3.5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-16 h-5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-14 h-5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-24 h-3.5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4"><div className="w-20 h-3.5 bg-slate-200 rounded" /></td>
                  <td className="px-3 py-4 text-right pr-4"><div className="w-6 h-6 bg-slate-200 rounded ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No Users Found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No customer, owner, or admin accounts match your current filter settings.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, idx) => {
                const userKey = user._id || user.id
                const utStyle = userTypeStyles[user.userType] || userTypeStyles.Customer
                const stStyle = statusStyles[user.status] || statusStyles.Active
                const isSelected = selectedIds.includes(userKey)

                return (
                  <tr
                    key={userKey}
                    className={`hover:bg-amber-50/25 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-amber-50/50' : ''
                    }`}
                    onClick={() => onSelectUser(user)}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(userKey)}
                        className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623] cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} src={user.avatar} />
                        <div>
                          <span className="font-bold text-slate-800 group-hover:text-[#D98200] transition-colors whitespace-nowrap block">
                            {user.name}
                          </span>
                          {user.businessName && (
                            <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                              {user.businessName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 font-medium max-w-[160px] truncate" title={user.email}>
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap font-medium">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[11px] border ${utStyle.bg} ${utStyle.text} ${utStyle.border}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[11px] border ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 max-w-[140px] truncate" title={user.location}>
                      {user.location || 'India'}
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap font-medium">
                      {user.joinedOn}
                    </td>
                    <td className="px-3 py-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => onMenuToggle(userKey)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === userKey && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 z-30 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => onAction('view', user)}
                              className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              View Profile
                            </button>

                            <button
                              type="button"
                              onClick={() => onAction('edit', user)}
                              className="w-full text-left px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                              Edit Profile
                            </button>

                            {user.status === 'Active' ? (
                              <button
                                type="button"
                                onClick={() => onAction('deactivate', user)}
                                className="w-full text-left px-3.5 py-2 text-amber-700 hover:bg-amber-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <UserX className="w-3.5 h-3.5 text-amber-500" />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAction('activate', user)}
                                className="w-full text-left px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Activate
                              </button>
                            )}

                            {user.status !== 'Blocked' ? (
                              <button
                                type="button"
                                onClick={() => onAction('block', user)}
                                className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                Block User
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAction('unblock', user)}
                                className="w-full text-left px-3.5 py-2 text-emerald-700 hover:bg-emerald-50 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Unblock User
                              </button>
                            )}

                            <div className="h-px bg-slate-100 my-1" />

                            <button
                              type="button"
                              onClick={() => onAction('delete', user)}
                              className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-medium cursor-pointer flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Delete User
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

      {/* Dynamic Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50">
        <span className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{startEntry}</span> to{' '}
          <span className="font-semibold text-slate-800">{endEntry}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> users
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Prev
          </button>

          {renderPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="text-slate-400 text-xs px-1">
                ...
              </span>
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
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    </div>
  )
}
