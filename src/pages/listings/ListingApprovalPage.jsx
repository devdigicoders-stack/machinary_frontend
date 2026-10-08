import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  AlertTriangle,
  Check,
  X,
  ShieldCheck,
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Toast } from '../../components/common/Toast'
import { listingService } from '../../services/listingService'
import { categoryService } from '../../services/categoryService'
import { getImageUrl } from '../../utils/imageUtils'

export default function ListingApprovalPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [categories, setCategories] = useState([])

  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalReviewed: 0,
  })

  // Modals state
  const [selectedListing, setSelectedListing] = useState(null)
  const [rejectionModalListing, setRejectionModalListing] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('Invalid RC Document')
  const [rejectionNote, setRejectionNote] = useState('')
  const [processing, setProcessing] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Load Categories from Atlas
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getCategories({ limit: 100 })
        const catList = res?.data?.categories || res?.data || []
        const names = catList.map((c) => c.name || c.title).filter(Boolean)
        setCategories(names)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    fetchCats()
  }, [])

  // Fetch approvals queue
  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        status: activeTab,
      }
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (categoryFilter !== 'All') params.category = categoryFilter
      if (typeFilter !== 'All') params.type = typeFilter

      const res = await listingService.getPendingApprovals(params)
      const data = res?.data || {}
      setListings(data.listings || [])
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to load approval listings:', err)
      showToast('Failed to load approvals queue')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm, categoryFilter, typeFilter])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  // Approve action
  const handleApprove = async (id, title) => {
    try {
      setProcessing(true)
      await listingService.approveListing(id)
      showToast(`Listing "${title || 'Machine'}" approved successfully and published!`)
      if (selectedListing && (selectedListing._id === id || selectedListing.id === id)) {
        setSelectedListing(null)
      }
      fetchApprovals()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to approve listing')
    } finally {
      setProcessing(false)
    }
  }

  // Reject action
  const handleRejectConfirm = async () => {
    if (!rejectionModalListing) return
    try {
      setProcessing(true)
      const id = rejectionModalListing._id || rejectionModalListing.id
      await listingService.rejectListing(id, {
        reason: rejectionReason,
        note: rejectionNote,
      })
      showToast(`Listing "${rejectionModalListing.title}" rejected. Owner notified.`)
      setRejectionModalListing(null)
      setRejectionNote('')
      if (selectedListing && (selectedListing._id === id || selectedListing.id === id)) {
        setSelectedListing(null)
      }
      fetchApprovals()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to reject listing')
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = (listing) => {
    let rawPrice = (listing.rateOrPrice || listing.price || '0').toString().trim()
    rawPrice = rawPrice.replace(/^₹\s*/, '')
    const formatted = `₹ ${rawPrice}`

    if (listing.type === 'Sale') {
      return formatted
    }

    if (!listing.rateUnit) {
      return `${formatted} / day`
    }

    const unit = listing.rateUnit.toLowerCase().trim()
    if (unit === 'lump sum' || unit === 'one-time' || unit === 'full payment') {
      return formatted
    }
    const cleanUnit = unit.startsWith('per ') ? unit.slice(4).trim() : unit
    return `${formatted} / ${cleanUnit}`
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    return [loc.city, loc.state].filter(Boolean).join(', ') || 'India'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link to="/dashboard" className="hover:text-slate-800 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/listings" className="hover:text-slate-800 transition-colors">
              Listings
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Approval & Moderation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#F5A623]" />
            Listing Approval &amp; Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review machinery submissions, verify registration documents, and approve or reject listings in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchApprovals()}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            {stats.pending} Awaiting Review
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Approvals */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting verification</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5A623]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Approved Listings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Active</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Live on marketplace</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Rejected Listings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected / Returned</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats.rejected}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sent back with reasons</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Total Moderated */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviewed</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalReviewed}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">⚡ 100% verified on Atlas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
        {/* Top bar: Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'Pending' && `Pending (${stats.pending})`}
                {tab === 'Approved' && `Approved (${stats.approved})`}
                {tab === 'Rejected' && `Rejected (${stats.rejected})`}
                {tab === 'All' && `All`}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{listings.length}</strong> listings in queue
          </div>
        </div>

        {/* Bottom bar: Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by machine title, code, owner, RC number, location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-xl text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Type Dropdown */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Rent">For Rent</option>
              <option value="Sale">For Sale</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs sm:text-[13px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[280px]">Machine &amp; Details</th>
                <th className="py-3.5 px-4 min-w-[140px]">Listing Type</th>
                <th className="py-3.5 px-4 min-w-[180px]">Owner &amp; Location</th>
                <th className="py-3.5 px-4 min-w-[160px]">RC &amp; Verification</th>
                <th className="py-3.5 px-4 min-w-[130px]">Submitted</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Status</th>
                <th className="py-3.5 px-4 text-right min-w-[150px]">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2" />
                    <div className="text-xs font-semibold">Loading approval queue from database...</div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-slate-700">No listings found in queue</div>
                    <p className="text-xs text-slate-400 mt-0.5">All submissions in this tab are clear</p>
                  </td>
                </tr>
              ) : (
                listings.map((listing) => {
                  const rowId = listing._id || listing.id
                  const imgUrl = getImageUrl(listing.image || (listing.images && listing.images[0]))

                  return (
                    <tr key={rowId} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      {/* Machine Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center p-0.5">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={listing.title}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.parentElement.innerHTML = '🚜'
                                }}
                              />
                            ) : (
                              <span className="text-lg">🚜</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="font-bold text-slate-900 block truncate hover:text-[#F5A623] cursor-pointer"
                              onClick={() => setSelectedListing(listing)}
                            >
                              {listing.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              {listing.listingCode && (
                                <span className="font-mono font-bold text-amber-700">
                                  {listing.listingCode}
                                </span>
                              )}
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{listing.category}</span>
                              <span>•</span>
                              <span>{listing.modelYear || '2023'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Listing Type & Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{formatPrice(listing)}</span>
                          <span
                            className={`inline-block mt-0.5 w-max px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              listing.type === 'Rent'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            For {listing.type}
                          </span>
                        </div>
                      </td>

                      {/* Owner & Location */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {listing.ownerName}
                            <span className="text-[9.5px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-bold">
                              {listing.ownerKyc || 'KYC'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{formatLocation(listing.location)}</span>
                          </div>
                        </div>
                      </td>

                      {/* RC & Verification Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-slate-800 block">
                            {listing.rcNumber || 'Pending Doc'}
                          </span>
                          <span
                            className={`text-[10.5px] font-semibold flex items-center gap-1 ${
                              (listing.docStatus || '').includes('Clear') ||
                              (listing.docStatus || '').includes('Verified')
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {(listing.docStatus || '').includes('Clear') ||
                            (listing.docStatus || '').includes('Verified') ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {listing.docStatus || 'Uploaded'}
                          </span>
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDate(listing.createdAt)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            listing.approvalStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : listing.approvalStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {listing.approvalStatus === 'Pending' && <Clock className="w-3 h-3" />}
                          {listing.approvalStatus === 'Approved' && <CheckCircle className="w-3 h-3" />}
                          {listing.approvalStatus === 'Rejected' && <XCircle className="w-3 h-3" />}
                          {listing.approvalStatus}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Full Page View Button */}
                          <Link
                            to={`/listings/${rowId}`}
                            title="Open Full Listing Page"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-xs font-bold border border-slate-200 shadow-2xs"
                          >
                            <Eye className="w-4 h-4 text-[#F5A623]" />
                            <span>View</span>
                          </Link>

                          {listing.approvalStatus === 'Pending' && (
                            <>
                              {/* Approve Button */}
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() => handleApprove(rowId, listing.title)}
                                title="Approve Listing"
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Approve</span>
                              </button>

                              {/* Reject Button */}
                              <button
                                type="button"
                                disabled={processing}
                                onClick={() => setRejectionModalListing(listing)}
                                title="Reject with Reason"
                                className="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                              >
                                <X className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {listing.approvalStatus === 'Rejected' && (
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => handleApprove(rowId, listing.title)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REJECTION MODAL --- */}
      {rejectionModalListing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Reject Listing Submission</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectionModalListing(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Rejecting <strong>{rejectionModalListing.title}</strong> submitted by{' '}
              <strong>{rejectionModalListing.ownerName}</strong>.
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#F5A623] cursor-pointer"
              >
                <option value="Invalid RC Document">Invalid RC or Missing Registration Copy</option>
                <option value="Poor Quality / Fake Images">Poor Quality or Downloaded Stock Images</option>
                <option value="Unrealistic or Misleading Price">Unrealistic or Inaccurate Pricing</option>
                <option value="Duplicate Listing Detected">Duplicate Machine Listing</option>
                <option value="Mismatched Owner Name">Owner Name Mismatches Registration Details</option>
                <option value="Incomplete Specifications">Incomplete Technical Specifications</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Admin Note to Owner (Optional)
              </label>
              <textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Explain clearly what the owner needs to fix to re-submit..."
                rows="3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#F5A623]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalListing(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleRejectConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {processing && <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FULL INSPECTION MODAL / DRAWER --- */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Inspection &amp; Verification
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedListing.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo & Specs Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs flex items-center justify-center">
                {selectedListing.image ? (
                  <img
                    src={getImageUrl(selectedListing.image)}
                    alt={selectedListing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<span class="text-4xl">🚜</span>'
                    }}
                  />
                ) : (
                  <span className="text-4xl">🚜</span>
                )}
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-bold text-slate-900">{selectedListing.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model Year:</span>
                    <span className="font-bold text-slate-900">{selectedListing.modelYear || '2023'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hours / Usage:</span>
                    <span className="font-bold text-slate-900">{selectedListing.hoursUsed || '0 hrs'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Listing Type:</span>
                    <span className="font-bold text-slate-900">For {selectedListing.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Price / Rate:</span>
                    <span className="font-bold text-[#F5A623]">{formatPrice(selectedListing)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multiple Photos Gallery */}
            {selectedListing.images && selectedListing.images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Machine Photos ({selectedListing.images.length})
                  </h4>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedListing.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={getImageUrl(img)}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 block"
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<span class="flex items-center justify-center h-full text-xs text-slate-400 font-bold">Image</span>'
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        View
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Checklist Card */}
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                Verification Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>RC Number: <strong>{selectedListing.rcNumber || 'Not Provided'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Owner KYC: <strong>{selectedListing.ownerKyc || 'Verified'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Insurance Valid: <strong>{selectedListing.insuranceValidTill || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Docs: <strong>{selectedListing.docStatus || 'Uploaded & Clear'}</strong></span>
                </div>
              </div>
            </div>

            {/* Uploaded Verification Documents Viewer */}
            {selectedListing.documents && Object.keys(selectedListing.documents).length > 0 && (
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Uploaded Verification Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(selectedListing.documents).map(([docKey, docVal]) => {
                    if (!docVal) return null
                    const docLabels = {
                      rc: 'RC (Registration Certificate)',
                      insurance: 'Insurance Certificate',
                      fitness: 'Fitness Certificate',
                      serviceRecord: 'Service Records',
                      permit: 'Transport Permit',
                      puc: 'PUC Certificate',
                      gst: 'GST Registration',
                      testReport: 'Lab Test Report',
                      quarryPermit: 'Mining / Quarry License',
                      weighbridge: 'Weighbridge Calibration',
                    }
                    const label = docLabels[docKey] || docKey.toUpperCase()
                    return (
                      <div
                        key={docKey}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-sm font-bold shrink-0">
                            📄
                          </span>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 block truncate">{label}</span>
                            <span className="text-[11px] text-emerald-600 font-medium">Uploaded by owner</span>
                          </div>
                        </div>
                        <a
                          href={getImageUrl(docVal)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Machine Notes / Description
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {selectedListing.description || selectedListing.subtitle || 'No remarks provided.'}
              </p>
            </div>

            {/* Owner Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Listed By:</span>
                <span className="font-bold text-slate-900">{selectedListing.ownerName}</span>
                <span className="text-slate-500 ml-2">({selectedListing.ownerPhone})</span>
              </div>
              <span className="text-slate-500">{formatLocation(selectedListing.location)}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-mono text-slate-400">
                {selectedListing.listingCode || selectedListing._id}
              </span>
              <div className="flex items-center gap-2">
                {selectedListing.approvalStatus === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionModalListing(selectedListing)
                        setSelectedListing(null)
                      }}
                      className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Reject Submission
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleApprove(selectedListing._id || selectedListing.id, selectedListing.title)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-60"
                    >
                      Approve &amp; Publish
                    </button>
                  </>
                )}
                {selectedListing.approvalStatus !== 'Pending' && (
                  <button
                    type="button"
                    onClick={() => setSelectedListing(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
