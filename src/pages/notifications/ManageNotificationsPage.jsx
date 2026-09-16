import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, X, Send, Eye, RefreshCw, Smartphone, Mail, MessageSquare, Users, Calendar, Clock, CheckCircle } from 'lucide-react'
import { NotificationStatsCards } from '../../components/notifications/NotificationStatsCards'
import { NotificationFilters } from '../../components/notifications/NotificationFilters'
import { NotificationTable } from '../../components/notifications/NotificationTable'
import { Toast } from '../../components/common/Toast'
import { notificationService } from '../../services/notificationService'

export default function ManageNotificationsPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewModalNotification, setViewModalNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Pagination & Loading State
  const [notifications, setNotifications] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live Stats
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    scheduled: 0,
    pending: 0,
    failed: 0,
    unread: 0,
    push: 0,
    email: 0,
    sms: 0,
  })

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationTypeFilter, setNotificationTypeFilter] = useState('All')
  const [audienceFilter, setAudienceFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRangeFilter, setDateRangeFilter] = useState('')

  // New Notification Form State
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'Push',
    audience: 'All Users',
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Load KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await notificationService.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err)
    }
  }, [])

  // Load Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)

      let effectiveType = notificationTypeFilter
      if (activeTab === 'push') effectiveType = 'Push'
      else if (activeTab === 'email') effectiveType = 'Email'
      else if (activeTab === 'sms') effectiveType = 'SMS'

      const res = await notificationService.getNotifications({
        search: searchTerm,
        type: effectiveType,
        audience: audienceFilter,
        status: statusFilter,
        page: currentPage,
        limit: itemsPerPage,
      })

      if (res.success && res.data) {
        setNotifications(res.data.notifications || [])
        setTotalCount(res.data.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      showToast('Error loading notifications from server')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, notificationTypeFilter, audienceFilter, statusFilter, searchTerm, currentPage, itemsPerPage])

  // Initial and reactive fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Filter handlers
  const handleResetFilters = () => {
    setSearchTerm('')
    setNotificationTypeFilter('All')
    setAudienceFilter('All')
    setStatusFilter('All')
    setDateRangeFilter('')
    setActiveTab('all')
    setCurrentPage(1)
    showToast('Filters reset.')
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchNotifications()
    showToast('Filters applied.')
  }

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setCurrentPage(1)
  }

  // Status toggle handler
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await notificationService.updateStatus(id, newStatus)
      if (res.success) {
        showToast(res.message || `Notification status updated to "${newStatus}"`)
        fetchNotifications()
        fetchStats()
      }
    } catch (err) {
      console.error('Status change error:', err)
      showToast('Failed to update status')
    }
  }

  // Action click handler
  const handleActionClick = async (row, action) => {
    const rowId = row.id || row._id
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete "${row.title}"?`)) return
      try {
        const res = await notificationService.deleteNotification(rowId)
        if (res.success) {
          showToast(res.message || 'Notification deleted.')
          fetchNotifications()
          fetchStats()
        }
      } catch (err) {
        console.error('Delete error:', err)
        showToast('Failed to delete notification')
      }
    } else if (action === 'resend') {
      try {
        const res = await notificationService.resendNotification(rowId)
        if (res.success) {
          showToast(res.message || `Re-sent "${row.title}" to ${row.audience}`)
          fetchNotifications()
          fetchStats()
        }
      } catch (err) {
        console.error('Resend error:', err)
        showToast('Failed to resend notification')
      }
    } else if (action === 'view') {
      setViewModalNotification(row)
    }
  }

  // Bulk Delete
  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected notifications?`)) return
    try {
      const res = await notificationService.bulkDelete(ids)
      if (res.success) {
        showToast(res.message || 'Selected notifications deleted.')
        fetchNotifications()
        fetchStats()
      }
    } catch (err) {
      console.error('Bulk delete error:', err)
      showToast('Failed to bulk delete')
    }
  }

  // Submit Send Notification
  const handleSendNotificationSubmit = async (e) => {
    e.preventDefault()
    if (!newNotification.title || !newNotification.message) {
      showToast('Please provide both notification title and message!')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        audience: newNotification.audience,
        isScheduled: newNotification.isScheduled,
        scheduledDate: newNotification.isScheduled ? newNotification.scheduledDate : '',
        scheduledTime: newNotification.isScheduled ? newNotification.scheduledTime : '',
      }

      const res = await notificationService.createNotification(payload)
      if (res.success) {
        showToast(`Notification "${newNotification.title}" broadcasted successfully!`)
        setShowAddModal(false)
        setNewNotification({
          title: '',
          message: '',
          type: 'Push',
          audience: 'All Users',
          isScheduled: false,
          scheduledDate: '',
          scheduledTime: '',
        })
        setCurrentPage(1)
        fetchNotifications()
        fetchStats()
      }
    } catch (err) {
      console.error('Create error:', err)
      showToast(err.response?.data?.message || 'Failed to create notification')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Manage Notifications</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Notifications
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Create, send and manage notifications for users, owners and the platform.
          </p>
        </div>

        {/* Top Actions: Refresh + Send Notification */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStats()
              fetchNotifications()
              showToast('Refreshed data.')
            }}
            title="Refresh notifications"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* 1. 4 Metric / KPI Cards */}
      <NotificationStatsCards stats={stats} />

      {/* 2. Category Tabs & Filter Toolbar */}
      <NotificationFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        notificationTypeFilter={notificationTypeFilter}
        onNotificationTypeChange={setNotificationTypeFilter}
        audienceFilter={audienceFilter}
        onAudienceChange={setAudienceFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeClick={() => showToast('Date range filter active')}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        counts={{
          all: stats.total || 0,
          push: stats.push || 0,
          email: stats.email || 0,
          sms: stats.sms || 0,
        }}
      />

      {/* 3. Notifications Data Table */}
      <NotificationTable
        notifications={notifications}
        onActionClick={handleActionClick}
        onStatusChange={handleStatusChange}
        totalCount={totalCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        isLoading={isLoading}
        onBulkDelete={handleBulkDelete}
      />

      {/* --- SEND NOTIFICATION MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#F5A623]" />
                <span>Create & Send Notification</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotificationSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={newNotification.title}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, title: e.target.value })
                  }
                  placeholder="e.g. Special Festive Discount"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newNotification.message}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, message: e.target.value })
                  }
                  placeholder="Write message preview or notification content..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Channel / Type
                  </label>
                  <select
                    value={newNotification.type}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] cursor-pointer"
                  >
                    <option value="Push">📱 Push Notification</option>
                    <option value="Email">✉ Email Notification</option>
                    <option value="SMS">💬 SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={newNotification.audience}
                    onChange={(e) =>
                      setNewNotification({ ...newNotification, audience: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623] cursor-pointer"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Owners">Owners Only</option>
                    <option value="Users">Customers / Users</option>
                    <option value="New Users">New Users</option>
                  </select>
                </div>
              </div>

              {/* Schedule Switch */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newNotification.isScheduled}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        isScheduled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#F5A623] focus:ring-[#F5A623]"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Schedule for later delivery
                  </span>
                </label>

                {newNotification.isScheduled && (
                  <div className="grid grid-cols-2 gap-3 mt-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={newNotification.scheduledDate}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            scheduledDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={newNotification.scheduledTime}
                        onChange={(e) =>
                          setNewNotification({
                            ...newNotification,
                            scheduledTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#F5A623]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
                  <span>{newNotification.isScheduled ? 'Schedule Notification' : 'Send Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW NOTIFICATION DETAILS MODAL --- */}
      {viewModalNotification && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#F5A623]" />
                <span>Notification Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewModalNotification(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px] font-semibold">Title</span>
                <span className="text-sm font-bold text-slate-900">{viewModalNotification.title}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5 text-[11px] font-semibold">Message</span>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 leading-relaxed border border-slate-100">
                  {viewModalNotification.message}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Channel</span>
                  <span className="font-bold text-slate-800">{viewModalNotification.type}</span>
                </div>
                <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Audience</span>
                  <span className="font-bold text-slate-800">{viewModalNotification.audience || viewModalNotification.targetAudience}</span>
                </div>
                <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status</span>
                  <span className="font-bold text-slate-800">{viewModalNotification.status}</span>
                </div>
                <div className="p-2.5 bg-slate-50/70 rounded-md border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Recipients Reached</span>
                  <span className="font-bold text-slate-800">{viewModalNotification.recipientCount || 'All targeted'}</span>
                </div>
              </div>

              {viewModalNotification.isScheduled && (
                <div className="p-2.5 bg-amber-50/80 rounded-md border border-amber-200">
                  <span className="text-amber-800 block text-[11px] font-bold">Scheduled Delivery</span>
                  <span className="text-amber-900 font-medium">
                    {viewModalNotification.scheduledDate} at {viewModalNotification.scheduledTime}
                  </span>
                </div>
              )}

              <div className="pt-2 text-slate-400 text-[11px]">
                Created on: <span className="text-slate-600 font-medium">{viewModalNotification.createdDate} {viewModalNotification.createdTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewModalNotification(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const item = viewModalNotification
                  setViewModalNotification(null)
                  handleActionClick(item, 'resend')
                }}
                className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Resend Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
