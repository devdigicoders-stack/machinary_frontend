import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Eye,
  Tag,
  Check,
  FileCheck,
  X,
} from 'lucide-react'
import { listingService } from '../../services/listingService'
import { getImageUrl } from '../../utils/imageUtils'
import { Toast } from '../../components/common/Toast'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Rejection Modal
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('Invalid RC Document')
  const [rejectionNote, setRejectionNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // Document Verification State
  const [verifiedDocs, setVerifiedDocs] = useState({})
  const [previewDoc, setPreviewDoc] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const fetchListingDetail = async () => {
    try {
      setLoading(true)
      const res = await listingService.getListingById(id)
      const data = res?.data || res
      setListing(data)
      // Initialize verified documents status
      if (data?.documents) {
        const initialVerified = {}
        Object.entries(data.documents).forEach(([k, v]) => {
          if (v) {
            initialVerified[k] = data.approvalStatus === 'Approved' ? true : false
          }
        })
        setVerifiedDocs(initialVerified)
      }
    } catch (err) {
      console.error('Failed to load listing detail:', err)
      showToast(err?.response?.data?.message || 'Failed to load listing details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchListingDetail()
    }
  }, [id])

  const handleApprove = async () => {
    // Check if there are uploaded documents that haven't been verified yet
    if (listing?.documents && Object.values(listing.documents).some(Boolean)) {
      const pendingDocs = Object.entries(listing.documents)
        .filter(([_, v]) => Boolean(v))
        .filter(([k]) => !verifiedDocs[k])

      if (pendingDocs.length > 0) {
        const confirmApprove = window.confirm(
          `There are ${pendingDocs.length} document(s) not yet marked as verified. Do you still want to approve this listing?`
        )
        if (!confirmApprove) return
      }
    }

    try {
      setProcessing(true)
      await listingService.approveListing(id)
      showToast(`Listing "${listing?.title || 'Machine'}" approved & published successfully!`)
      fetchListingDetail()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to approve listing')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setProcessing(true)
      await listingService.rejectListing(id, {
        reason: rejectionReason,
        note: rejectionNote,
      })
      showToast(`Listing rejected. Owner has been notified.`)
      setShowRejectModal(false)
      fetchListingDetail()
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to reject listing')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setProcessing(true)
      const newStatus = listing.status === 'Active' ? 'Inactive' : 'Active'
      await listingService.updateListingStatus(id, newStatus)
      showToast(`Listing status updated to ${newStatus}`)
      fetchListingDetail()
    } catch (err) {
      showToast('Failed to update status')
    } finally {
      setProcessing(false)
    }
  }

  const formatPrice = () => {
    if (!listing) return '₹ 0'
    let raw = (listing.rateOrPrice || listing.price || '0').toString().replace(/^₹\s*/, '')
    const formatted = `₹ ${raw}`
    if (listing.type === 'Sale') return formatted
    return listing.rateUnit ? `${formatted} / ${listing.rateUnit}` : `${formatted} / day`
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    return [loc.address, loc.city, loc.state].filter(Boolean).join(', ') || 'India'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#F5A623]" />
        <p className="text-sm font-bold text-slate-600">Loading Listing Details...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-sm text-slate-500">The requested listing could not be found or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    )
  }

  const allImages = listing.images && listing.images.length > 0
    ? listing.images
    : listing.image
    ? [listing.image]
    : []

  const currentImage = allImages[activeImageIndex] || listing.image || ''

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

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-slate-800 transition-colors font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span>/</span>
            <Link to="/listings" className="hover:text-slate-800">Listings</Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{listing.listingCode || 'Detail'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{listing.title}</h1>
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {listing.listingCode || 'MH-1001'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                listing.approvalStatus === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : listing.approvalStatus === 'Pending'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              ● {listing.approvalStatus || 'Pending'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                listing.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {listing.status === 'Active' ? 'Live / Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          {listing.approvalStatus === 'Pending' && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Reject Submission
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve &amp; Publish</span>
              </button>
            </>
          )}

          {listing.approvalStatus === 'Approved' && (
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={processing}
              className={`px-4 py-2.5 font-bold text-xs rounded-xl border transition-colors cursor-pointer ${
                listing.status === 'Active'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {listing.status === 'Active' ? 'Deactivate Listing' : 'Activate Listing'}
            </button>
          )}

          <button
            type="button"
            onClick={fetchListingDetail}
            className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin text-[#F5A623]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Photos & Documents) | Right Column (Specs & Owner) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Hero Viewer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<span class="text-6xl text-white/50">🚜</span>'
                  }}
                />
              ) : (
                <span className="text-6xl text-white/50">🚜</span>
              )}

              {/* Price Pill */}
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white font-black text-base px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg">
                {formatPrice()}
              </div>

              {/* Type Pill */}
              <div className="absolute top-4 right-4 bg-[#F5A623] text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-lg">
                For {listing.type}
              </div>

              {/* Photo Index Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                  {activeImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#F5A623] ring-2 ring-[#F5A623]/30 scale-95'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Uploaded Verification Documents Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-black text-slate-900">
                  Uploaded Verification Documents
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  {listing.documents ? Object.values(listing.documents).filter(Boolean).length : 0} Attached
                </span>
                {listing.documents && Object.values(listing.documents).some(Boolean) && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    Object.entries(listing.documents).filter(([_, v]) => Boolean(v)).every(([k]) => verifiedDocs[k])
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {Object.entries(listing.documents).filter(([_, v]) => Boolean(v)).filter(([k]) => verifiedDocs[k]).length} of {Object.entries(listing.documents).filter(([_, v]) => Boolean(v)).length} Verified
                  </span>
                )}
              </div>
            </div>

            {listing.documents && Object.values(listing.documents).some(Boolean) ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Please review each uploaded document carefully before approving the listing.</span>
                  </div>
                  {listing.approvalStatus === 'Pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        const allTrue = {}
                        Object.entries(listing.documents).forEach(([k, v]) => {
                          if (v) allTrue[k] = true
                        })
                        setVerifiedDocs(allTrue)
                        showToast('All documents marked as verified')
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Verify All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(listing.documents).map(([key, val]) => {
                    if (!val) return null
                    const label = docLabels[key] || key.toUpperCase()
                    const docUrl = getImageUrl(val)
                    const isDocVerified = !!verifiedDocs[key]

                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 shadow-2xs ${
                          isDocVerified
                            ? 'border-emerald-300 bg-emerald-50/40'
                            : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${
                              isDocVerified
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              📄
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-900 truncate">{label}</h4>
                              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                Uploaded by owner
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            isDocVerified
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {isDocVerified ? '✓ Verified' : 'Pending Check'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({ label, url: docUrl, key })}
                            className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>

                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs shadow-2xs transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {listing.approvalStatus === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setVerifiedDocs((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }}
                              className={`py-1.5 px-3 font-bold text-xs rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                                isDocVerified
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isDocVerified ? 'Verified' : 'Verify'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No extra verification documents were attached during listing submission.
              </div>
            )}
          </div>

          {/* Description & Notes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-700">
              Listing Description &amp; Terms
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {listing.description || listing.subtitle || 'No detailed remarks or description provided by the owner.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Machine & Specifications Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F5A623]" />
              Machine Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-900">{listing.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Model Year:</span>
                <span className="font-bold text-slate-900">{listing.modelYear || '2023'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Hours / Usage:</span>
                <span className="font-bold text-slate-900">{listing.hoursUsed || '0 hrs'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Listing Type:</span>
                <span className="font-bold text-slate-900">For {listing.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Security Deposit:</span>
                <span className="font-bold text-slate-900">{listing.securityDeposit || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Min Rental Duration:</span>
                <span className="font-bold text-slate-900">{listing.minDuration || 'Flexible'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Operator Included:</span>
                <span className="font-bold text-slate-900">{listing.operatorIncluded ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Availability:</span>
                <span className="font-bold text-emerald-700">{listing.availability || 'Available Now'}</span>
              </div>

              {/* Dynamic Category Specifications if present */}
              {listing.specifications && Object.keys(listing.specifications).length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Additional Attributes
                  </span>
                  {Object.entries(listing.specifications).map(([sKey, sVal]) => (
                    <div key={sKey} className="flex justify-between py-1 text-slate-700">
                      <span className="capitalize text-slate-500">{sKey.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-bold text-slate-900">{String(sVal)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Owner & Vendor Profile */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Owner Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Owner Name:</span>
                <span className="font-bold text-slate-900 text-sm">{listing.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <a
                  href={`tel:${listing.ownerPhone}`}
                  className="font-bold text-[#F5A623] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {listing.ownerPhone || 'N/A'}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location:</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {formatLocation(listing.location)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Owner KYC:</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200">
                  {listing.ownerKyc || 'Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Moderation & Verification Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Moderation Record
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>RC Number:</span>
                <span className="font-mono font-bold text-slate-900">{listing.rcNumber || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between">
                <span>Doc Status:</span>
                <span className="font-bold text-emerald-700">{listing.docStatus || 'Verified'}</span>
              </div>
              {listing.approvedBy && (
                <div className="flex justify-between">
                  <span>Approved By:</span>
                  <span className="font-bold text-slate-900">{listing.approvedBy}</span>
                </div>
              )}
              {listing.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                  <span className="font-bold block">Rejection Reason:</span>
                  <p>{listing.rejectionReason}</p>
                  {listing.rejectionNote && <p className="text-[11px] text-rose-600">{listing.rejectionNote}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- REJECTION MODAL --- */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Reject Listing Submission</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Rejecting <strong>{listing.title}</strong> submitted by <strong>{listing.ownerName}</strong>.
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
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {processing && <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCUMENT PREVIEW MODAL --- */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {previewDoc.label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100/60 min-h-[300px]">
              {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.label}
                  className="w-full h-[500px] rounded-lg border border-slate-200"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="p-8 text-center text-slate-500 font-bold">Unable to load document image. Please open in a new tab.</div>'
                  }}
                />
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Tab</span>
              </a>

              <div className="flex items-center gap-2">
                {listing.approvalStatus === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      setVerifiedDocs((prev) => ({
                        ...prev,
                        [previewDoc.key]: true,
                      }))
                      setPreviewDoc(null)
                      showToast(`${previewDoc.label} marked as verified`)
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark as Verified</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
