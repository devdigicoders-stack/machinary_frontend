import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, X, AlertTriangle, CheckCircle, XCircle, RefreshCw, Trash2, ShieldCheck } from 'lucide-react'
import { ReportedStatsCards } from '../../components/reported/ReportedStatsCards'
import { ReportedFilters } from '../../components/reported/ReportedFilters'
import { ReportedTable } from '../../components/reported/ReportedTable'
import { Toast } from '../../components/common/Toast'
import { listingService } from '../../services/listingService'
import { categoryService } from '../../services/categoryService'
import { getImageUrl } from '../../utils/imageUtils'

export default function ManageReportedListingsPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highSeverity: 0,
  })

  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState(null)
  const [resolutionAction, setResolutionAction] = useState('Kept Active')
  const [resolutionNote, setResolutionNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // Filters State
  const [searchTerm, setSearchTerm] = useState('')
  const [reasonFilter, setReasonFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateRange, setDateRange] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Load Categories dynamically from Atlas
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 100 })
        const catList = res?.data?.categories || res?.data || []
        const names = catList.map((c) => c.name || c.title).filter(Boolean)
        setCategories(names)
      } catch (err) {
        console.error('Failed to load categories for reported listings:', err)
      }
    }
    fetchCats()
  }, [])

  // Fetch reported listings from MongoDB Atlas
  const fetchReported = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (reasonFilter !== 'All') params.reason = reasonFilter
      if (statusFilter !== 'All') params.status = statusFilter

      const res = await listingService.getReportedListings(params)
      const data = res?.data || {}
      let items = data.reports || []

      if (categoryFilter !== 'All') {
        items = items.filter((r) => r.category === categoryFilter)
      }

      setReports(items)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load reported listings:', err)
      showToast('Failed to load reported listings from server')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, reasonFilter, statusFilter, categoryFilter])

  useEffect(() => {
    fetchReported()
  }, [fetchReported])

  // Resolve Report
  const handleResolveReport = async (listingId, action = 'Kept Active') => {
    try {
      setProcessing(true)
      await listingService.resolveReport(listingId, {
        actionTaken: action,
        note: resolutionNote,
      })
      showToast(`Report resolved with action: ${action}`)
      setSelectedReport(null)
      fetchReported()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to resolve report')
    } finally {
      setProcessing(false)
    }
  }

  // Dismiss Report
  const handleDismissReport = async (listingId) => {
    try {
      setProcessing(true)
      await listingService.dismissReport(listingId)
      showToast('Report dismissed as false flag')
      setSelectedReport(null)
      fetchReported()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to dismiss report')
    } finally {
      setProcessing(false)
    }
  }

  // Delist Listing
  const handleDelistListing = async (listingId, title) => {
    if (!window.confirm(`Are you sure you want to delist "${title || 'this machine'}" due to violations?`)) {
      return
    }
    try {
      setProcessing(true)
      await listingService.delistReportedListing(listingId)
      showToast(`Listing "${title}" delisted and deactivated`)
      setSelectedReport(null)
      fetchReported()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delist listing')
    } finally {
      setProcessing(false)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setReasonFilter('All')
    setStatusFilter('All')
    setCategoryFilter('All')
    setDateRange('')
    fetchReported()
    showToast('Filters reset.')
  }

  const handleApplyFilters = () => {
    fetchReported()
    showToast(`Filtering active reports...`)
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
            <Link to="/listings" className="hover:text-slate-700 transition-colors">
              Listings
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-semibold">Reported Listings</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            Manage Reported Listings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            Investigate customer violation reports, resolve dispute tickets, and enforce marketplace trust.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchReported()}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Dynamic KPI Metric Cards */}
      <ReportedStatsCards stats={stats} />

      {/* 2. Filter Toolbar */}
      <ReportedFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        reasonFilter={reasonFilter}
        onReasonChange={setReasonFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        dateRange={dateRange}
        onDateRangeClick={() => showToast('Date range filter picker')}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        categories={categories}
      />

      {/* 3. Reported Listings Data Table */}
      <ReportedTable
        reports={reports}
        loading={loading}
        onSelectReport={(report) => setSelectedReport(report)}
        onResolveReport={(id) => handleResolveReport(id, 'Kept Active')}
        onDismissReport={(id) => handleDismissReport(id)}
        onDelistListing={(id, title) => handleDelistListing(id, title)}
      />

      {/* --- REPORT DETAILS MODAL --- */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">Inspect Reported Listing</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Listing Details Card */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center">
                {selectedReport.image ? (
                  <img
                    src={getImageUrl(selectedReport.image)}
                    alt={selectedReport.listingTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '🚜'
                    }}
                  />
                ) : (
                  <span className="text-xl">🚜</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {selectedReport.listingTitle}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedReport.listingCode} • {selectedReport.category} • For {selectedReport.type}
                </p>
                <p className="text-[11px] text-amber-700 font-bold">
                  ₹ {selectedReport.rateOrPrice} {selectedReport.rateUnit ? `/ ${selectedReport.rateUnit}` : ''}
                </p>
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${
                    selectedReport.status === 'Resolved'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : selectedReport.status === 'Pending'
                      ? 'bg-[#FEF3C7] text-[#D97706]'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selectedReport.status}
                </span>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="space-y-2 text-xs bg-slate-50/50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Reported By:</span>
                <span className="font-bold text-slate-900">
                  {selectedReport.reporterName} ({selectedReport.reporterEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Owner Contact:</span>
                <span className="font-bold text-slate-900">
                  {selectedReport.ownerName} ({selectedReport.ownerPhone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Reason:</span>
                <span className="font-bold text-rose-600">
                  {selectedReport.reason}
                </span>
              </div>
            </div>

            {/* Reporter Explanation */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Reporter Explanation / Violation Notes:
              </span>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedReport.description || 'No additional comment provided by reporter.'}
              </div>
            </div>

            {/* Moderation Resolution Controls */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Choose Resolution Action:
                </label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer focus:border-[#F5A623] outline-none"
                >
                  <option value="Kept Active">Mark Safe & Keep Active</option>
                  <option value="Warning Sent">Send Official Warning to Owner</option>
                  <option value="Listing Delisted">Delist / Remove Machine from Marketplace</option>
                  <option value="Price Corrected">Pricing Updated & Clarified</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Optional internal resolution note..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#F5A623]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDismissReport(selectedReport.listingId || selectedReport._id)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Dismiss False Flag</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleResolveReport(selectedReport.listingId || selectedReport._id, resolutionAction)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {processing && <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />}
                <CheckCircle className="w-4 h-4" />
                <span>Resolve Report ({resolutionAction})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
