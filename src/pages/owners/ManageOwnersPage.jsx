import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  Truck,
} from 'lucide-react'
import { OwnerStatsCards } from '../../components/owners/OwnerStatsCards'
import { OwnerFilters } from '../../components/owners/OwnerFilters'
import { OwnerTable } from '../../components/owners/OwnerTable'
import { OwnerDetailDrawer } from '../../components/owners/OwnerDetailDrawer'
import { Toast } from '../../components/common/Toast'
import { ownerService } from '../../services/ownerService'

export default function ManageOwnersPage() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Owners & Live Stats
  const [owners, setOwners] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
  })
  const [cities, setCities] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Right-Side Slide-Over Drawer
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Add Owner Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newOwner, setNewOwner] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    location: '',
    machines: 1,
    status: 'Active',
    kycStatus: 'Pending',
    gstNumber: '',
  })

  // Edit Owner Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState(null)

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single', // 'single' | 'bulk'
    target: null, // single owner or array of ids
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch owners from MongoDB Atlas
  const fetchOwners = useCallback(
    async (overrides = {}) => {
      setIsLoading(true)
      try {
        const queryPage = overrides.page !== undefined ? overrides.page : pagination.page
        const queryLimit = overrides.limit !== undefined ? overrides.limit : pagination.limit
        const querySearch = overrides.search !== undefined ? overrides.search : searchTerm
        const queryStatus = overrides.status !== undefined ? overrides.status : statusFilter
        const queryCity = overrides.city !== undefined ? overrides.city : cityFilter

        const params = {
          page: queryPage,
          limit: queryLimit,
        }
        if (querySearch && querySearch.trim()) params.search = querySearch.trim()
        if (queryStatus && queryStatus !== 'All') params.status = queryStatus
        if (queryCity && queryCity !== 'All') params.city = queryCity

        const response = await ownerService.getOwners(params)

        if (response.success) {
          const ownersList = response.data?.owners || []
          const statsObj = response.data?.stats || {
            total: ownersList.length,
            active: 0,
            inactive: 0,
            newThisMonth: 0,
          }
          const paginationObj = response.data?.pagination || {
            total: ownersList.length,
            page: queryPage,
            limit: queryLimit,
            totalPages: 1,
          }

          setOwners(ownersList)
          setStats(statsObj)
          setPagination(paginationObj)
          if (response.data?.cities) setCities(response.data.cities)

          // Refresh selected owner if drawer is currently open
          if (selectedOwner) {
            const currentSelectedId = selectedOwner._id || selectedOwner.id
            const matched = ownersList.find(
              (o) => (o._id || o.id) === currentSelectedId
            )
            if (matched) setSelectedOwner(matched)
          }
        } else {
          showToast(response.message || 'Failed to fetch owners')
        }
      } catch (err) {
        console.error('Error fetching owners:', err)
        showToast(err.response?.data?.message || 'Error fetching owners')
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.page, pagination.limit, searchTerm, statusFilter, cityFilter, selectedOwner]
  )

  // Initial load and filter effect
  useEffect(() => {
    fetchOwners({ page: 1 })
    setSelectedIds([])
  }, [statusFilter, cityFilter])

  // Filter Reset
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setCityFilter('All')
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchOwners({
      page: 1,
      search: '',
      status: 'All',
      city: 'All',
    })
    showToast('Filters reset.')
  }

  // Filter Apply
  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchOwners({ page: 1 })
  }

  // Status Toggle (Active <-> Inactive)
  const handleStatusToggle = async (id, nextStatus) => {
    try {
      const response = await ownerService.toggleStatus(id, nextStatus)
      if (response.success) {
        showToast(`Owner status updated to "${response.data?.status || nextStatus}"`)

        // Update local list
        setOwners((prev) =>
          prev.map((o) =>
            (o._id || o.id) === id
              ? { ...o, status: response.data?.status || nextStatus }
              : o
          )
        )

        // Update selected owner if in drawer
        if (selectedOwner && (selectedOwner._id || selectedOwner.id) === id) {
          setSelectedOwner((prev) => ({
            ...prev,
            status: response.data?.status || nextStatus,
            history: response.data?.history || prev.history,
          }))
        }

        // Re-fetch in background to update counts
        fetchOwners()
      } else {
        showToast(response.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      showToast(err.response?.data?.message || 'Error updating status')
    }
  }

  // KYC Status Update
  const handleKycUpdate = async (id, kycStatus) => {
    try {
      const response = await ownerService.updateKyc(id, kycStatus)
      if (response.success) {
        showToast(`KYC status updated to "${kycStatus}"`)

        setOwners((prev) =>
          prev.map((o) =>
            (o._id || o.id) === id ? { ...o, kycStatus } : o
          )
        )

        if (selectedOwner && (selectedOwner._id || selectedOwner.id) === id) {
          setSelectedOwner((prev) => ({
            ...prev,
            kycStatus,
            history: response.data?.history || prev.history,
          }))
        }
      } else {
        showToast(response.message || 'Failed to update KYC')
      }
    } catch (err) {
      console.error('Error updating KYC:', err)
      showToast(err.response?.data?.message || 'Error updating KYC')
    }
  }

  // Add Note to Owner
  const handleAddNote = async (id, noteText) => {
    try {
      const response = await ownerService.addNote(id, noteText)
      if (response.success) {
        showToast('Note added successfully')
        if (response.data) {
          setSelectedOwner(response.data)
          setOwners((prev) =>
            prev.map((o) =>
              (o._id || o.id) === id ? response.data : o
            )
          )
        }
      } else {
        showToast(response.message || 'Failed to add note')
      }
    } catch (err) {
      console.error('Error adding note:', err)
      showToast(err.response?.data?.message || 'Error adding note')
    }
  }

  // Add Owner Submit
  const handleAddOwnerSubmit = async (e) => {
    e.preventDefault()
    if (!newOwner.name || !newOwner.email || !newOwner.phone) {
      showToast('Please fill all required fields!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await ownerService.createOwner({
        ...newOwner,
        machines: parseInt(newOwner.machines, 10) || 1,
      })

      if (response.success) {
        showToast(`Owner "${newOwner.name}" created successfully!`)
        setShowAddModal(false)
        setNewOwner({
          name: '',
          businessName: '',
          email: '',
          phone: '',
          location: '',
          machines: 1,
          status: 'Active',
          kycStatus: 'Pending',
          gstNumber: '',
        })
        fetchOwners({ page: 1 })
      } else {
        showToast(response.message || 'Failed to create owner')
      }
    } catch (err) {
      console.error('Create owner error:', err)
      showToast(err.response?.data?.message || 'Failed to create owner')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleEditClick = (owner) => {
    setEditingOwner({
      id: owner._id || owner.id,
      name: owner.name || '',
      businessName: owner.businessName || '',
      email: owner.email || '',
      phone: owner.phone || '',
      location: owner.location || '',
      machines: owner.machines ?? owner.fleetSize ?? 1,
      status: owner.status || 'Active',
      kycStatus: owner.kycStatus || 'Pending',
      gstNumber: owner.gstNumber || '',
    })
    setShowEditModal(true)
  }

  // Edit Owner Submit
  const handleEditOwnerSubmit = async (e) => {
    e.preventDefault()
    if (!editingOwner.name || !editingOwner.email || !editingOwner.phone) {
      showToast('Please fill all required fields!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await ownerService.updateOwner(editingOwner.id, {
        ...editingOwner,
        machines: parseInt(editingOwner.machines, 10) || 1,
      })

      if (response.success) {
        showToast(`Owner details updated successfully!`)
        setShowEditModal(false)
        setEditingOwner(null)
        fetchOwners()
      } else {
        showToast(response.message || 'Failed to update owner')
      }
    } catch (err) {
      console.error('Update owner error:', err)
      showToast(err.response?.data?.message || 'Failed to update owner')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bulk Status Update
  const handleBulkStatus = async (status, ids) => {
    if (!ids || ids.length === 0) return
    try {
      const response = await ownerService.bulkUpdateStatus(ids, status)
      if (response.success) {
        showToast(`Updated ${ids.length} owners to "${status}"`)
        setSelectedIds([])
        fetchOwners()
      } else {
        showToast(response.message || 'Failed to update owners')
      }
    } catch (err) {
      console.error('Bulk status error:', err)
      showToast(err.response?.data?.message || 'Failed to update owners')
    }
  }

  // Confirm Single Delete
  const handleDeleteOwnerClick = (owner) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      target: owner,
    })
  }

  // Confirm Bulk Delete
  const handleBulkDeleteClick = (ids) => {
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      target: ids,
    })
  }

  // Execute Delete (Single or Bulk)
  const handleExecuteDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteModal.type === 'single') {
        const id = deleteModal.target?._id || deleteModal.target?.id
        const res = await ownerService.deleteOwner(id)
        if (res.success) {
          showToast('Owner deleted successfully')
          if (selectedOwner && (selectedOwner._id || selectedOwner.id) === id) {
            setIsDrawerOpen(false)
            setSelectedOwner(null)
          }
          setDeleteModal({ isOpen: false, type: 'single', target: null })
          fetchOwners()
        } else {
          showToast(res.message || 'Failed to delete owner')
        }
      } else {
        const ids = deleteModal.target || []
        const res = await ownerService.bulkDelete(ids)
        if (res.success) {
          showToast(`${ids.length} owners deleted successfully`)
          if (
            selectedOwner &&
            ids.includes(selectedOwner._id || selectedOwner.id)
          ) {
            setIsDrawerOpen(false)
            setSelectedOwner(null)
          }
          setSelectedIds([])
          setDeleteModal({ isOpen: false, type: 'bulk', target: null })
          fetchOwners()
        } else {
          showToast(res.message || 'Failed to delete owners')
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.response?.data?.message || 'Failed to delete owner')
    } finally {
      setIsDeleting(false)
    }
  }

  // Export Owners to CSV
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await ownerService.getOwners({ limit: 1000 })
      const exportList = response.data?.owners || owners

      if (!exportList || exportList.length === 0) {
        showToast('No owners available to export')
        return
      }

      const headers = [
        'Owner ID',
        'Full Name',
        'Business Name',
        'Email',
        'Phone',
        'Location',
        'City',
        'Machines / Fleet',
        'Status',
        'KYC Status',
        'GST Number',
        'Join Date',
      ]

      const rows = exportList.map((item) => [
        `"${item._id || item.id || ''}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.businessName || '').replace(/"/g, '""')}"`,
        `"${(item.email || '').replace(/"/g, '""')}"`,
        `"${(item.phone || '').replace(/"/g, '""')}"`,
        `"${(item.location || '').replace(/"/g, '""')}"`,
        `"${(item.city || '').replace(/"/g, '""')}"`,
        `"${item.machines ?? item.fleetSize ?? 1}"`,
        `"${item.status || ''}"`,
        `"${item.kycStatus || ''}"`,
        `"${(item.gstNumber || '').replace(/"/g, '""')}"`,
        `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : ''}"`,
      ])

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `machine_wallah_owners_${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${exportList.length} owners to CSV successfully`)
    } catch (err) {
      console.error('Export error:', err)
      showToast('Failed to export owners')
    } finally {
      setIsExporting(false)
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
            <span className="text-slate-700 font-semibold">Manage Owners</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Owners
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Real-time management of registered equipment and machinery owners on MongoDB Atlas.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchOwners()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Owners"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F5A623]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* + Add Owner Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Owner</span>
          </button>
        </div>
      </div>

      {/* 1. 4 KPI Metric Cards with live counts */}
      <OwnerStatsCards stats={stats} isLoading={isLoading} />

      {/* 2. Filter & Search Controls */}
      <OwnerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        cities={cities}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* 3. Full-Width Owner Data Table */}
      <div className="w-full">
        <OwnerTable
          owners={owners}
          pagination={pagination}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectOwner={(owner) => {
            const id = owner._id || owner.id
            if (id) {
              navigate(`/owners/${id}`)
            }
          }}
          onStatusToggle={handleStatusToggle}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteOwnerClick}
          onBulkStatus={handleBulkStatus}
          onBulkDelete={handleBulkDeleteClick}
          onPageChange={(p) => {
            setPagination((prev) => ({ ...prev, page: p }))
            fetchOwners({ page: p })
          }}
          onPerPageChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l, page: 1 }))
            fetchOwners({ page: 1, limit: l })
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 4. Right-Side Slide-Over Sheet (View Owner Details) */}
      <OwnerDetailDrawer
        isOpen={isDrawerOpen}
        owner={selectedOwner}
        onClose={() => setIsDrawerOpen(false)}
        onStatusToggle={handleStatusToggle}
        onKycUpdate={handleKycUpdate}
        onAddNote={handleAddNote}
        onEditClick={handleEditClick}
      />

      {/* ─── 5. ADD OWNER MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Equipment Owner</h3>
                <p className="text-xs text-slate-500">Register a machinery owner to MongoDB Atlas</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOwnerSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwner.name}
                    onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                    placeholder="e.g. Suresh Patel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    value={newOwner.businessName}
                    onChange={(e) => setNewOwner({ ...newOwner, businessName: e.target.value })}
                    placeholder="e.g. Patel Earthmovers"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newOwner.email}
                    onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                    placeholder="e.g. suresh@patel.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newOwner.phone}
                    onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={newOwner.location}
                    onChange={(e) => setNewOwner({ ...newOwner, location: e.target.value })}
                    placeholder="e.g. Lucknow, UP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machines Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOwner.machines}
                    onChange={(e) => setNewOwner({ ...newOwner, machines: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newOwner.status}
                    onChange={(e) => setNewOwner({ ...newOwner, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    KYC Status
                  </label>
                  <select
                    value={newOwner.kycStatus}
                    onChange={(e) => setNewOwner({ ...newOwner, kycStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={newOwner.gstNumber}
                    onChange={(e) => setNewOwner({ ...newOwner, gstNumber: e.target.value })}
                    placeholder="e.g. 09AAACS1429B1Z8"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Owner</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. EDIT OWNER MODAL ─── */}
      {showEditModal && editingOwner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Equipment Owner</h3>
                <p className="text-xs text-slate-500">Update owner details and status in database</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingOwner(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditOwnerSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOwner.name}
                    onChange={(e) => setEditingOwner({ ...editingOwner, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Company Name
                  </label>
                  <input
                    type="text"
                    value={editingOwner.businessName}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, businessName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingOwner.email}
                    onChange={(e) => setEditingOwner({ ...editingOwner, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOwner.phone}
                    onChange={(e) => setEditingOwner({ ...editingOwner, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location (City, State)
                  </label>
                  <input
                    type="text"
                    value={editingOwner.location}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machines Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingOwner.machines}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, machines: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingOwner.status}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    KYC Status
                  </label>
                  <select
                    value={editingOwner.kycStatus}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, kycStatus: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={editingOwner.gstNumber}
                    onChange={(e) =>
                      setEditingOwner({ ...editingOwner, gstNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingOwner(null)
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 7. DELETE CONFIRMATION MODAL ─── */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                {deleteModal.type === 'single'
                  ? 'Delete Equipment Owner?'
                  : `Delete ${deleteModal.target?.length || 0} Owners?`}
              </h3>
              <p className="text-xs text-slate-500">
                {deleteModal.type === 'single'
                  ? `Are you sure you want to delete "${
                      deleteModal.target?.name || 'Owner'
                    }"? All associated fleet records and history will be permanently removed.`
                  : `Are you sure you want to delete ${
                      deleteModal.target?.length || 0
                    } selected owners? This action cannot be undone.`}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'single', target: null })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
