import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, X, ChevronRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { FeaturedStatsCards } from '../../components/featured/FeaturedStatsCards'
import { FeaturedFilters } from '../../components/featured/FeaturedFilters'
import { FeaturedTable } from '../../components/featured/FeaturedTable'
import { ListingDetailDrawer } from '../../components/listings/ListingDetailDrawer'
import { Toast } from '../../components/common/Toast'
import { listingService } from '../../services/listingService'
import { categoryService } from '../../services/categoryService'

export default function ManageFeaturedListingsPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    totalViews: 0,
  })

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [promotionTypeFilter, setPromotionTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateRange, setDateRange] = useState('')

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false)
  const [availableListings, setAvailableListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [saving, setSaving] = useState(false)

  // New Promotion Form
  const [promoForm, setPromoForm] = useState({
    listingId: '',
    promotionType: 'Featured',
    durationDays: 15,
  })

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch categories from Atlas
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 100 })
        const catList = res?.data?.categories || res?.data || []
        const names = catList.map((c) => c.name || c.title).filter(Boolean)
        setCategories(names)
      } catch (err) {
        console.error('Failed to load categories for featured listings:', err)
      }
    }
    fetchCats()
  }, [])

  // Fetch promoted listings from Atlas
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (promotionTypeFilter !== 'All') params.promotionType = promotionTypeFilter
      if (statusFilter !== 'All') params.promotionStatus = statusFilter

      const res = await listingService.getPromotedListings(params)
      const data = res?.data || {}
      let items = data.promotions || []

      if (categoryFilter !== 'All') {
        items = items.filter((p) => p.category === categoryFilter)
      }

      setPromotions(items)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load promoted listings:', err)
      showToast('Failed to load promoted listings')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, promotionTypeFilter, statusFilter, categoryFilter])

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  // Fetch candidate listings when Add Promotion modal opens
  const handleOpenAddModal = async () => {
    setShowAddModal(true)
    try {
      const res = await listingService.getListings({ limit: 100 })
      const all = res?.data?.listings || []
      setAvailableListings(all)
      if (all.length > 0) {
        setPromoForm((prev) => ({ ...prev, listingId: all[0]._id || all[0].id }))
      }
    } catch (err) {
      console.error('Failed to load listings for promotion:', err)
    }
  }

  // Submit Promotion
  const handleAddPromotionSubmit = async (e) => {
    e.preventDefault()
    if (!promoForm.listingId) {
      showToast('Please select a machinery listing')
      return
    }

    try {
      setSaving(true)
      await listingService.addPromotion(promoForm)
      showToast('Promotion campaign activated successfully!')
      setShowAddModal(false)
      fetchPromotions()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to activate promotion')
    } finally {
      setSaving(false)
    }
  }

  // Toggle Promotion Status
  const handleStatusChange = async (id) => {
    try {
      await listingService.togglePromotionStatus(id)
      showToast('Promotion status toggled')
      fetchPromotions()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to toggle status')
    }
  }

  // Remove Promotion
  const handleRemovePromotion = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the promotion for "${title || 'this machine'}"?`)) {
      return
    }
    try {
      await listingService.removePromotion(id)
      showToast(`Promotion cancelled for "${title}"`)
      fetchPromotions()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to remove promotion')
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setPromotionTypeFilter('All')
    setStatusFilter('All')
    setCategoryFilter('All')
    setDateRange('')
    fetchPromotions()
    showToast('Filters reset.')
  }

  const handleApplyFilters = () => {
    fetchPromotions()
    showToast(`Filtered promoted campaigns`)
  }

  return (
    <div className="space-y-5">
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
            <Link to="/listings" className="hover:text-slate-700 transition-colors">
              Listings
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Promoted Listings</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Promoted Listings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Boost top equipment visibility with Featured, Spotlight, and Top Listing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchPromotions()}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Promotion</span>
          </button>
        </div>
      </div>

      {/* 1. Dynamic KPI Metric Cards */}
      <FeaturedStatsCards stats={stats} />

      {/* 2. Filter Toolbar */}
      <FeaturedFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        promotionTypeFilter={promotionTypeFilter}
        onPromotionTypeChange={setPromotionTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateRange={dateRange}
        onDateRangeClick={() => showToast('Date range picker toggled')}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        categories={categories}
      />

      {/* 3. Featured Listings Data Table */}
      <FeaturedTable
        promotions={promotions}
        loading={loading}
        onViewDetails={(item) => setSelectedListing(item)}
        onStatusChange={handleStatusChange}
        onRemovePromotion={handleRemovePromotion}
      />

      {/* 4. Sliding Details Drawer */}
      {selectedListing && (
        <ListingDetailDrawer
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStatusToggle={handleStatusChange}
        />
      )}

      {/* 5. ADD PROMOTION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-base font-bold text-slate-900">Activate Machinery Promotion</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPromotionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Machine Listing *
                </label>
                <select
                  value={promoForm.listingId}
                  onChange={(e) => setPromoForm({ ...promoForm, listingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer focus:border-[#F5A623] outline-none"
                >
                  {availableListings.map((l) => (
                    <option key={l._id || l.id} value={l._id || l.id}>
                      {l.title} ({l.listingCode || 'MH-ID'}) — {l.category} (Owner: {l.ownerName || l.owner})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Promotion Badge Type *
                </label>
                <select
                  value={promoForm.promotionType}
                  onChange={(e) => setPromoForm({ ...promoForm, promotionType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer focus:border-[#F5A623] outline-none"
                >
                  <option value="Featured">Featured (Homepage carousel & banner)</option>
                  <option value="Spotlight">Spotlight (Golden glow & pinned top)</option>
                  <option value="Top Listing">Top Listing (Priority search sorting)</option>
                  <option value="Promoted">Promoted (Badge & highlighted tag)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Campaign Duration *
                </label>
                <select
                  value={promoForm.durationDays}
                  onChange={(e) => setPromoForm({ ...promoForm, durationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer focus:border-[#F5A623] outline-none"
                >
                  <option value={7}>7 Days (1 Week Campaign)</option>
                  <option value={15}>15 Days (Half Month Campaign)</option>
                  <option value={30}>30 Days (Full Month Campaign)</option>
                  <option value={90}>90 Days (Quarterly Campaign)</option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 text-amber-900 leading-relaxed">
                <span className="font-bold">Campaign Details:</span> This machine will receive high priority ranking across search, categories, and homepage recommendation carousels.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-[#F5A623] hover:bg-[#EAA020] rounded-lg shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving && <div className="animate-spin w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />}
                  <span>Activate Promotion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
