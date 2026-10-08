import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight,
  Download,
  RefreshCw,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react'
import { EnquiryStatsCards } from '../../components/enquiries/EnquiryStatsCards'
import { EnquiryFilters } from '../../components/enquiries/EnquiryFilters'
import { EnquiryTable } from '../../components/enquiries/EnquiryTable'
import { EnquiryDetailDrawer } from '../../components/enquiries/EnquiryDetailDrawer'
import { Toast } from '../../components/common/Toast'
import { enquiryService } from '../../services/enquiryService'

export default function CustomerEnquiryPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Enquiries & Counts from MongoDB
  const [enquiries, setEnquiries] = useState([])
  const [counts, setCounts] = useState({
    all: 0,
    new: 0,
    contacted: 0,
    converted: 0,
    closed: 0,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // Filter states
  const [activeTab, setActiveTab] = useState('All') // All, New, Contacted, Converted, Closed
  const [searchTerm, setSearchTerm] = useState('')
  const [enquiryType, setEnquiryType] = useState('All') // All, Buy, Rent
  const [statusFilter, setStatusFilter] = useState('All')

  // Slide-Over Drawer State
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single', // 'single' | 'bulk'
    target: null, // single enquiry object or array of ids
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch enquiries with filters and pagination
  const fetchEnquiries = useCallback(
    async (overrides = {}) => {
      setIsLoading(true)
      try {
        const queryPage = overrides.page !== undefined ? overrides.page : pagination.page
        const queryLimit = overrides.limit !== undefined ? overrides.limit : pagination.limit
        const querySearch = overrides.search !== undefined ? overrides.search : searchTerm
        const queryType =
          overrides.enquiryType !== undefined ? overrides.enquiryType : enquiryType

        // Determine status filter
        let queryStatus
        if (overrides.status !== undefined) {
          queryStatus = overrides.status
        } else if (activeTab !== 'All') {
          queryStatus = activeTab
        } else if (statusFilter !== 'All') {
          queryStatus = statusFilter
        }

        const params = {
          page: queryPage,
          limit: queryLimit,
        }
        if (querySearch && querySearch.trim()) params.search = querySearch.trim()
        if (queryType && queryType !== 'All') params.enquiryType = queryType
        if (queryStatus && queryStatus !== 'All') params.status = queryStatus

        const response = await enquiryService.getEnquiries(params)

        if (response.success) {
          const enquiriesList =
            response.data?.enquiries || (Array.isArray(response.data) ? response.data : [])
          const countsObj =
            response.data?.counts || response.counts || {
              all: 0,
              new: 0,
              contacted: 0,
              converted: 0,
              closed: 0,
            }
          const paginationObj =
            response.data?.pagination || response.pagination || {
              total: enquiriesList.length,
              page: queryPage,
              limit: queryLimit,
              totalPages: 1,
            }

          setEnquiries(enquiriesList)
          setCounts(countsObj)
          setPagination(paginationObj)

          // If drawer is open, keep selected enquiry refreshed with latest data
          if (selectedEnquiry) {
            const currentSelectedId = selectedEnquiry._id || selectedEnquiry.id
            const matched = enquiriesList.find(
              (item) => (item._id || item.id) === currentSelectedId
            )
            if (matched) {
              setSelectedEnquiry(matched)
            }
          }
        } else {
          showToast(response.message || 'Failed to fetch enquiries')
        }
      } catch (err) {
        console.error('Error fetching enquiries:', err)
        showToast(err.response?.data?.message || 'Error fetching customer enquiries')
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.page, pagination.limit, searchTerm, enquiryType, activeTab, statusFilter, selectedEnquiry]
  )

  // Initial load & when activeTab / enquiryType / statusFilter changes
  useEffect(() => {
    fetchEnquiries({ page: 1 })
    // Clear selection on filter change
    setSelectedIds([])
  }, [activeTab, enquiryType, statusFilter])

  // Handle Tab Change (Pill Tabs)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setStatusFilter(tabId === 'All' ? 'All' : tabId)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handle Status Dropdown Change
  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus)
    setActiveTab(newStatus)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Handle Reset
  const handleReset = () => {
    setActiveTab('All')
    setSearchTerm('')
    setEnquiryType('All')
    setStatusFilter('All')
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchEnquiries({
      page: 1,
      search: '',
      enquiryType: 'All',
      status: 'All',
    })
  }

  // Handle Apply Button / Search Enter
  const handleApply = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchEnquiries({ page: 1 })
  }

  // Select Enquiry & Open Right-Side Drawer
  const handleSelectEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry)
    setIsDrawerOpen(true)
  }

  // Update Status (New, Contacted, Converted, Closed)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await enquiryService.updateStatus(id, newStatus)
      if (response.success) {
        showToast(`Enquiry status updated to "${newStatus}"`)

        // Update in list
        setEnquiries((prev) =>
          prev.map((item) =>
            (item._id || item.id) === id
              ? { ...item, status: newStatus, history: response.data?.history || item.history }
              : item
          )
        )

        // Update selected enquiry in drawer
        if (selectedEnquiry && (selectedEnquiry._id || selectedEnquiry.id) === id) {
          setSelectedEnquiry((prev) => ({
            ...prev,
            status: newStatus,
            history: response.data?.history || prev.history,
          }))
        }

        // Re-fetch counts
        fetchEnquiries()
      } else {
        showToast(response.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      showToast(err.response?.data?.message || 'Error updating status')
    }
  }

  // Add Note to Enquiry
  const handleAddNote = async (id, noteText) => {
    try {
      const response = await enquiryService.addNote(id, noteText)
      if (response.success) {
        showToast('Note added successfully')

        // Update selected enquiry with updated notes and history
        if (response.data) {
          setSelectedEnquiry(response.data)
          setEnquiries((prev) =>
            prev.map((item) =>
              (item._id || item.id) === id ? response.data : item
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

  // Assign Executive
  const handleAssign = async (id, assignedTo) => {
    try {
      const response = await enquiryService.assignExecutive(id, assignedTo)
      if (response.success) {
        showToast(`Enquiry assigned to ${assignedTo}`)
        if (response.data) {
          setSelectedEnquiry(response.data)
          setEnquiries((prev) =>
            prev.map((item) =>
              (item._id || item.id) === id ? response.data : item
            )
          )
        }
      } else {
        showToast(response.message || 'Failed to assign executive')
      }
    } catch (err) {
      console.error('Error assigning executive:', err)
      showToast(err.response?.data?.message || 'Error assigning executive')
    }
  }

  // Single Delete Enquiry Trigger
  const handleDeleteEnquiry = (enquiry) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      target: enquiry,
    })
  }

  // Bulk Delete Trigger
  const handleBulkDeleteTrigger = (ids) => {
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      target: ids,
    })
  }

  // Bulk Status Update
  const handleBulkStatus = async (status, ids) => {
    if (!ids || ids.length === 0) return
    try {
      const response = await enquiryService.bulkUpdateStatus(ids, status)
      if (response.success) {
        showToast(`Updated ${ids.length} enquiries to "${status}"`)
        setSelectedIds([])
        fetchEnquiries()
      } else {
        showToast(response.message || 'Failed to update enquiries')
      }
    } catch (err) {
      console.error('Error in bulk status update:', err)
      showToast(err.response?.data?.message || 'Error updating enquiries')
    }
  }

  // Confirm and Execute Delete (Single or Bulk)
  const handleExecuteDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteModal.type === 'single') {
        const id = deleteModal.target?._id || deleteModal.target?.id
        const res = await enquiryService.deleteEnquiry(id)
        if (res.success) {
          showToast('Customer enquiry deleted successfully')
          if (selectedEnquiry && (selectedEnquiry._id || selectedEnquiry.id) === id) {
            setIsDrawerOpen(false)
            setSelectedEnquiry(null)
          }
          setDeleteModal({ isOpen: false, type: 'single', target: null })
          fetchEnquiries()
        } else {
          showToast(res.message || 'Failed to delete enquiry')
        }
      } else {
        const ids = deleteModal.target || []
        const res = await enquiryService.bulkDelete(ids)
        if (res.success) {
          showToast(`${ids.length} customer enquiries deleted successfully`)
          if (
            selectedEnquiry &&
            ids.includes(selectedEnquiry._id || selectedEnquiry.id)
          ) {
            setIsDrawerOpen(false)
            setSelectedEnquiry(null)
          }
          setSelectedIds([])
          setDeleteModal({ isOpen: false, type: 'bulk', target: null })
          fetchEnquiries()
        } else {
          showToast(res.message || 'Failed to delete enquiries')
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.response?.data?.message || 'Failed to delete enquiry')
    } finally {
      setIsDeleting(false)
    }
  }

  // Export Enquiries to CSV
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Fetch up to 1000 records for clean export
      const response = await enquiryService.getEnquiries({ limit: 1000 })
      const exportList =
        response.data?.enquiries || (Array.isArray(response.data) ? response.data : enquiries)

      if (!exportList || exportList.length === 0) {
        showToast('No enquiries available to export')
        return
      }

      // Generate CSV Content
      const headers = [
        'Enquiry ID',
        'Customer Name',
        'Phone',
        'Email',
        'Location',
        'Machine / Model',
        'Type',
        'Status',
        'Budget Range',
        'Requirement Date',
        'Source',
        'Message',
        'Created Date',
      ]

      const rows = exportList.map((item) => [
        `"${item.enquiryId || ''}"`,
        `"${(item.name || item.customerName || '').replace(/"/g, '""')}"`,
        `"${(item.phone || item.customerPhone || '').replace(/"/g, '""')}"`,
        `"${(item.email || item.customerEmail || '').replace(/"/g, '""')}"`,
        `"${(item.location || item.preferredLocation || '').replace(/"/g, '""')}"`,
        `"${(item.machine || item.machineName || item.fullMachineName || '').replace(/"/g, '""')}"`,
        `"${item.enquiryType || ''}"`,
        `"${item.status || ''}"`,
        `"${(item.budgetRange || '').replace(/"/g, '""')}"`,
        `"${(item.requirementDate || '').replace(/"/g, '""')}"`,
        `"${(item.source || '').replace(/"/g, '""')}"`,
        `"${(item.message || '').replace(/"/g, '""')}"`,
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
        `machine_wallah_enquiries_${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${exportList.length} enquiries to CSV successfully`)
    } catch (err) {
      console.error('Export error:', err)
      showToast('Failed to export enquiries')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} />

      {/* 1. Breadcrumbs & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Customer Enquiry</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Customer Enquiry
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Real-time management of machinery purchase & rental enquiries with MongoDB Atlas.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Data Button */}
          <button
            type="button"
            onClick={() => fetchEnquiries()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F5A623]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Enquiries Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export Enquiries'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Metrics with Live Counts */}
      <EnquiryStatsCards counts={counts} isLoading={isLoading} />

      {/* 3. Filter Tabs & Filter Inputs */}
      <EnquiryFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        enquiryType={enquiryType}
        onEnquiryTypeChange={setEnquiryType}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        counts={counts}
        onReset={handleReset}
        onApply={handleApply}
        isLoading={isLoading}
      />

      {/* 4. Full-Width Enquiries Table (Not squished by drawer) */}
      <div className="w-full">
        <EnquiryTable
          enquiries={enquiries}
          pagination={pagination}
          selectedEnquiryId={selectedEnquiry?._id || selectedEnquiry?.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectEnquiry={handleSelectEnquiry}
          onUpdateStatus={handleUpdateStatus}
          onDeleteEnquiry={handleDeleteEnquiry}
          onBulkStatus={handleBulkStatus}
          onBulkDelete={handleBulkDeleteTrigger}
          onPageChange={(newPage) => {
            setPagination((prev) => ({ ...prev, page: newPage }))
            fetchEnquiries({ page: newPage })
          }}
          onPerPageChange={(newLimit) => {
            setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }))
            fetchEnquiries({ page: 1, limit: newLimit })
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 5. Right-Side Slide-Over Drawer (Clean overlay without squishing the table) */}
      <EnquiryDetailDrawer
        isOpen={isDrawerOpen}
        enquiry={selectedEnquiry}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onAssign={handleAssign}
      />

      {/* 6. Delete Confirmation Dialog Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">
                {deleteModal.type === 'single'
                  ? 'Delete Customer Enquiry?'
                  : `Delete ${deleteModal.target?.length || 0} Enquiries?`}
              </h3>
              <p className="text-xs text-slate-500">
                {deleteModal.type === 'single'
                  ? `Are you sure you want to delete the enquiry from "${
                      deleteModal.target?.name || deleteModal.target?.customerName || 'Customer'
                    }"? This action cannot be undone.`
                  : `Are you sure you want to delete ${
                      deleteModal.target?.length || 0
                    } selected enquiries? This action cannot be undone.`}
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
