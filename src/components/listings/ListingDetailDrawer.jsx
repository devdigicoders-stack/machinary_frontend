import {
  X,
  MapPin,
  Phone,
  User,
  ShieldCheck,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function ListingDetailDrawer({ listing, onClose, onStatusToggle, onEdit }) {
  if (!listing) return null

  const imageUrl = getImageUrl(listing.image || (listing.images && listing.images[0]))

  const formatPrice = () => {
    const rawPrice = listing.rateOrPrice || listing.price || '0'
    const formatted = rawPrice.startsWith('₹') ? rawPrice : `₹ ${rawPrice}`
    return listing.rateUnit ? `${formatted} / ${listing.rateUnit}` : formatted
  }

  const formatLocation = (loc) => {
    if (!loc) return 'India'
    if (typeof loc === 'string') return loc
    return [loc.address, loc.city, loc.state].filter(Boolean).join(', ') || 'India'
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-end backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              {listing.listingCode || 'LISTING'}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                listing.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {listing.status}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                listing.type === 'Rent'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              For {listing.type}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Thumbnail / Banner */}
          <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 h-52 flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '<span class="text-4xl">🚜</span>'
                }}
              />
            ) : (
              <span className="text-5xl">🚜</span>
            )}
            {listing.isFeatured && (
              <span className="absolute top-3 left-3 bg-[#F5A623] text-slate-950 font-extrabold text-xs px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                ⭐ {listing.promotionType || 'Featured Listing'}
              </span>
            )}
            <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg font-black text-sm">
              {formatPrice()}
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {listing.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {listing.subtitle || listing.description || 'Verified machinery listed on Machinery Wallah'}
            </p>
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Category</span>
              <span className="font-bold text-slate-800">{listing.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Model Year</span>
              <span className="font-bold text-slate-800">{listing.modelYear || '2023'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Hours / KM Run</span>
              <span className="font-bold text-slate-800">{listing.hoursUsed || '0 hrs'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Availability</span>
              <span className="font-bold text-emerald-700">{listing.availability || 'Available Now'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Security Deposit</span>
              <span className="font-bold text-slate-800">{listing.securityDeposit || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Operator Included</span>
              <span className="font-bold text-slate-800">{listing.operatorIncluded ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {/* Verification & Compliance */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compliance & Documentation</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">RC Number</span>
                <span className="font-mono font-bold text-slate-800">{listing.rcNumber || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Doc Status</span>
                <span className="font-bold text-emerald-600">{listing.docStatus || 'Verified'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Insurance Validity</span>
                <span className="font-bold text-slate-800">{listing.insuranceValidTill || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Approval Status</span>
                <span className="font-bold text-amber-700">{listing.approvalStatus || 'Approved'}</span>
              </div>
            </div>
            {listing.rejectionReason && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-800">
                <span className="font-bold">Rejection Note: </span>
                {listing.rejectionReason} {listing.rejectionNote && `(${listing.rejectionNote})`}
              </div>
            )}
          </div>

          {/* Owner Details Card */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#F5A623]" />
              <span>Owner / Vendor Details</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Owner Name:</span>
                <span className="font-bold text-slate-900">{listing.ownerName || listing.owner}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {listing.ownerPhone || 'N/A'}
                </span>
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
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                  {listing.ownerKyc || 'Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onStatusToggle && onStatusToggle(listing._id || listing.id)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              listing.status === 'Active'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {listing.status === 'Active' ? 'Deactivate Listing' : 'Activate Listing'}
          </button>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(listing)
                  onClose()
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-lg shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
