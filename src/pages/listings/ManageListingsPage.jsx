import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react'
import { ListingStatsCards } from '../../components/listings/ListingStatsCards'
import { ListingFilters } from '../../components/listings/ListingFilters'
import { ListingTable } from '../../components/listings/ListingTable'
import { ListingDetailDrawer } from '../../components/listings/ListingDetailDrawer'
import { ListingFormModal } from '../../components/listings/ListingFormModal'
import { Toast } from '../../components/common/Toast'
import { listingService } from '../../services/listingService'
import { categoryService } from '../../services/categoryService'

export default function ManageListingsPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    rent: 0,
    sale: 0,
    pending: 0,
    reported: 0,
    featured: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 50,
  })

  // Filters State
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All')

  // Modals & Drawer State
  const [selectedListing, setSelectedListing] = useState(null)
  const [editingListing, setEditingListing] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch Categories from MongoDB Atlas
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 100 })
        const catList = res?.data?.categories || res?.data || []
        const names = catList.map((c) => c.name || c.title).filter(Boolean)
        setCategories(names)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Fetch Listings with current filters & pagination
  const fetchListings = useCallback(async (overrides = {}) => {
    try {
      setLoading(true)
      const currentTab = overrides.activeTab !== undefined ? overrides.activeTab : activeTab
      const currentSearch = overrides.searchTerm !== undefined ? overrides.searchTerm : searchTerm
      const currentCat = overrides.categoryFilter !== undefined ? overrides.categoryFilter : categoryFilter
      const currentType = overrides.typeFilter !== undefined ? overrides.typeFilter : typeFilter
      const currentStatus = overrides.statusFilter !== undefined ? overrides.statusFilter : statusFilter
      const currentCity = overrides.cityFilter !== undefined ? overrides.cityFilter : cityFilter
      const currentPage = overrides.page || pagination.page
      const currentLimit = overrides.limit || pagination.limit

      const params = {
        page: currentPage,
        limit: currentLimit,
      }

      if (currentSearch && currentSearch.trim()) {
        params.search = currentSearch.trim()
      }

      if (currentCat && currentCat !== 'All') {
        params.category = currentCat
      }

      if (currentType && currentType !== 'All') {
        params.type = currentType
      }

      if (currentStatus && currentStatus !== 'All') {
        params.status = currentStatus
      }

      // Handle Tab-specific filters
      if (currentTab === 'Rent') {
        params.type = 'Rent'
      } else if (currentTab === 'Sale') {
        params.type = 'Sale'
      } else if (currentTab === 'Pending') {
        params.approvalStatus = 'Pending'
      } else if (currentTab === 'Rejected') {
        params.approvalStatus = 'Rejected'
      } else if (currentTab === 'Featured') {
        params.isFeatured = 'true'
      }

      const res = await listingService.getListings(params)
      const data = res?.data || {}

      let items = data.listings || []

      // Client filter for city if not handled by server query
      if (currentCity && currentCity !== 'All') {
        items = items.filter((l) => {
          const c = l.location?.city || (typeof l.location === 'string' ? l.location : '')
          return c.toLowerCase().includes(currentCity.toLowerCase())
        })
      }

      setListings(items)
      if (data.pagination) {
        setPagination({
          page: data.pagination.page || 1,
          pages: data.pagination.pages || 1,
          total: data.pagination.total || items.length,
          limit: data.pagination.limit || currentLimit,
        })
      }
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load listings:', err)
      showToast('Failed to load listings from server')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm, categoryFilter, typeFilter, statusFilter, cityFilter, pagination.page, pagination.limit])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // Filter Handlers
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    fetchListings({ activeTab: tabId, page: 1 })
  }

  const handleApplyFilters = () => {
    fetchListings({ page: 1 })
    showToast('Applied active filters')
  }

  const handleResetFilters = () => {
    setActiveTab('All')
    setSearchTerm('')
    setCategoryFilter('All')
    setTypeFilter('All')
    setStatusFilter('All')
    setCityFilter('All')
    fetchListings({
      activeTab: 'All',
      searchTerm: '',
      categoryFilter: 'All',
      typeFilter: 'All',
      statusFilter: 'All',
      cityFilter: 'All',
      page: 1,
    })
    showToast('Filters reset.')
  }

  // Status Change (Active <-> Inactive)
  const handleStatusChange = async (id, targetStatus) => {
    try {
      await listingService.toggleListingStatus(id)
      showToast(`Listing status updated to ${targetStatus}`)
      fetchListings()
      if (selectedListing && (selectedListing._id === id || selectedListing.id === id)) {
        setSelectedListing((prev) => ({ ...prev, status: targetStatus }))
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error updating listing status')
    }
  }

  // Delete Listing
  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this listing'}"?`)) {
      return
    }
    try {
      await listingService.deleteListing(id)
      showToast(`Listing "${title}" deleted successfully`)
      fetchListings()
      if (selectedListing && (selectedListing._id === id || selectedListing.id === id)) {
        setSelectedListing(null)
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error deleting listing')
    }
  }

  // Bulk Status Update
  const handleBulkStatus = async (ids, status) => {
    try {
      await listingService.bulkUpdateStatus(ids, status)
      showToast(`${ids.length} listings marked as ${status}`)
      fetchListings()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Bulk status update failed')
    }
  }

  // Bulk Delete
  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} listings?`)) {
      return
    }
    try {
      await listingService.bulkDeleteListings(ids)
      showToast(`${ids.length} listings deleted successfully`)
      fetchListings()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Bulk delete failed')
    }
  }

  // Create / Edit Save Handler
  const handleSaveListing = async (payload, id) => {
    if (id) {
      await listingService.updateListing(id, payload)
      showToast(`Listing "${payload.title}" updated successfully`)
    } else {
      await listingService.createListing(payload)
      showToast(`Listing "${payload.title}" created successfully!`)
    }
    setEditingListing(null)
    fetchListings()
  }

  // Export listings to CSV
  const handleExportCSV = () => {
    if (listings.length === 0) {
      showToast('No listings available to export.')
      return
    }
    const headers = ['Listing Code', 'Title', 'Category', 'Type', 'Rate/Price', 'Owner', 'Phone', 'City', 'Status', 'Approval']
    const rows = listings.map((l) => [
      l.listingCode || '',
      `"${(l.title || '').replace(/"/g, '""')}"`,
      l.category || '',
      l.type || '',
      `"${l.rateOrPrice || ''}"`,
      `"${(l.ownerName || l.owner || '').replace(/"/g, '""')}"`,
      l.ownerPhone || '',
      l.location?.city || '',
      l.status || '',
      l.approvalStatus || '',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `machinery_listings_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported listings to CSV successfully!')
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Breadcrumbs & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Manage Listings</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Listings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Real-time control over all verified heavy machinery listings, rates, and availability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchListings()}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Refresh Listings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingListing(null)
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Listing</span>
          </button>
        </div>
      </div>

      {/* 1. Dynamic KPI Metric Cards */}
      <ListingStatsCards stats={stats} />

      {/* 2. Tabs, Dynamic Categories from Atlas, and Filters */}
      <ListingFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        onExport={handleExportCSV}
        categories={categories}
      />

      {/* 3. Listings Dynamic Data Table */}
      <ListingTable
        listings={listings}
        pagination={pagination}
        loading={loading}
        onPageChange={(page) => fetchListings({ page })}
        onLimitChange={(limit) => fetchListings({ page: 1, limit })}
        onViewListing={(item) => setSelectedListing(item)}
        onEditListing={(item) => {
          setEditingListing(item)
          setShowAddModal(true)
        }}
        onDeleteListing={(id, title) => handleDeleteListing(id, title)}
        onStatusChange={handleStatusChange}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={handleBulkDelete}
      />

      {/* 4. Sliding Details Drawer */}
      {selectedListing && (
        <ListingDetailDrawer
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStatusToggle={(id) =>
            handleStatusChange(id, selectedListing.status === 'Active' ? 'Inactive' : 'Active')
          }
          onEdit={(item) => {
            setEditingListing(item)
            setShowAddModal(true)
          }}
        />
      )}

      {/* 5. Add / Edit Listing Modal with Local Backend Image Upload */}
      {showAddModal && (
        <ListingFormModal
          isOpen={showAddModal}
          initialData={editingListing}
          onClose={() => {
            setShowAddModal(false)
            setEditingListing(null)
          }}
          onSave={handleSaveListing}
        />
      )}
    </div>
  )
}
