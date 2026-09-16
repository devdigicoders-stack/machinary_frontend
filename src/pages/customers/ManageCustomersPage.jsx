import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  X,
  ChevronRight,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { CustomerStatsCards } from '../../components/customers/CustomerStatsCards'
import { CustomerFilters } from '../../components/customers/CustomerFilters'
import { CustomerTable } from '../../components/customers/CustomerTable'
import { Toast } from '../../components/common/Toast'
import { customerService } from '../../services/customerService'
import { getAvatarUrl } from '../../services/authService'

export default function ManageCustomersPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data & Pagination State
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [regTypeFilter, setRegTypeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)

  const [selectedCustomerIds, setSelectedCustomerIds] = useState([])
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [deletingCustomer, setDeletingCustomer] = useState(null)

  // Add Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    registrationType: 'Individual',
    businessName: '',
    status: 'Active',
    listings: 0,
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch Customers from API
  const fetchCustomers = useCallback(
    async (page = 1, limit = 10, filterOverrides = {}) => {
      setIsLoading(true)
      try {
        const params = {
          page,
          limit,
          search:
            filterOverrides.search !== undefined ? filterOverrides.search : searchTerm,
          status:
            filterOverrides.status !== undefined ? filterOverrides.status : statusFilter,
          registrationType:
            filterOverrides.registrationType !== undefined
              ? filterOverrides.registrationType
              : regTypeFilter,
          location:
            filterOverrides.location !== undefined ? filterOverrides.location : locationFilter,
        }

        const res = await customerService.getCustomers(params)
        if (res?.data) {
          setCustomers(res.data.customers || [])
          if (res.data.pagination) setPagination(res.data.pagination)
          if (res.data.stats) setStats(res.data.stats)
        }
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to fetch customers from server')
      } finally {
        setIsLoading(false)
      }
    },
    [searchTerm, statusFilter, regTypeFilter, locationFilter]
  )

  // Initial Load
  useEffect(() => {
    fetchCustomers(1, pagination.limit)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter actions
  const handleApplyFilters = () => {
    fetchCustomers(1, pagination.limit)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setRegTypeFilter('All')
    setLocationFilter('All')
    fetchCustomers(1, pagination.limit, {
      search: '',
      status: 'All',
      registrationType: 'All',
      location: 'All',
    })
    showToast('Filters reset.')
  }

  // Pagination Handlers
  const handlePageChange = (newPage) => {
    fetchCustomers(newPage, pagination.limit)
  }

  const handlePerPageChange = (newLimit) => {
    fetchCustomers(1, newLimit)
  }

  // ─── ADD CUSTOMER SUBMIT ──────────────────────────────────────────────────
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      showToast('Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await customerService.createCustomer(newCustomer)
      setIsSubmitting(false)
      setShowAddModal(false)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        location: '',
        registrationType: 'Individual',
        businessName: '',
        status: 'Active',
        listings: 0,
      })
      showToast('Customer created successfully!')
      fetchCustomers(1, pagination.limit)
    } catch (error) {
      setIsSubmitting(false)
      showToast(error.response?.data?.message || 'Failed to create customer')
    }
  }

  // ─── EDIT CUSTOMER SUBMIT ─────────────────────────────────────────────────
  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!editingCustomer?.name || !editingCustomer?.email || !editingCustomer?.phone) {
      showToast('Please fill all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await customerService.updateCustomer(editingCustomer._id, editingCustomer)
      setIsSubmitting(false)
      setShowEditModal(false)
      showToast(`Customer "${editingCustomer.name}" updated successfully!`)
      fetchCustomers(pagination.page, pagination.limit)
    } catch (error) {
      setIsSubmitting(false)
      showToast(error.response?.data?.message || 'Failed to update customer')
    }
  }

  // ─── TOGGLE STATUS ────────────────────────────────────────────────────────
  const handleToggleStatus = async (cust) => {
    try {
      const res = await customerService.toggleStatus(cust._id)
      const updatedStatus = res.data?.status || (cust.status === 'Active' ? 'Inactive' : 'Active')

      setCustomers((prev) =>
        prev.map((c) => (c._id === cust._id ? { ...c, status: updatedStatus } : c))
      )

      // Refresh live stats
      setStats((prev) => ({
        ...prev,
        active: updatedStatus === 'Active' ? prev.active + 1 : Math.max(0, prev.active - 1),
        inactive: updatedStatus === 'Inactive' ? prev.inactive + 1 : Math.max(0, prev.inactive - 1),
      }))

      showToast(`Status updated to ${updatedStatus} for ${cust.name}`)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status')
    }
  }

  // ─── DELETE CUSTOMER ──────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingCustomer?._id) return
    setIsSubmitting(true)
    try {
      await customerService.deleteCustomer(deletingCustomer._id)
      setIsSubmitting(false)
      setShowDeleteModal(false)
      setSelectedCustomerIds((prev) => prev.filter((id) => id !== deletingCustomer._id))
      showToast(`Customer "${deletingCustomer.name}" removed successfully.`)
      fetchCustomers(pagination.page, pagination.limit)
    } catch (error) {
      setIsSubmitting(false)
      showToast(error.response?.data?.message || 'Failed to delete customer')
    }
  }

  // ─── BULK STATUS UPDATE ───────────────────────────────────────────────────
  const handleBulkStatus = async (status, ids) => {
    if (!ids || ids.length === 0) return
    try {
      await customerService.bulkUpdateStatus(ids, status)
      setSelectedCustomerIds([])
      showToast(`${ids.length} customer(s) marked as ${status}`)
      fetchCustomers(pagination.page, pagination.limit)
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update status')
    }
  }

  // ─── BULK DELETE SUBMIT ───────────────────────────────────────────────────
  const handleConfirmBulkDelete = async () => {
    if (!selectedCustomerIds.length) return
    setIsSubmitting(true)
    try {
      const count = selectedCustomerIds.length
      await customerService.bulkDelete(selectedCustomerIds)
      setIsSubmitting(false)
      setShowBulkDeleteModal(false)
      setSelectedCustomerIds([])
      showToast(`${count} customer(s) deleted successfully.`)
      fetchCustomers(1, pagination.limit)
    } catch (error) {
      setIsSubmitting(false)
      showToast(error.response?.data?.message || 'Failed to delete selected customers')
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
            <span className="text-slate-700 font-semibold">Manage Customers</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Customers
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            View, search, verify and manage registered platform customers with live MongoDB sync.
          </p>
        </div>

        {/* Action Button: + Add Customer */}
        <div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#F5A623]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 1. Dynamic KPI Metric Cards */}
      <CustomerStatsCards stats={stats} isLoading={isLoading} />

      {/* 2. Filter & Search Controls */}
      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        regTypeFilter={regTypeFilter}
        onRegTypeChange={setRegTypeFilter}
        locationFilter={locationFilter}
        onLocationChange={setLocationFilter}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* 3. Live Customer Data Table */}
      <CustomerTable
        customers={customers}
        pagination={pagination}
        selectedIds={selectedCustomerIds}
        onSelectionChange={setSelectedCustomerIds}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onView={(cust) => {
          setViewingCustomer(cust)
          setShowViewModal(true)
        }}
        onEdit={(cust) => {
          setEditingCustomer({ ...cust })
          setShowEditModal(true)
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(cust) => {
          setDeletingCustomer(cust)
          setShowDeleteModal(true)
        }}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={() => setShowBulkDeleteModal(true)}
      />

      {/* ─── MODAL 1: ADD NEW CUSTOMER ────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F5A623] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Add New Customer</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location / City
                  </label>
                  <input
                    type="text"
                    value={newCustomer.location}
                    onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                    placeholder="e.g. Lucknow, UP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration Type
                  </label>
                  <select
                    value={newCustomer.registrationType}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, registrationType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              {newCustomer.registrationType === 'Business' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    value={newCustomer.businessName}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, businessName: e.target.value })
                    }
                    placeholder="e.g. Chandra Earthmovers & Cranes"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Machinery Listings
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCustomer.listings}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, listings: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-xl shadow-md shadow-[#F5A623]/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT CUSTOMER ────────────────────────────────────────── */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#F5A623] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Edit Customer Information</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingCustomer.email || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.location || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registration Type
                  </label>
                  <select
                    value={editingCustomer.registrationType || 'Individual'}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        registrationType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              {editingCustomer.registrationType === 'Business' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.businessName || ''}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, businessName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingCustomer.status || 'Active'}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Listings Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCustomer.listings || 0}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, listings: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-xl shadow-md shadow-[#F5A623]/20 cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: VIEW CUSTOMER DETAILS ─────────────────────────────────── */}
      {showViewModal && viewingCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Customer Profile Details</h3>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Header */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#F5A623] to-amber-700 text-white font-black text-base flex items-center justify-center shadow-xs">
                {viewingCustomer.avatar ? (
                  <img
                    src={getAvatarUrl(viewingCustomer.avatar)}
                    alt={viewingCustomer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {(viewingCustomer.name || 'CU').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 truncate">
                  {viewingCustomer.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                      viewingCustomer.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {viewingCustomer.status}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {viewingCustomer.registrationType || 'Individual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Properties */}
            <div className="space-y-2.5 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-1.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="font-semibold text-slate-800">{viewingCustomer.email}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-semibold text-slate-800">{viewingCustomer.phone}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </span>
                <span className="font-semibold text-slate-800">
                  {viewingCustomer.location || 'India'}
                </span>
              </div>

              {viewingCustomer.businessName && (
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" /> Business
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingCustomer.businessName}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5" /> Active Listings
                </span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {viewingCustomer.listings || 0} machines
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC Status
                </span>
                <span className="font-bold text-emerald-700">
                  {viewingCustomer.kycStatus || 'Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" /> Joined Date
                </span>
                <span className="font-semibold text-slate-800">
                  {viewingCustomer.createdAt
                    ? new Date(viewingCustomer.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: DELETE CONFIRMATION ──────────────────────────────────── */}
      {showDeleteModal && deletingCustomer && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">Delete Customer?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-slate-800">
                  "{deletingCustomer.name}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 5: BULK DELETE CONFIRMATION ──────────────────────────────────── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Delete {selectedCustomerIds.length} Customers?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to permanently delete all{' '}
                <span className="font-bold text-slate-800">
                  {selectedCustomerIds.length} selected customers
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" /> Delete {selectedCustomerIds.length} Records
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
