import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
} from 'lucide-react'
import { MachineStatsCards } from '../../components/machines/MachineStatsCards'
import { MachineFilters } from '../../components/machines/MachineFilters'
import { MachineTable } from '../../components/machines/MachineTable'
import { MachineDetailDrawer } from '../../components/machines/MachineDetailDrawer'
import { Toast } from '../../components/common/Toast'
import { ImageUploadField } from '../../components/common/ImageUploadField'
import { machineService } from '../../services/machineService'
import { categoryService } from '../../services/categoryService'

export default function ManageMachinesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const initialOwner = searchParams.get('owner') || searchParams.get('ownerName') || 'All'
  const initialStatus = searchParams.get('status') || 'All'

  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data State
  const [machines, setMachines] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
  })
  const [categories, setCategories] = useState([])
  const [owners, setOwners] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [machineTypeFilter, setMachineTypeFilter] = useState('All')
  const [ownerFilter, setOwnerFilter] = useState(initialOwner)
  const [statusFilter, setStatusFilter] = useState(initialStatus)

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Drawer
  const [selectedMachine, setSelectedMachine] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Add Machine Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMachine, setNewMachine] = useState({
    name: '',
    brand: '',
    model: '',
    year: '2023',
    category: '',
    machineType: 'Construction',
    owner: 'Rakesh Singh',
    location: 'Lucknow, UP',
    regNo: '',
    listingType: 'Rent',
    status: 'Active',
    image: '',
  })

  // Edit Machine Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMachine, setEditingMachine] = useState(null)

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'single',
    target: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch live categories from database
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategories({ limit: 1000 })
      if (response.success && response.data?.categories) {
        const catNames = response.data.categories
          .map((c) => c.name)
          .filter(Boolean)
        if (catNames.length > 0) {
          setCategories(catNames)
          setNewMachine((prev) => ({
            ...prev,
            category: prev.category && catNames.includes(prev.category) ? prev.category : catNames[0],
          }))
        }
      }
    } catch (err) {
      console.error('Fetch categories error:', err)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Fetch machines
  const fetchMachines = useCallback(
    async (overrides = {}) => {
      setIsLoading(true)
      try {
        const queryPage = overrides.page !== undefined ? overrides.page : pagination.page
        const queryLimit = overrides.limit !== undefined ? overrides.limit : pagination.limit
        const querySearch = overrides.search !== undefined ? overrides.search : searchTerm
        const queryCat = overrides.category !== undefined ? overrides.category : categoryFilter
        const queryType =
          overrides.machineType !== undefined ? overrides.machineType : machineTypeFilter
        const queryOwner = overrides.owner !== undefined ? overrides.owner : ownerFilter
        const queryStatus = overrides.status !== undefined ? overrides.status : statusFilter

        const params = {
          page: queryPage,
          limit: queryLimit,
        }
        if (querySearch && querySearch.trim()) params.search = querySearch.trim()
        if (queryCat && queryCat !== 'All') params.category = queryCat
        if (queryType && queryType !== 'All') params.machineType = queryType
        if (queryOwner && queryOwner !== 'All') params.owner = queryOwner
        if (queryStatus && queryStatus !== 'All') params.status = queryStatus

        const response = await machineService.getMachines(params)

        if (response.success) {
          const list = response.data?.machines || []
          const statsObj = response.data?.stats || {
            total: list.length,
            active: 0,
            inactive: 0,
            pending: 0,
          }
          const paginationObj = response.data?.pagination || {
            total: list.length,
            page: queryPage,
            limit: queryLimit,
            totalPages: 1,
          }

          setMachines(list)
          setStats(statsObj)
          setPagination(paginationObj)
          if (response.data?.categories && response.data.categories.length > 0) {
            setCategories(response.data.categories)
          }
          if (response.data?.owners) setOwners(response.data.owners)

          // Refresh selected machine if drawer open
          if (selectedMachine) {
            const curId = selectedMachine._id || selectedMachine.id
            const matched = list.find((m) => (m._id || m.id) === curId)
            if (matched) setSelectedMachine(matched)
          }
        } else {
          showToast(response.message || 'Failed to fetch machines')
        }
      } catch (err) {
        console.error('Fetch machines error:', err)
        showToast(err.response?.data?.message || 'Error fetching machines')
      } finally {
        setIsLoading(false)
      }
    },
    [
      pagination.page,
      pagination.limit,
      searchTerm,
      categoryFilter,
      machineTypeFilter,
      ownerFilter,
      statusFilter,
      selectedMachine,
    ]
  )

  useEffect(() => {
    fetchMachines({ page: 1 })
    setSelectedIds([])
  }, [categoryFilter, machineTypeFilter, ownerFilter, statusFilter])

  // Filter Reset
  const handleResetFilters = () => {
    setSearchTerm('')
    setCategoryFilter('All')
    setMachineTypeFilter('All')
    setOwnerFilter('All')
    setStatusFilter('All')
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchMachines({
      page: 1,
      search: '',
      category: 'All',
      machineType: 'All',
      owner: 'All',
      status: 'All',
    })
    showToast('Filters reset.')
  }

  // Filter Apply
  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchMachines({ page: 1 })
  }

  // Toggle Status
  const handleStatusToggle = async (id, nextStatus) => {
    try {
      const response = await machineService.toggleStatus(id, nextStatus)
      if (response.success) {
        showToast(`Machine status updated to "${response.data?.status || nextStatus}"`)

        setMachines((prev) =>
          prev.map((m) =>
            (m._id || m.id) === id ? { ...m, status: response.data?.status || nextStatus } : m
          )
        )

        if (selectedMachine && (selectedMachine._id || selectedMachine.id) === id) {
          setSelectedMachine((prev) => ({
            ...prev,
            status: response.data?.status || nextStatus,
          }))
        }

        fetchMachines()
      } else {
        showToast(response.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Toggle status error:', err)
      showToast(err.response?.data?.message || 'Error updating status')
    }
  }

  // Add Machine Submit
  const handleAddMachineSubmit = async (e) => {
    e.preventDefault()
    if (!newMachine.name || !newMachine.regNo) {
      showToast('Please fill all required fields!')
      return
    }

    setIsSubmitting(true)
    try {
      const categoryToUse = newMachine.category || categories[0] || 'Excavators'
      const payload = {
        ...newMachine,
        category: categoryToUse,
      }
      const response = await machineService.createMachine(payload)
      if (response.success) {
        showToast(`Machine "${newMachine.name}" added successfully!`)
        setShowAddModal(false)
        setNewMachine({
          name: '',
          brand: '',
          model: '',
          year: '2023',
          category: categories[0] || '',
          machineType: 'Construction',
          owner: 'Rakesh Singh',
          location: 'Lucknow, UP',
          regNo: '',
          listingType: 'Rent',
          status: 'Active',
          image: '',
        })
        fetchMachines({ page: 1 })
      } else {
        showToast(response.message || 'Failed to add machine')
      }
    } catch (err) {
      console.error('Add machine error:', err)
      showToast(err.response?.data?.message || 'Failed to add machine')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Edit Modal
  const handleEditClick = (machine) => {
    fetchCategories()
    setEditingMachine({
      id: machine._id || machine.id,
      name: machine.name || '',
      brand: machine.brand || '',
      model: machine.model || '',
      year: machine.year || '2023',
      category: machine.category || categories[0] || '',
      machineType: machine.machineType || 'Construction',
      owner: machine.owner || '',
      location: machine.location || '',
      regNo: machine.regNo || '',
      listingType: machine.listingType || 'Rent',
      status: machine.status || 'Active',
      image: machine.image || '',
    })
    setShowEditModal(true)
  }

  // Edit Machine Submit
  const handleEditMachineSubmit = async (e) => {
    e.preventDefault()
    if (!editingMachine.name || !editingMachine.regNo) {
      showToast('Please fill all required fields!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await machineService.updateMachine(
        editingMachine.id,
        editingMachine
      )
      if (response.success) {
        showToast('Machine details updated successfully!')
        setShowEditModal(false)
        setEditingMachine(null)
        fetchMachines()
      } else {
        showToast(response.message || 'Failed to update machine')
      }
    } catch (err) {
      console.error('Edit machine error:', err)
      showToast(err.response?.data?.message || 'Failed to update machine')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bulk Status Update
  const handleBulkStatus = async (status, ids) => {
    if (!ids || ids.length === 0) return
    try {
      const response = await machineService.bulkUpdateStatus(ids, status)
      if (response.success) {
        showToast(`Updated ${ids.length} machines to "${status}"`)
        setSelectedIds([])
        fetchMachines()
      } else {
        showToast(response.message || 'Failed to update machines')
      }
    } catch (err) {
      console.error('Bulk status error:', err)
      showToast(err.response?.data?.message || 'Failed to update machines')
    }
  }

  // Single & Bulk Delete Handlers
  const handleDeleteMachineClick = (machine) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      target: machine,
    })
  }

  const handleBulkDeleteClick = (ids) => {
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
      target: ids,
    })
  }

  const handleExecuteDelete = async () => {
    setIsDeleting(true)
    try {
      if (deleteModal.type === 'single') {
        const id = deleteModal.target?._id || deleteModal.target?.id
        const res = await machineService.deleteMachine(id)
        if (res.success) {
          showToast('Machine deleted successfully')
          if (selectedMachine && (selectedMachine._id || selectedMachine.id) === id) {
            setIsDrawerOpen(false)
            setSelectedMachine(null)
          }
          setDeleteModal({ isOpen: false, type: 'single', target: null })
          fetchMachines()
        } else {
          showToast(res.message || 'Failed to delete machine')
        }
      } else {
        const ids = deleteModal.target || []
        const res = await machineService.bulkDelete(ids)
        if (res.success) {
          showToast(`${ids.length} machines deleted successfully`)
          if (
            selectedMachine &&
            ids.includes(selectedMachine._id || selectedMachine.id)
          ) {
            setIsDrawerOpen(false)
            setSelectedMachine(null)
          }
          setSelectedIds([])
          setDeleteModal({ isOpen: false, type: 'bulk', target: null })
          fetchMachines()
        } else {
          showToast(res.message || 'Failed to delete machines')
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.response?.data?.message || 'Failed to delete machine')
    } finally {
      setIsDeleting(false)
    }
  }

  // Export to CSV
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await machineService.getMachines({ limit: 1000 })
      const exportList = response.data?.machines || machines

      if (!exportList || exportList.length === 0) {
        showToast('No machines available to export')
        return
      }

      const headers = [
        'Machine ID',
        'Name',
        'Brand',
        'Model',
        'Year',
        'Category',
        'Type',
        'Owner',
        'Location',
        'Registration No',
        'Listing Type',
        'Status',
        'Created Date',
      ]

      const rows = exportList.map((item) => [
        `"${item._id || item.id || ''}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.brand || '').replace(/"/g, '""')}"`,
        `"${(item.model || '').replace(/"/g, '""')}"`,
        `"${item.year || ''}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        `"${item.machineType || ''}"`,
        `"${(item.owner || '').replace(/"/g, '""')}"`,
        `"${(item.location || '').replace(/"/g, '""')}"`,
        `"${item.regNo || ''}"`,
        `"${item.listingType || ''}"`,
        `"${item.status || ''}"`,
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
        `machine_wallah_equipment_${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${exportList.length} machines to CSV successfully`)
    } catch (err) {
      console.error('Export error:', err)
      showToast('Failed to export machines')
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
            <span className="text-slate-700 font-semibold">Manage Machine / Vehicle</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Machine / Vehicle
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Real-time management of all registered machines and heavy vehicles on MongoDB Atlas.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              fetchMachines()
              fetchCategories()
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#F5A623]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* + Add Machine Button */}
          <button
            type="button"
            onClick={() => {
              fetchCategories()
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Machine / Vehicle</span>
          </button>
        </div>
      </div>

      {/* 1. 4 KPI Metric Cards */}
      <MachineStatsCards stats={stats} isLoading={isLoading} />

      {/* 2. Filter & Search Controls */}
      <MachineFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        machineTypeFilter={machineTypeFilter}
        onMachineTypeChange={setMachineTypeFilter}
        ownerFilter={ownerFilter}
        onOwnerChange={setOwnerFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categories={categories}
        owners={owners}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* 3. Full-Width Machine Data Table */}
      <div className="w-full">
        <MachineTable
          machines={machines}
          pagination={pagination}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectMachine={(machine) => {
            const id = machine._id || machine.id
            if (id) {
              navigate(`/machines/${id}`)
            }
          }}
          onStatusToggle={handleStatusToggle}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteMachineClick}
          onBulkStatus={handleBulkStatus}
          onBulkDelete={handleBulkDeleteClick}
          onPageChange={(p) => {
            setPagination((prev) => ({ ...prev, page: p }))
            fetchMachines({ page: p })
          }}
          onPerPageChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l, page: 1 }))
            fetchMachines({ page: 1, limit: l })
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 4. Right-Side Slide-Over Sheet (Details Drawer) */}
      <MachineDetailDrawer
        isOpen={isDrawerOpen}
        machine={selectedMachine}
        onClose={() => setIsDrawerOpen(false)}
        onStatusToggle={handleStatusToggle}
        onEditClick={handleEditClick}
      />

      {/* ─── 5. ADD MACHINE MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Machine / Vehicle
                </h3>
                <p className="text-xs text-slate-500">
                  Register new equipment into platform fleet
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMachineSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machine Name / Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMachine.name}
                    onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                    placeholder="e.g. JCB 3DX Backhoe"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={newMachine.brand}
                    onChange={(e) => setNewMachine({ ...newMachine, brand: e.target.value })}
                    placeholder="e.g. JCB, Tata, CAT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMachine.regNo}
                    onChange={(e) =>
                      setNewMachine({
                        ...newMachine,
                        regNo: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. UP32AB1234"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={newMachine.year}
                    onChange={(e) => setNewMachine({ ...newMachine, year: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newMachine.category}
                    onChange={(e) => setNewMachine({ ...newMachine, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machine Type
                  </label>
                  <select
                    value={newMachine.machineType}
                    onChange={(e) =>
                      setNewMachine({ ...newMachine, machineType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Construction">Construction</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Heavy Equipment">Heavy Equipment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Owner
                  </label>
                  <input
                    type="text"
                    value={newMachine.owner}
                    onChange={(e) => setNewMachine({ ...newMachine, owner: e.target.value })}
                    placeholder="e.g. Rakesh Singh"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newMachine.location}
                    onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                    placeholder="e.g. Lucknow, UP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={newMachine.listingType}
                    onChange={(e) =>
                      setNewMachine({ ...newMachine, listingType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Buy">Buy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newMachine.status}
                    onChange={(e) => setNewMachine({ ...newMachine, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Machine Image (Photo / Fleet Thumbnail)"
                value={newMachine.image}
                onChange={(url) => setNewMachine({ ...newMachine, image: url })}
                folder="machines"
                helperText="PNG, JPG, WebP up to 10MB (Saved locally in backend uploads)"
              />

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
                    <span>Add Machine</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. EDIT MACHINE MODAL ─── */}
      {showEditModal && editingMachine && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Edit Machine / Vehicle
                </h3>
                <p className="text-xs text-slate-500">
                  Update equipment specifications and status
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMachine(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditMachineSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Machine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMachine.name}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editingMachine.brand}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registration No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMachine.regNo}
                    onChange={(e) =>
                      setEditingMachine({
                        ...editingMachine,
                        regNo: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={editingMachine.year}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, year: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editingMachine.category}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    {editingMachine.category && !categories.includes(editingMachine.category) && (
                      <option value={editingMachine.category}>{editingMachine.category}</option>
                    )}
                    {categories.map((catName) => (
                      <option key={catName} value={catName}>
                        {catName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Listing Type
                  </label>
                  <select
                    value={editingMachine.listingType}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, listingType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Buy">Buy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={editingMachine.owner}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, owner: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingMachine.location}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingMachine.status}
                    onChange={(e) =>
                      setEditingMachine({ ...editingMachine, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

              </div>
              <div className="mt-3">
                <ImageUploadField
                  label="Machine Image (Photo / Fleet Thumbnail)"
                  value={editingMachine.image}
                  onChange={(url) => setEditingMachine({ ...editingMachine, image: url })}
                  folder="machines"
                  helperText="PNG, JPG, WebP up to 10MB (Saved locally in backend uploads)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingMachine(null)
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
                  ? 'Delete Machine / Vehicle?'
                  : `Delete ${deleteModal.target?.length || 0} Machines?`}
              </h3>
              <p className="text-xs text-slate-500">
                {deleteModal.type === 'single'
                  ? `Are you sure you want to delete "${
                      deleteModal.target?.name || 'Machine'
                    }" (${deleteModal.target?.regNo || ''})? This will remove all listing links and history.`
                  : `Are you sure you want to delete ${
                      deleteModal.target?.length || 0
                    } selected machines? This action cannot be undone.`}
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
