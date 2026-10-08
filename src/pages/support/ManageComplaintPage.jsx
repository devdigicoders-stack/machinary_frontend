import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, AlertTriangle, X, Check, Loader2, UserCheck, Trash2 } from 'lucide-react'
import { SupportStatsCards } from '../../components/support/SupportStatsCards'
import { SupportFilters } from '../../components/support/SupportFilters'
import { SupportTable } from '../../components/support/SupportTable'
import { SupportDetailPanel } from '../../components/support/SupportDetailPanel'
import { Toast } from '../../components/common/Toast'
import { supportService } from '../../services/supportService'
import { getSocket, joinTicketRoom, leaveTicketRoom } from '../../services/socketService'

export default function ManageComplaintPage() {
  const [tickets, setTickets] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, open: 0, inprogress: 0, resolved: 0, closed: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  // Selected ticket for side drawer
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState([])

  // Filters
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [assignedFilter, setAssignedFilter] = useState('All')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [reassignModalTicket, setReassignModalTicket] = useState(null)
  const [newAssignee, setNewAssignee] = useState('Neha Sharma')
  const [deleteModalTicket, setDeleteModalTicket] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create form state
  const [createForm, setCreateForm] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    userRole: 'Customer',
    subject: '',
    type: 'Technical',
    category: 'General',
    priority: 'Medium',
    assignedTo: 'Neha Sharma',
    description: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    try {
      const res = await supportService.getStats()
      if (res?.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Error fetching support stats:', err)
    } finally {
      setIsStatsLoading(false)
    }
  }, [])

  // Fetch Support Tickets
  const fetchTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }

      if (activeTab !== 'All') {
        params.status = activeTab
      } else if (statusFilter !== 'All') {
        params.status = statusFilter
      }

      if (typeFilter !== 'All') params.type = typeFilter
      if (priorityFilter !== 'All') params.priority = priorityFilter
      if (assignedFilter !== 'All') params.assignedTo = assignedFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const res = await supportService.getTickets(params)
      if (res?.success && res.data) {
        setTickets(res.data.tickets || [])
        setTotalCount(res.data.total || 0)
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      showToast('Failed to load support tickets')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, activeTab, statusFilter, typeFilter, priorityFilter, assignedFilter, searchTerm])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Real-time Socket.IO Listener for instant WhatsApp-like messages & ticket updates
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleTicketUpdate = (payload) => {
      // Refresh tickets and stats in background
      fetchTickets()
      fetchStats()

      // If this ticket is open in the drawer, instantly append or update
      if (payload?.ticket) {
        setSelectedTicket((prev) => {
          if (!prev) return null
          const currentId = prev._id || prev.id
          const incomingId = payload.ticket._id || payload.ticket.id
          if (currentId === incomingId || prev.ticketId === payload.ticket.ticketId) {
            const d = payload.ticket.createdAt ? new Date(payload.ticket.createdAt) : new Date()
            return {
              ...payload.ticket,
              id: payload.ticket._id,
              createdDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              createdTime: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            }
          }
          return prev
        })
      }
    }

    socket.on('ticket_updated', handleTicketUpdate)
    socket.on('new_message', handleTicketUpdate)

    return () => {
      socket.off('ticket_updated', handleTicketUpdate)
      socket.off('new_message', handleTicketUpdate)
    }
  }, [fetchTickets, fetchStats])

  // Join/Leave socket room when selectedTicket changes
  useEffect(() => {
    if (selectedTicket) {
      const id = selectedTicket._id || selectedTicket.id
      joinTicketRoom(id)
      if (selectedTicket.ticketId) joinTicketRoom(selectedTicket.ticketId)

      return () => {
        leaveTicketRoom(id)
        if (selectedTicket.ticketId) leaveTicketRoom(selectedTicket.ticketId)
      }
    }
  }, [selectedTicket])

  // Filter Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setStatusFilter(tab === 'All' ? 'All' : tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleTypeChange = (type) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    if (status !== 'All') setActiveTab(status)
    else setActiveTab('All')
    setCurrentPage(1)
  }

  const handlePriorityChange = (priority) => {
    setPriorityFilter(priority)
    setCurrentPage(1)
  }

  const handleAssignedChange = (assigned) => {
    setAssignedFilter(assigned)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setActiveTab('All')
    setSearchTerm('')
    setTypeFilter('All')
    setStatusFilter('All')
    setPriorityFilter('All')
    setAssignedFilter('All')
    setCurrentPage(1)
  }

  // Row selection
  const handleToggleSelect = (ticketKey) => {
    setSelectedIds(prev =>
      prev.includes(ticketKey) ? prev.filter(id => id !== ticketKey) : [...prev, ticketKey]
    )
  }

  const handleSelectAll = () => {
    if (tickets.every(t => selectedIds.includes(t._id || t.id))) {
      setSelectedIds([])
    } else {
      setSelectedIds(tickets.map(t => t._id || t.id))
    }
  }

  // Action Menu Handler
  const handleMenuToggle = (id) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  const handleAction = async (action, ticket) => {
    setActiveMenu(null)
    const ticketId = ticket._id || ticket.id

    if (action === 'view') {
      setSelectedTicket(ticket)
    } else if (action === 'assign') {
      setReassignModalTicket(ticket)
      setNewAssignee(ticket.assignedTo || 'Neha Sharma')
    } else if (action === 'inprogress') {
      try {
        await supportService.updateStatus(ticketId, 'In Progress')
        showToast(`Ticket ${ticket.ticketId} marked In Progress`)
        fetchTickets()
        fetchStats()
        if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
          setSelectedTicket(prev => ({ ...prev, status: 'In Progress' }))
        }
      } catch (err) {
        showToast('Failed to update status')
      }
    } else if (action === 'resolve') {
      try {
        await supportService.updateStatus(ticketId, 'Resolved')
        showToast(`Ticket ${ticket.ticketId} marked as Resolved`)
        fetchTickets()
        fetchStats()
        if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
          setSelectedTicket(prev => ({ ...prev, status: 'Resolved' }))
        }
      } catch (err) {
        showToast('Failed to update status')
      }
    } else if (action === 'close') {
      try {
        await supportService.updateStatus(ticketId, 'Closed')
        showToast(`Ticket ${ticket.ticketId} closed`)
        fetchTickets()
        fetchStats()
        if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
          setSelectedTicket(prev => ({ ...prev, status: 'Closed' }))
        }
      } catch (err) {
        showToast('Failed to close ticket')
      }
    } else if (action === 'delete') {
      setDeleteModalTicket(ticket)
    }
  }

  // Reassign confirm
  const handleConfirmReassign = async () => {
    if (!reassignModalTicket) return
    setIsSubmitting(true)
    const ticketId = reassignModalTicket._id || reassignModalTicket.id
    try {
      await supportService.reassignTicket(ticketId, newAssignee)
      showToast(`Ticket ${reassignModalTicket.ticketId} reassigned to ${newAssignee}`)
      setReassignModalTicket(null)
      fetchTickets()
      fetchStats()
      if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
        setSelectedTicket(prev => ({ ...prev, assignedTo: newAssignee }))
      }
    } catch (err) {
      showToast('Failed to reassign ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete confirm
  const handleConfirmDelete = async () => {
    if (!deleteModalTicket) return
    setIsSubmitting(true)
    const ticketId = deleteModalTicket._id || deleteModalTicket.id
    try {
      await supportService.deleteTicket(ticketId)
      showToast(`Ticket ${deleteModalTicket.ticketId} deleted permanently`)
      setDeleteModalTicket(null)
      if (selectedTicket && (selectedTicket._id === ticketId || selectedTicket.id === ticketId)) {
        setSelectedTicket(null)
      }
      fetchTickets()
      fetchStats()
    } catch (err) {
      showToast('Failed to delete ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Send message in Conversation tab
  const handleSendMessage = async (ticketId, messageText) => {
    try {
      const res = await supportService.sendMessage(ticketId, messageText, 'Support Admin')
      if (res?.success) {
        showToast('Reply sent successfully')
        fetchTickets()
        fetchStats()
        if (res.data) {
          // Format ticket properly
          const d = res.data.createdAt ? new Date(res.data.createdAt) : new Date()
          const updated = {
            ...res.data,
            id: res.data._id,
            createdDate: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            createdTime: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          }
          setSelectedTicket(updated)
        }
      }
    } catch (err) {
      showToast('Failed to send reply')
      throw err
    }
  }

  // Create Ticket Submit
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!createForm.userName.trim() || !createForm.subject.trim()) {
      showToast('Name and Subject are required')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await supportService.createTicket(createForm)
      if (res?.success) {
        showToast(`Support Ticket ${res.data?.ticketId || 'created'} successfully`)
        setIsCreateModalOpen(false)
        setCreateForm({
          userName: '',
          userEmail: '',
          userPhone: '',
          userRole: 'Customer',
          subject: '',
          type: 'Technical',
          category: 'General',
          priority: 'Medium',
          assignedTo: 'Neha Sharma',
          description: '',
        })
        fetchTickets()
        fetchStats()
      }
    } catch (err) {
      showToast('Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5" onClick={() => activeMenu && setActiveMenu(null)}>
      <Toast message={toastMessage} />

      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          <Link to="/dashboard" className="hover:text-slate-700 transition-colors">Dashboard</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-700 font-semibold">Manage Complaint &amp; Support</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
              Manage Complaint &amp; Support
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
              Live database of customer complaints, resolution lifecycle, and support tickets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5A623] hover:bg-[#E09400] text-white text-xs font-bold rounded-xl shadow-sm shadow-[#F5A623]/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Live Support Stats Cards */}
      <SupportStatsCards stats={stats} isLoading={isStatsLoading} />

      {/* Dynamic Filters & Tabs */}
      <SupportFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeChange={handleTypeChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityChange}
        assignedFilter={assignedFilter}
        onAssignedChange={handleAssignedChange}
        counts={{
          all: stats.total || 0,
          open: stats.open || 0,
          inprogress: stats.inprogress || 0,
          resolved: stats.resolved || 0,
          closed: stats.closed || 0,
        }}
        onReset={handleResetFilters}
      />

      {/* Dynamic Table */}
      <SupportTable
        tickets={tickets}
        totalCount={totalCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onSelectTicket={(ticket) => {
          setActiveMenu(null)
          setSelectedTicket(ticket)
        }}
        activeMenu={activeMenu}
        onMenuToggle={handleMenuToggle}
        onAction={handleAction}
      />

      {/* Detail Side Panel */}
      {selectedTicket && (
        <SupportDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onInProgress={async (t) => {
            const tId = t._id || t.id
            await supportService.updateStatus(tId, 'In Progress')
            showToast(`Ticket ${t.ticketId} marked In Progress`)
            setSelectedTicket(prev => ({ ...prev, status: 'In Progress' }))
            fetchTickets()
            fetchStats()
          }}
          onResolve={async (t) => {
            const tId = t._id || t.id
            await supportService.updateStatus(tId, 'Resolved')
            showToast(`Ticket ${t.ticketId} marked as Resolved`)
            setSelectedTicket(prev => ({ ...prev, status: 'Resolved' }))
            fetchTickets()
            fetchStats()
          }}
          onReassign={(t) => {
            setReassignModalTicket(t)
            setNewAssignee(t.assignedTo || 'Neha Sharma')
          }}
          onCloseTicket={async (t) => {
            const tId = t._id || t.id
            await supportService.updateStatus(tId, 'Closed')
            showToast(`Ticket ${t.ticketId} closed`)
            setSelectedTicket(prev => ({ ...prev, status: 'Closed' }))
            fetchTickets()
            fetchStats()
          }}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Modal: New Support Ticket */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#F5A623] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Create Support Ticket</h3>
                  <p className="text-[11px] text-slate-500">Record a customer complaint or inquiry into MongoDB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.userName}
                    onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    User Role
                  </label>
                  <select
                    value={createForm.userRole}
                    onChange={(e) => setCreateForm({ ...createForm, userRole: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Owner">Owner</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={createForm.userEmail}
                    onChange={(e) => setCreateForm({ ...createForm, userEmail: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={createForm.userPhone}
                    onChange={(e) => setCreateForm({ ...createForm, userPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Subject / Topic <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  placeholder="Brief summary of the complaint"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Payment">Payment</option>
                    <option value="Listing">Listing</option>
                    <option value="Account">Account</option>
                    <option value="Report">Report</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Assign Agent</label>
                  <select
                    value={createForm.assignedTo}
                    onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white"
                  >
                    <option value="Neha Sharma">Neha Sharma</option>
                    <option value="Amit Kumar">Amit Kumar</option>
                    <option value="Rahul Singh">Rahul Singh</option>
                    <option value="Pooja Khanna">Pooja Khanna</option>
                    <option value="Unassigned">Unassigned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Complaint Description
                </label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Detailed description of the issue or inquiry..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#F5A623] hover:bg-[#E09400] text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Create Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reassign Ticket */}
      {reassignModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !isSubmitting && setReassignModalTicket(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Reassign Ticket</h3>
                <p className="text-[11px] text-slate-500">Ticket ID: {reassignModalTicket.ticketId}</p>
              </div>
            </div>

            <p className="text-slate-600 mb-3">
              Currently assigned to: <span className="font-bold text-slate-800">{reassignModalTicket.assignedTo || 'Unassigned'}</span>
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                Select Support Agent
              </label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F5A623] bg-white text-xs text-slate-800 font-medium"
              >
                <option value="Neha Sharma">Neha Sharma</option>
                <option value="Amit Kumar">Amit Kumar</option>
                <option value="Rahul Singh">Rahul Singh</option>
                <option value="Pooja Khanna">Pooja Khanna</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReassignModalTicket(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Ticket Confirmation */}
      {deleteModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => !isSubmitting && setDeleteModalTicket(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Delete Support Ticket</h3>
                <p className="text-[11px] text-slate-500">Ticket ID: {deleteModalTicket.ticketId}</p>
              </div>
            </div>

            <p className="text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete ticket <span className="font-bold text-slate-800">{deleteModalTicket.ticketId}</span> ({deleteModalTicket.subject})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteModalTicket(null)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
