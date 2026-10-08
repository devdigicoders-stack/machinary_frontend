import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, X, FileText, RefreshCw, Edit3, Globe } from 'lucide-react'
import { ContentStatsCards } from '../../components/content/ContentStatsCards'
import { ContentFilters } from '../../components/content/ContentFilters'
import { ContentTable } from '../../components/content/ContentTable'
import { Toast } from '../../components/common/Toast'
import { contentService } from '../../services/contentService'

export default function ManageWebsiteContentPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [stats, setStats] = useState({
    total: 10,
    published: 7,
    drafts: 2,
    underReview: 1,
  })

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 10,
    pagesCount: 1,
  })

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [viewingPage, setViewingPage] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [pageTypeFilter, setPageTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('Recently Updated')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    slug: '',
    pageType: 'Static',
    status: 'Draft',
    content: '',
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch Pages and Stats from Atlas
  const fetchContent = useCallback(async (overrides = {}) => {
    try {
      setLoading(true)
      const currentTab = overrides.activeTab !== undefined ? overrides.activeTab : activeTab
      const currentSearch = overrides.searchTerm !== undefined ? overrides.searchTerm : searchTerm
      const currentType = overrides.pageTypeFilter !== undefined ? overrides.pageTypeFilter : pageTypeFilter
      const currentStatus = overrides.statusFilter !== undefined ? overrides.statusFilter : statusFilter
      const currentPage = overrides.page || pagination.page
      const currentLimit = overrides.limit || pagination.limit

      const params = {
        page: currentPage,
        limit: currentLimit,
        sortBy,
      }

      if (currentSearch.trim()) params.search = currentSearch.trim()
      if (currentType !== 'All') params.pageType = currentType
      if (currentStatus !== 'All') params.status = currentStatus

      if (currentTab === 'published') params.status = 'Published'
      else if (currentTab === 'draft') params.status = 'Draft'
      else if (currentTab === 'review') params.status = 'Under Review'

      const [pagesRes, statsRes] = await Promise.allSettled([
        contentService.getPages(params),
        contentService.getStats(),
      ])

      if (pagesRes.status === 'fulfilled' && pagesRes.value?.data) {
        const data = pagesRes.value.data
        setPages(data.pages || [])
        setPagination({
          page: data.page || 1,
          limit: currentLimit,
          total: data.total || 0,
          pagesCount: data.pagesCount || 1,
        })
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load CMS pages:', err)
      showToast('Error loading CMS pages from server')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm, pageTypeFilter, statusFilter, sortBy, pagination.page, pagination.limit])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Filter Handlers
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    fetchContent({ activeTab: tabId, page: 1 })
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setPageTypeFilter('All')
    setStatusFilter('All')
    setSortBy('Recently Updated')
    setActiveTab('all')
    fetchContent({
      searchTerm: '',
      pageTypeFilter: 'All',
      statusFilter: 'All',
      activeTab: 'all',
      page: 1,
    })
    showToast('Filters reset.')
  }

  const handleApplyFilters = () => {
    fetchContent({ page: 1 })
    showToast('Applied filters')
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (pages.length === 0) {
      showToast('No pages available to export')
      return
    }
    const headers = ['Title', 'Slug', 'Page Type', 'Status', 'Updated Date', 'Author']
    const rows = pages.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      p.slug,
      p.pageType,
      p.status,
      p.updatedDate,
      p.authorName,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `machinery_cms_pages_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported CMS pages to CSV')
  }

  // Create Page Submit
  const handleCreatePageSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.slug) {
      showToast('Please provide a page title and URL slug')
      return
    }
    try {
      await contentService.createPage(formData)
      showToast(`Page "${formData.title}" created successfully!`)
      setShowAddModal(false)
      setFormData({
        title: '',
        subtitle: '',
        slug: '',
        pageType: 'Static',
        status: 'Draft',
        content: '',
      })
      fetchContent({ page: 1 })
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create page')
    }
  }

  // Edit Page Submit
  const handleEditPageSubmit = async (e) => {
    e.preventDefault()
    if (!editingPage) return
    try {
      await contentService.updatePage(editingPage._id || editingPage.id, editingPage)
      showToast(`Page "${editingPage.title}" updated successfully!`)
      setEditingPage(null)
      fetchContent()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update page')
    }
  }

  // Status Toggle
  const handleStatusChange = async (id) => {
    try {
      await contentService.toggleStatus(id)
      showToast('Page status updated successfully')
      fetchContent()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to toggle page status')
    }
  }

  // Action Click (View, Edit, Delete)
  const handleActionClick = async (pageItem, action) => {
    if (action === 'view') {
      setViewingPage(pageItem)
    } else if (action === 'edit') {
      setEditingPage({ ...pageItem })
    } else if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to permanently delete page "${pageItem.title}"?`)) {
        return
      }
      try {
        await contentService.deletePage(pageItem._id || pageItem.id)
        showToast(`Page "${pageItem.title}" deleted`)
        fetchContent()
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to delete page')
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Website Content</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Website Content
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Create, edit and manage static, legal, and informative pages published on Machine Wallah.
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchContent()}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Refresh Content"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      {/* 1. 4 Metric KPI Cards */}
      <ContentStatsCards stats={stats} />

      {/* 2. Filter Toolbar with Pills, Search & Dropdowns */}
      <ContentFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageTypeFilter={pageTypeFilter}
        onPageTypeChange={setPageTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        lastUpdatedFilter=""
        onLastUpdatedClick={() => showToast('Date range filter picker')}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        onExport={handleExportCSV}
      />

      {/* 3. CMS Pages Table */}
      <ContentTable
        pages={pages}
        loading={loading}
        totalCount={pagination.total}
        currentPage={pagination.page}
        totalPages={pagination.pagesCount}
        limit={pagination.limit}
        onPageChange={(page) => fetchContent({ page })}
        onLimitChange={(limit) => fetchContent({ page: 1, limit })}
        onActionClick={handleActionClick}
        onStatusChange={handleStatusChange}
      />

      {/* --- ADD PAGE MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#F5A623]" />
                <span>Create New Website Page</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value
                    const slug = `/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
                    setFormData({ ...formData, title, slug: formData.slug ? formData.slug : slug })
                  }}
                  placeholder="e.g. Equipment Safety Guidelines"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subtitle / Summary
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Brief description of the page content"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="/safety-guidelines"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Page Type
                  </label>
                  <select
                    value={formData.pageType}
                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-[#F5A623] outline-none cursor-pointer"
                  >
                    <option value="Static">Static Page</option>
                    <option value="Legal">Legal / Policy</option>
                    <option value="Dynamic">Dynamic Blog/News</option>
                    <option value="Landing">Campaign Landing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-[#F5A623] outline-none cursor-pointer"
                >
                  <option value="Draft">Save as Draft</option>
                  <option value="Published">Publish Immediately</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Page Content
                </label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter full page body content or markdown text..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Publish Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PAGE MODAL --- */}
      {editingPage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Edit Page: {editingPage.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditPageSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={editingPage.subtitle || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPage.slug || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:border-[#F5A623] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingPage.status || 'Published'}
                    onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-[#F5A623] outline-none cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Content Body
                </label>
                <textarea
                  rows={4}
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-[#F5A623] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW PAGE MODAL --- */}
      {viewingPage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{viewingPage.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">URL Slug</span>
                  <span className="font-mono font-bold text-slate-800">{viewingPage.slug}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Page Type</span>
                  <span className="font-bold text-slate-800">{viewingPage.pageType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-bold text-emerald-600">{viewingPage.status}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Page Body Content:</span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                  {viewingPage.content || viewingPage.subtitle || 'No detailed content provided yet.'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingPage(viewingPage)
                  setViewingPage(null)
                }}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-xs cursor-pointer"
              >
                Edit Page
              </button>
              <button
                type="button"
                onClick={() => setViewingPage(null)}
                className="px-4 py-2 bg-[#F5A623] text-slate-950 font-bold rounded-lg text-xs cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
