import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck,
  Search,
  Plus,
  MapPin,
  CheckCircle,
  Clock,
  Tag,
  Repeat,
  Eye,
  Trash2,
  Edit2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Toast } from '../../components/common/Toast'
import { ListingDetailDrawer } from '../../components/listings/ListingDetailDrawer'
import { ListingFormModal } from '../../components/listings/ListingFormModal'
import { listingService } from '../../services/listingService'
import { categoryService } from '../../services/categoryService'
import { getImageUrl } from '../../utils/imageUtils'

export default function ManageBuyRentListingPage() {
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    rent: 0,
    sale: 0,
    available: 0,
  })

  // Filters
  const [activeTab, setActiveTab] = useState('All') // 'All' | 'Rent' | 'Sale'
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [availabilityFilter, setAvailabilityFilter] = useState('All')

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [selectedListing, setSelectedListing] = useState(null)

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

  // Fetch listings for Buy/Rent
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        limit: 100,
      }
      if (activeTab !== 'All') params.type = activeTab
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (categoryFilter !== 'All') params.category = categoryFilter
      if (availabilityFilter !== 'All') params.availability = availabilityFilter

      const res = await listingService.getListings(params)
      const data = res?.data || {}
      const items = data.listings || []
      setListings(items)

      // Calculate aggregated metrics
      const rentCount = data.stats?.rent ?? items.filter((l) => l.type === 'Rent').length
      const saleCount = data.stats?.sale ?? items.filter((l) => l.type === 'Sale').length
      const availCount = items.filter((l) => (l.availability || '').includes('Available')).length

      setStats({
        total: data.stats?.total ?? items.length,
        rent: rentCount,
        sale: saleCount,
        available: availCount,
      })
    } catch (err) {
      console.error('Failed to load buy/rent listings:', err)
      showToast('Failed to load buy/rent listings from server')
    } finally {
      setLoading(false)
    }
  }, [activeTab, searchTerm, categoryFilter, availabilityFilter])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleDelete = async (id, title) => {
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
      showToast(err?.response?.data?.message || 'Failed to delete listing')
    }
  }

  const handleSaveListing = async (payload, id) => {
    if (id) {
      await listingService.updateListing(id, payload)
      showToast(`Listing "${payload.title}" updated successfully`)
    } else {
      await listingService.createListing(payload)
      showToast(`Listing "${payload.title}" published successfully!`)
    }
    setEditingListing(null)
    fetchListings()
  }

  // Clean Price Formatter (No duplicate ₹, no "/ per day", no "/ lump sum")
  const formatPrice = (item) => {
    let rawPrice = (item.rateOrPrice || item.price || '0').toString().trim()
    rawPrice = rawPrice.replace(/^₹\s*/, '')
    const formatted = `₹ ${rawPrice}`

    if (item.type === 'Sale') {
      return formatted
    }

    if (!item.rateUnit) {
      return `${formatted} / day`
    }

    const unit = item.rateUnit.toLowerCase().trim()
    if (unit === 'lump sum' || unit === 'one-time' || unit === 'full payment') {
      return formatted
    }
    const cleanUnit = unit.startsWith('per ') ? unit.slice(4).trim() : unit
    return `${formatted} / ${cleanUnit}`
  }

  // Clean Deposit Formatter (Keeps currency and number unified)
  const formatDeposit = (item) => {
    if (item.type === 'Sale') return 'N/A'
    const raw = (item.securityDeposit || 'N/A').toString().trim()
    if (raw === 'N/A' || raw.toLowerCase() === 'none' || raw === '0') {
      return 'N/A'
    }
    if (raw.startsWith('₹')) return raw
    return `₹ ${raw}`
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    const parts = [loc.city, loc.state].filter(Boolean)
    return parts.join(', ') || 'India'
  }

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
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
            <span className="text-slate-900 font-semibold">Buy / Rent Listings</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Repeat className="w-6 h-6 text-[#F5A623]" />
            Manage Buy &amp; Rent Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor equipment rental rates, sale pricing, security deposits, and immediate availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchListings()}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingListing(null)
              setShowAddModal(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-[#F5A623]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Buy/Rent Listing</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Machinery</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all models</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">For Rent</span>
            <div className="text-2xl font-black text-sky-600 mt-1">{stats.rent}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Daily / monthly rentals</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">For Sale</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.sale}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct purchase</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5A623]">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Now</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.available}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Ready for deployment</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['All', 'Rent', 'Sale'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'All' ? `All Listings (${stats.total})` : tab === 'Rent' ? `For Rent (${stats.rent})` : `For Sale (${stats.sale})`}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{listings.length}</strong> items
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search machine, model, vendor, location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#F5A623] rounded-xl text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category */}
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

            {/* Availability */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#F5A623] cursor-pointer"
            >
              <option value="All">All Availability</option>
              <option value="Available Now">Available Now</option>
              <option value="On Rent">On Rent</option>
              <option value="Sold">Sold</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean, Non-wrapping Structured Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs sm:text-[13px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[280px]">Machine &amp; Category</th>
                <th className="py-3.5 px-4 text-center w-24">Mode</th>
                <th className="py-3.5 px-4 min-w-[150px]">Rate / Price</th>
                <th className="py-3.5 px-4 min-w-[170px]">Deposit / Min. Term</th>
                <th className="py-3.5 px-4 min-w-[180px]">Owner / Location</th>
                <th className="py-3.5 px-4 text-center min-w-[150px]">Availability</th>
                <th className="py-3.5 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full mb-2" />
                    <div className="text-xs font-semibold">Loading listings from database...</div>
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <div className="font-bold text-slate-700">No matching machinery found</div>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                listings.map((item) => {
                  const rowId = item._id || item.id
                  const imgUrl = getImageUrl(item.image || (item.images && item.images[0]))

                  return (
                    <tr key={rowId} className="hover:bg-slate-50/60 transition-colors whitespace-nowrap">
                      {/* Machine Details */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center p-0.5">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.title}
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
                              onClick={() => setSelectedListing(item)}
                              className="font-bold text-slate-900 block truncate hover:text-[#F5A623] cursor-pointer"
                            >
                              {item.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              {item.listingCode && (
                                <span className="font-mono font-bold text-amber-700">
                                  {item.listingCode}
                                </span>
                              )}
                              <span>•</span>
                              <span>{item.category}</span>
                              {item.operatorIncluded && (
                                <>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-semibold">+ Operator</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-bold rounded-lg border whitespace-nowrap ${
                            item.type === 'Rent'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.type === 'Rent' ? 'Rent' : 'Sale'}
                        </span>
                      </td>

                      {/* Rate / Price */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-[13px] tracking-tight whitespace-nowrap">
                          {formatPrice(item)}
                        </div>
                      </td>

                      {/* Deposit / Min Term */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Deposit:</span>
                            <span className="font-bold text-slate-800">{formatDeposit(item)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11.5px]">
                            <span className="text-slate-400 font-medium">Min:</span>
                            <span className="font-semibold text-slate-600">
                              {item.minDuration || (item.type === 'Sale' ? 'Immediate' : 'Flexible')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col min-w-0 whitespace-nowrap">
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {item.ownerName || item.owner || 'Verified Vendor'}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1 text-[11.5px] mt-0.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{formatLocation(item.location)}</span>
                          </span>
                        </div>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            (item.availability || '').includes('Available')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : (item.availability || '').includes('Rent')
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : (item.availability || '').includes('Sold')
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                          <span>{item.availability || 'Available Now'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedListing(item)}
                            title="Inspect Listing"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingListing(item)
                              setShowAddModal(true)
                            }}
                            title="Edit Listing"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(rowId, item.title)}
                            title="Delete Listing"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Drawer */}
      {selectedListing && (
        <ListingDetailDrawer
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onStatusToggle={async (id) => {
            await listingService.toggleListingStatus(id)
            fetchListings()
            setSelectedListing(null)
          }}
          onEdit={(item) => {
            setEditingListing(item)
            setShowAddModal(true)
          }}
        />
      )}

      {/* Add / Edit Modal with Local Backend Image Picker */}
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
