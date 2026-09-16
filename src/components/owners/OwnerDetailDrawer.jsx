import { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building2,
  Truck,
  ShieldCheck,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Send,
} from 'lucide-react'

export function OwnerDetailDrawer({
  isOpen = false,
  owner,
  onClose,
  onStatusToggle,
  onKycUpdate,
  onAddNote,
  onEditClick,
}) {
  const [activeTab, setActiveTab] = useState('Profile') // 'Profile' | 'Notes' | 'History'
  const [newNoteText, setNewNoteText] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  if (!isOpen || !owner) return null

  const id = owner._id || owner.id
  const isActive = owner.status === 'Active'
  const isVerified = owner.kycStatus === 'Verified'

  const initials =
    owner.initials ||
    (owner.name
      ? owner.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'OW')

  const joinDateFormatted = owner.createdAt
    ? new Date(owner.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : owner.joinDate || 'Recent'

  const handleNoteSubmit = async (e) => {
    e.preventDefault()
    if (!newNoteText.trim()) return
    setIsSubmittingNote(true)
    try {
      await onAddNote(id, newNoteText.trim())
      setNewNoteText('')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  return (
    <>
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 2. Slide-Over Sheet */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Avatar */}
            {owner.avatarImg ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                <img
                  src={owner.avatarImg}
                  alt={owner.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                  owner.avatarBg || 'bg-slate-900 text-[#F5A623]'
                }`}
              >
                {initials}
              </div>
            )}

            {/* Name & Badges */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {owner.name}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {owner.status || 'Active'}
                </span>
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border ${
                    isVerified
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : owner.kycStatus === 'Rejected'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  KYC: {owner.kycStatus || 'Pending'}
                </span>
              </div>

              {owner.businessName && (
                <div className="text-xs text-slate-600 font-medium mt-0.5 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{owner.businessName}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Joined {joinDateFormatted}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('Profile')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Profile'
                ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Owner Profile
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('Notes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'Notes'
                ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Notes</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/40 font-black">
              {owner.notes?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('History')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'History'
                ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Activity History</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/40 font-black">
              {owner.history?.length || 0}
            </span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* ─── TAB 1: PROFILE ─── */}
          {activeTab === 'Profile' && (
            <div className="space-y-4">
              {/* Contact Information Card */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold">Phone</div>
                      <a
                        href={`tel:${owner.phone}`}
                        className="font-bold text-slate-800 hover:text-amber-600 transition-colors truncate block"
                      >
                        {owner.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold">Email</div>
                      <a
                        href={`mailto:${owner.email}`}
                        className="font-bold text-slate-800 hover:text-amber-600 transition-colors truncate block"
                      >
                        {owner.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold">Location / Base</div>
                      <div className="font-bold text-slate-800 truncate">
                        {owner.location || `${owner.city}, ${owner.state}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Machinery Fleet & Business Details Card */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Equipment Fleet & Business Info
                </h4>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10.5px] text-slate-400 font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3 text-sky-600" />
                      <span>Registered Fleet</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-1">
                      {owner.machines || owner.fleetSize || 1} Machine(s)
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10.5px] text-slate-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>KYC Verification</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      {owner.kycStatus || 'Pending'}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                    <div className="text-[10.5px] text-slate-400 font-semibold">
                      GST Number
                    </div>
                    <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                      {owner.gstNumber || 'Not provided'}
                    </div>
                  </div>

                  {owner.businessName && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2">
                      <div className="text-[10.5px] text-slate-400 font-semibold">
                        Registered Business Name
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">
                        {owner.businessName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: NOTES ─── */}
          {activeTab === 'Notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleNoteSubmit} className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Add Internal Note
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Enter notes about equipment verification, documents, fleet inspection..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/25 focus:border-[#F5A623] transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    className="px-3.5 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Adding...' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes Timeline List */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Notes Log ({owner.notes?.length || 0})
                </h4>

                {!owner.notes || owner.notes.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No notes recorded yet for this owner.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {owner.notes.map((note, nIdx) => (
                      <div
                        key={note._id || nIdx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1"
                      >
                        <p className="text-slate-800 leading-relaxed">{note.text}</p>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                          <span>by {note.author || 'Admin'}</span>
                          <span>•</span>
                          <span>
                            {note.createdAt
                              ? new Date(note.createdAt).toLocaleString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Recent'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 3: ACTIVITY HISTORY ─── */}
          {activeTab === 'History' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Audit Timeline
              </h4>

              {!owner.history || owner.history.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No activity history logged yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  {owner.history.map((hist, hIdx) => (
                    <div key={hist._id || hIdx} className="relative text-xs space-y-0.5">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#F5A623] border-2 border-white ring-2 ring-[#F5A623]/20" />
                      <div className="font-bold text-slate-900">{hist.action}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span>by {hist.author || 'Admin'}</span>
                        <span>•</span>
                        <span>
                          {hist.createdAt
                            ? new Date(hist.createdAt).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Sticky Quick Action Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* Status Toggle */}
            <button
              type="button"
              onClick={() => onStatusToggle(id, isActive ? 'Inactive' : 'Active')}
              className={`px-3 py-2 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Deactivate Owner</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Activate Owner</span>
                </>
              )}
            </button>

            {/* KYC Toggle */}
            {owner.kycStatus !== 'Verified' && (
              <button
                type="button"
                onClick={() => onKycUpdate(id, 'Verified')}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify KYC</span>
              </button>
            )}

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => {
                onClose()
                onEditClick(owner)
              }}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  )
}
