import React, { useState, useEffect } from 'react'
import {
  X,
  Search,
  UserCheck,
  CheckCircle2,
  Building2,
  Phone,
  MapPin,
  Sparkles,
  Send,
  AlertCircle,
  Truck,
  Users,
} from 'lucide-react'
import { enquiryService } from '../../services/enquiryService'

export function AssignSellerModal({
  isOpen = false,
  onClose,
  enquiry = null, // Single enquiry or null if bulk
  selectedIds = [], // Array of enquiry IDs if bulk
  onAssignedSuccess,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sellers, setSellers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isBulk = Boolean(!enquiry && selectedIds.length > 0)
  const machineName = enquiry?.machine || enquiry?.machineName || ''
  const categoryName = enquiry?.category || ''

  useEffect(() => {
    if (!isOpen) {
      setSelectedSeller(null)
      setSearchTerm('')
      setErrorMessage('')
      return
    }

    const loadSellers = async () => {
      setIsLoading(true)
      try {
        const res = await enquiryService.getMatchingSellers({
          category: categoryName,
          machine: machineName,
          search: searchTerm,
        })
        if (res.success && Array.isArray(res.data)) {
          setSellers(res.data)
        } else {
          setSellers([])
        }
      } catch (err) {
        console.error('Error fetching sellers:', err)
        setErrorMessage('Failed to load eligible sellers')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(loadSellers, 250)
    return () => clearTimeout(timer)
  }, [isOpen, categoryName, machineName, searchTerm])

  if (!isOpen) return null

  const handleConfirmAssignment = async () => {
    if (!selectedSeller) {
      setErrorMessage('Please select a seller to assign this lead to.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const sellerData = {
        sellerId: selectedSeller._id || selectedSeller.id,
        sellerPhone: selectedSeller.phone,
        sellerName: selectedSeller.name,
        sellerCompany: selectedSeller.companyName || '',
      }

      if (isBulk) {
        // Bulk assignment
        const res = await enquiryService.bulkAssignToSeller({
          ids: selectedIds,
          ...sellerData,
        })
        if (res.success) {
          onAssignedSuccess &&
            onAssignedSuccess(
              `Successfully assigned ${selectedIds.length} enquiries to ${selectedSeller.name}! 🚀 Push notification sent.`
            )
          onClose()
        } else {
          setErrorMessage(res.message || 'Failed to bulk assign leads.')
        }
      } else if (enquiry) {
        // Single enquiry assignment
        const res = await enquiryService.assignToSeller(
          enquiry._id || enquiry.id,
          sellerData
        )
        if (res.success) {
          onAssignedSuccess &&
            onAssignedSuccess(
              `Lead assigned to ${selectedSeller.name}! 🎉 Notification sent to seller's mobile app.`
            )
          onClose()
        } else {
          setErrorMessage(res.message || 'Failed to assign lead.')
        }
      }
    } catch (err) {
      console.error('Assignment error:', err)
      setErrorMessage(
        err.response?.data?.message || 'Error occurred during assignment.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623] text-slate-950 flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white leading-tight">
                {isBulk
                  ? `Assign ${selectedIds.length} Enquiries to Seller`
                  : 'Assign Enquiry to Seller'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isBulk
                  ? 'Selected leads will be transferred to chosen seller with instant push notification'
                  : `Assign lead for "${machineName || 'Machine'}" to verified machinery partner`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Summary Strip */}
        <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-amber-950">
              {isBulk ? `${selectedIds.length} Enquiries Selected` : `Lead: ${enquiry?.name || 'Customer'}`}
            </span>
            <span>•</span>
            <span className="truncate">
              {isBulk
                ? 'Bulk lead distribution to matching partner'
                : `${machineName || 'Any Machine'} (${categoryName || 'General'})`}
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-200/60 text-amber-900 rounded-md shrink-0">
            Admin Controlled
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search seller by name, phone number, company or city..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            />
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sellers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
            <span>Select One Machinery Seller / Partner</span>
            <span>{sellers.length} Available</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Searching matching sellers in Atlas...
            </div>
          ) : sellers.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No sellers found matching the search criteria.
            </div>
          ) : (
            sellers.map((seller) => {
              const isSelected =
                selectedSeller &&
                (selectedSeller._id || selectedSeller.id) ===
                  (seller._id || seller.id)

              return (
                <div
                  key={seller._id || seller.id}
                  onClick={() => setSelectedSeller(seller)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#F5A623] bg-amber-50/60 ring-2 ring-[#F5A623]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected
                          ? 'bg-[#F5A623] text-slate-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {(seller.name || 'S')[0].toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {seller.name}
                        </span>
                        {seller.isCategoryMatch && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                            Matching Machine Seller
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                        {seller.companyName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {seller.companyName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {seller.phone}
                        </span>
                        {(seller.city || seller.state) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {[seller.city, seller.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#F5A623] bg-[#F5A623] text-slate-950'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {selectedSeller ? (
              <span className="text-slate-800 font-semibold">
                Will notify: <span className="font-bold text-[#D97706]">{selectedSeller.name}</span> ({selectedSeller.phone})
              </span>
            ) : (
              <span>Choose a seller to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmAssignment}
              disabled={isSubmitting || !selectedSeller}
              className="px-5 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? 'Assigning...' : 'Assign & Send Notification'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
