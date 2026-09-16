import React, { useState } from 'react'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ShoppingBag,
  Repeat,
  CheckCircle2,
  PhoneCall,
  XCircle,
  MessageSquare,
  History,
  FileText,
  Send,
  User,
  ShieldCheck,
  Building2,
  Tag,
  DollarSign,
  UserCheck,
} from 'lucide-react'

export function EnquiryDetailDrawer({
  isOpen = false,
  enquiry,
  onClose,
  onUpdateStatus,
  onAddNote,
  onAssign,
}) {
  const [activeTab, setActiveTab] = useState('Details') // 'Details' | 'Notes' | 'History'
  const [newNoteText, setNewNoteText] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  if (!isOpen || !enquiry) return null

  const id = enquiry._id || enquiry.id
  const customerName = enquiry.name || enquiry.customerName || 'Customer'
  const initials = customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'Contacted':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'Converted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

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

  const dateFormatted = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : enquiry.date || 'Recent'

  const timeFormatted = enquiry.createdAt
    ? new Date(enquiry.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : enquiry.time || ''

  return (
    <>
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 2. Slide-Over Side Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[560px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Customer Initials */}
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-[#F5A623] font-black text-base flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>

            {/* Name & ID */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {customerName}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(
                    enquiry.status
                  )}`}
                >
                  {enquiry.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                <span>
                  ID: <strong className="text-slate-800">{enquiry.enquiryId || '#ENQ-1001'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {dateFormatted} {timeFormatted && `, ${timeFormatted}`}
                </span>
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
            onClick={() => setActiveTab('Details')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Details'
                ? 'bg-[#F5A623] text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Enquiry Details
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
              {enquiry.notes?.length || 0}
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
              {enquiry.history?.length || 0}
            </span>
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* ─── TAB 1: DETAILS ─── */}
          {activeTab === 'Details' && (
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
                        href={`tel:${enquiry.phone || enquiry.customerPhone}`}
                        className="font-bold text-slate-800 hover:text-amber-600 transition-colors truncate block"
                      >
                        {enquiry.phone || enquiry.customerPhone}
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
                        href={`mailto:${enquiry.email || enquiry.customerEmail}`}
                        className="font-bold text-slate-800 hover:text-amber-600 transition-colors truncate block"
                      >
                        {enquiry.email || enquiry.customerEmail || 'Not specified'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:col-span-2">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold">Customer Location</div>
                      <div className="font-bold text-slate-800 truncate">
                        {enquiry.location || 'India'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Machinery & Requirement Information */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Requirement & Machine Details
                  </h4>
                  {enquiry.enquiryType === 'Buy' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Enquiry</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Rental Enquiry</span>
                    </span>
                  )}
                </div>

                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20">
                  <div className="text-[11px] font-semibold text-amber-800">Target Machine</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {enquiry.fullMachineName || enquiry.machine || enquiry.machineName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Budget Range</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {enquiry.budgetRange || 'Flexible'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Timeline</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {enquiry.requirementDate || 'Immediate'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Preferred City</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {enquiry.preferredLocation || enquiry.location || 'India'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Lead Source</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">
                      {enquiry.source || 'Website'}
                    </span>
                  </div>

                  <div className="col-span-2 pt-1">
                    <span className="text-[10.5px] text-slate-400 font-semibold block">Assigned Executive</span>
                    <span className="inline-block font-bold text-slate-800 mt-0.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                      {enquiry.assignedTo || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Message Query Box */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Message</span>
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs text-slate-700 leading-relaxed italic">
                  "{enquiry.message || 'No additional message provided with this enquiry.'}"
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
                  Add Internal Staff Note
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add notes about call discussion, inspection, price offer, etc..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623] outline-none text-slate-800"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteText.trim()}
                    className="px-4 py-2 bg-[#F5A623] hover:bg-[#EAA020] text-slate-950 text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingNote ? 'Saving...' : 'Add Note'}</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Existing Notes ({enquiry.notes?.length || 0})
                </h5>

                {!enquiry.notes || enquiry.notes.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No notes recorded yet. Add the first note above!
                  </div>
                ) : (
                  enquiry.notes.map((note, nIdx) => (
                    <div
                      key={note._id || nIdx}
                      className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                        <span className="font-bold text-amber-900">{note.author || 'Admin'}</span>
                        <span>
                          {note.createdAt
                            ? new Date(note.createdAt).toLocaleString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ─── TAB 3: HISTORY ─── */}
          {activeTab === 'History' && (
            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Audit Trail ({enquiry.history?.length || 0})
              </h5>

              {!enquiry.history || enquiry.history.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No activity history logged yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  {enquiry.history.map((hist, hIdx) => (
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
            {enquiry.status !== 'Contacted' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(id, 'Contacted')}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Mark Contacted</span>
              </button>
            )}

            {enquiry.status !== 'Converted' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(id, 'Converted')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Convert to Sale</span>
              </button>
            )}

            {enquiry.status !== 'Closed' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(id, 'Closed')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            Close Panel
          </button>
        </div>
      </aside>
    </>
  )
}
