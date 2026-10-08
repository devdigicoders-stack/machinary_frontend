import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  X,
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
  LayoutGrid,
} from 'lucide-react'
import { CategoryStatsCards } from '../../components/categories/CategoryStatsCards'
import { CategoryFilters } from '../../components/categories/CategoryFilters'
import { CategoryTable } from '../../components/categories/CategoryTable'
import { CategoryDetailDrawer } from '../../components/categories/CategoryDetailDrawer'
import { Toast } from '../../components/common/Toast'
import { ImageUploadField } from '../../components/common/ImageUploadField'
import { categoryService } from '../../services/categoryService'

export default function ManageCategoryPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Data State
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    subcategories: 0,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Latest')

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Drawer
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Add Category form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    subcategories: '1',
    machinesCount: '0',
    status: 'Active',
    image: '',
  })

  // Edit Category form state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

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

  // Fetch categories
  const fetchCategories = useCallback(
    async (overrides = {}) => {
      setIsLoading(true)
      try {
        const queryPage = overrides.page !== undefined ? overrides.page : pagination.page
        const queryLimit = overrides.limit !== undefined ? overrides.limit : pagination.limit
        const querySearch = overrides.search !== undefined ? overrides.search : searchTerm
        const queryStatus = overrides.status !== undefined ? overrides.status : statusFilter
        const querySort = overrides.sortBy !== undefined ? overrides.sortBy : sortBy

        const params = {
          page: queryPage,
          limit: queryLimit,
        }
        if (querySearch && querySearch.trim()) params.search = querySearch.trim()
        if (queryStatus && queryStatus !== 'All') params.status = queryStatus
        if (querySort) params.sortBy = querySort

        const response = await categoryService.getCategories(params)

        if (response.success) {
          const list = response.data?.categories || []
          const statsObj = response.data?.stats || {
            total: list.length,
            active: 0,
            inactive: 0,
            subcategories: 0,
          }
          const paginationObj = response.data?.pagination || {
            total: list.length,
            page: queryPage,
            limit: queryLimit,
            totalPages: 1,
          }

          setCategories(list)
          setStats(statsObj)
          setPagination(paginationObj)

          if (selectedCategory) {
            const curId = selectedCategory._id || selectedCategory.id
            const matched = list.find((c) => (c._id || c.id) === curId)
            if (matched) setSelectedCategory(matched)
          }
        } else {
          showToast(response.message || 'Failed to fetch categories')
        }
      } catch (err) {
        console.error('Fetch categories error:', err)
        showToast(err.response?.data?.message || 'Error fetching categories')
      } finally {
        setIsLoading(false)
      }
    },
    [pagination.page, pagination.limit, searchTerm, statusFilter, sortBy, selectedCategory]
  )

  useEffect(() => {
    fetchCategories({ page: 1 })
    setSelectedIds([])
  }, [statusFilter, sortBy])

  // Reset
  const handleResetFilters = () => {
    setSearchTerm('')
    setStatusFilter('All')
    setSortBy('Latest')
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchCategories({
      page: 1,
      search: '',
      status: 'All',
      sortBy: 'Latest',
    })
    showToast('Filters reset.')
  }

  // Apply
  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchCategories({ page: 1 })
  }

  // Toggle Status
  const handleStatusToggle = async (id, nextStatus) => {
    try {
      const response = await categoryService.toggleStatus(id, nextStatus)
      if (response.success) {
        showToast(`Category status updated to "${response.data?.status || nextStatus}"`)

        setCategories((prev) =>
          prev.map((c) =>
            (c._id || c.id) === id ? { ...c, status: response.data?.status || nextStatus } : c
          )
        )

        if (selectedCategory && (selectedCategory._id || selectedCategory.id) === id) {
          setSelectedCategory((prev) => ({
            ...prev,
            status: response.data?.status || nextStatus,
          }))
        }

        fetchCategories()
      } else {
        showToast(response.message || 'Failed to update status')
      }
    } catch (err) {
      console.error('Toggle status error:', err)
      showToast(err.response?.data?.message || 'Error updating status')
    }
  }

  // Add Category Submit
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault()
    if (!newCategory.name) {
      showToast('Please enter category name!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await categoryService.createCategory({
        ...newCategory,
        subcategories: parseInt(newCategory.subcategories, 10) || 1,
        machinesCount: parseInt(newCategory.machinesCount, 10) || 0,
      })

      if (response.success) {
        showToast(`Category "${newCategory.name}" created successfully!`)
        setShowAddModal(false)
        setNewCategory({
          name: '',
          description: '',
          subcategories: '1',
          machinesCount: '0',
          status: 'Active',
          image: '',
        })
        fetchCategories({ page: 1 })
      } else {
        showToast(response.message || 'Failed to create category')
      }
    } catch (err) {
      console.error('Create category error:', err)
      showToast(err.response?.data?.message || 'Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit Category Click
  const handleEditClick = (category) => {
    setEditingCategory({
      id: category._id || category.id,
      name: category.name || '',
      description: category.description || '',
      subcategories: category.subcategories || 1,
      machinesCount: category.machinesCount || 0,
      status: category.status || 'Active',
      image: category.image || '',
    })
    setShowEditModal(true)
  }

  // Edit Category Submit
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault()
    if (!editingCategory.name) {
      showToast('Please enter category name!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await categoryService.updateCategory(
        editingCategory.id,
        editingCategory
      )

      if (response.success) {
        showToast('Category updated successfully!')
        setShowEditModal(false)
        setEditingCategory(null)
        fetchCategories()
      } else {
        showToast(response.message || 'Failed to update category')
      }
    } catch (err) {
      console.error('Edit category error:', err)
      showToast(err.response?.data?.message || 'Failed to update category')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bulk Status Update
  const handleBulkStatus = async (status, ids) => {
    if (!ids || ids.length === 0) return
    try {
      const response = await categoryService.bulkUpdateStatus(ids, status)
      if (response.success) {
        showToast(`Updated ${ids.length} categories to "${status}"`)
        setSelectedIds([])
        fetchCategories()
      } else {
        showToast(response.message || 'Failed to update categories')
      }
    } catch (err) {
      console.error('Bulk status error:', err)
      showToast(err.response?.data?.message || 'Failed to update categories')
    }
  }

  // Single & Bulk Delete
  const handleDeleteCategoryClick = (category) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      target: category,
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
        const res = await categoryService.deleteCategory(id)
        if (res.success) {
          showToast('Category deleted successfully')
          if (selectedCategory && (selectedCategory._id || selectedCategory.id) === id) {
            setIsDrawerOpen(false)
            setSelectedCategory(null)
          }
          setDeleteModal({ isOpen: false, type: 'single', target: null })
          fetchCategories()
        } else {
          showToast(res.message || 'Failed to delete category')
        }
      } else {
        const ids = deleteModal.target || []
        const res = await categoryService.bulkDelete(ids)
        if (res.success) {
          showToast(`${ids.length} categories deleted successfully`)
          if (
            selectedCategory &&
            ids.includes(selectedCategory._id || selectedCategory.id)
          ) {
            setIsDrawerOpen(false)
            setSelectedCategory(null)
          }
          setSelectedIds([])
          setDeleteModal({ isOpen: false, type: 'bulk', target: null })
          fetchCategories()
        } else {
          showToast(res.message || 'Failed to delete categories')
        }
      }
    } catch (err) {
      console.error('Delete error:', err)
      showToast(err.response?.data?.message || 'Failed to delete category')
    } finally {
      setIsDeleting(false)
    }
  }

  // Export to CSV
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await categoryService.getCategories({ limit: 1000 })
      const exportList = response.data?.categories || categories

      if (!exportList || exportList.length === 0) {
        showToast('No categories available to export')
        return
      }

      const headers = [
        'Category ID',
        'Name',
        'Slug',
        'Description',
        'Subcategories',
        'Machines Count',
        'Status',
        'Created Date',
      ]

      const rows = exportList.map((item) => [
        `"${item._id || item.id || ''}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${item.slug || ''}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${item.subcategories || 1}"`,
        `"${item.machinesCount || 0}"`,
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
        `machine_wallah_categories_${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      showToast(`Exported ${exportList.length} categories to CSV successfully`)
    } catch (err) {
      console.error('Export error:', err)
      showToast('Failed to export categories')
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
            <span className="text-slate-700 font-semibold">Manage Category</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Category
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Add, edit and manage machinery and equipment classifications on MongoDB Atlas.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchCategories()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Categories"
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

          {/* + Add Category Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 1. 4 KPI Metric Cards */}
      <CategoryStatsCards stats={stats} isLoading={isLoading} />

      {/* 2. Filter & Search Controls */}
      <CategoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        isLoading={isLoading}
      />

      {/* 3. Category Data Table */}
      <div className="w-full">
        <CategoryTable
          categories={categories}
          pagination={pagination}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat)
            setIsDrawerOpen(true)
          }}
          onStatusToggle={handleStatusToggle}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteCategoryClick}
          onBulkStatus={handleBulkStatus}
          onBulkDelete={handleBulkDeleteClick}
          onPageChange={(p) => {
            setPagination((prev) => ({ ...prev, page: p }))
            fetchCategories({ page: p })
          }}
          onPerPageChange={(l) => {
            setPagination((prev) => ({ ...prev, limit: l, page: 1 }))
            fetchCategories({ page: 1, limit: l })
          }}
          isLoading={isLoading}
        />
      </div>

      {/* 4. Right-Side Slide-Over Sheet (Category Drawer) */}
      <CategoryDetailDrawer
        isOpen={isDrawerOpen}
        category={selectedCategory}
        onClose={() => setIsDrawerOpen(false)}
        onStatusToggle={handleStatusToggle}
        onEditClick={handleEditClick}
      />

      {/* ─── 5. ADD CATEGORY MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add New Category</h3>
                <p className="text-xs text-slate-500">Create a machinery classification catalog item</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Earthmovers, Cranes, Forklifts"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, description: e.target.value })
                  }
                  placeholder="Brief description of the machinery category..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategories Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCategory.subcategories}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, subcategories: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newCategory.status}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Category Banner / Thumbnail Image"
                value={newCategory.image}
                onChange={(url) => setNewCategory({ ...newCategory, image: url })}
                folder="categories"
                helperText="PNG, JPG, WebP, SVG up to 10MB (Saved locally in backend uploads)"
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
                    <span>Add Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 6. EDIT CATEGORY MODAL ─── */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Category</h3>
                <p className="text-xs text-slate-500">Update classification name and properties</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCategory(null)
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subcategories Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingCategory.subcategories}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        subcategories: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingCategory.status}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Category Banner / Thumbnail Image"
                value={editingCategory.image}
                onChange={(url) => setEditingCategory({ ...editingCategory, image: url })}
                folder="categories"
                helperText="PNG, JPG, WebP, SVG up to 10MB (Saved locally in backend uploads)"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCategory(null)
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
                  ? 'Delete Category?'
                  : `Delete ${deleteModal.target?.length || 0} Categories?`}
              </h3>
              <p className="text-xs text-slate-500">
                {deleteModal.type === 'single'
                  ? `Are you sure you want to delete "${
                      deleteModal.target?.name || 'Category'
                    }"? Equipment classified under this category may become unassigned.`
                  : `Are you sure you want to delete ${
                      deleteModal.target?.length || 0
                    } selected categories? This action cannot be undone.`}
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
