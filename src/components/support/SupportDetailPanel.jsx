import React, { useState } from 'react'
import { X, Phone, User, Send, Clock, CheckCircle2, AlertCircle, FileText, Download, ShieldCheck, MessageSquare, History } from 'lucide-react'

const statusStyles = {
  Open:         { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
  'In Progress':{ bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  Resolved:     { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Closed:       { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200' },
}

const priorityStyles = {
  High:   { bg: 'bg-rose-50',    text: 'text-rose-600',   dot: 'bg-rose-500' },
  Medium: { bg: 'bg-amber-50',   text: 'text-amber-600',  dot: 'bg-amber-500' },
  Low:    { bg: 'bg-emerald-50', text: 'text-emerald-600',dot: 'bg-emerald-500'},
}

export function SupportDetailPanel({
  ticket,
  onClose,
  onResolve,
  onReassign,
  onCloseTicket,
  onInProgress,
  onSendMessage,
}) {
  const [activeTab, setActiveTab] = useState('Details')
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  if (!ticket) return null

  const sStyle = statusStyles[ticket.status] || statusStyles.Open
  const pStyle = priorityStyles[ticket.priority] || priorityStyles.Low
  const messages = ticket.messages || []
  const activityLog = ticket.activityLog || []

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!replyText.trim() || isSending) return
    setIsSending(true)
    try {
      if (onSendMessage) {
        await onSendMessage(ticket._id || ticket.id, replyText.trim())
      }
      setReplyText('')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 z-10">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black text-slate-900 tracking-tight">{ticket.ticketId}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
              {ticket.status}
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${pStyle.bg} ${pStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
              {ticket.priority}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subject & Created Info */}
        <div className="px-5 pt-3.5 pb-3 border-b border-slate-100 bg-white">
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{ticket.subject}</h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Created on {ticket.createdDate || 'Recent'}{ticket.createdTime ? `, ${ticket.createdTime}` : ''}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-2">
          {[
            { key: 'Details', label: 'Details', icon: FileText },
            { key: 'Conversation', label: `Conversation (${messages.length})`, icon: MessageSquare },
            { key: 'Activity', label: `Activity (${activityLog.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
                  isActive
                    ? 'border-[#F5A623] text-[#D98200]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'Details' && (
            <>
              {/* User Details Card */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">User Information</h4>
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-xs text-white font-bold text-sm">
                    {ticket.userName ? ticket.userName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{ticket.userName}</span>
                      {ticket.userRole && (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                          {ticket.userRole}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{ticket.userEmail}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{ticket.userPhone || 'No phone provided'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information Table */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket Info</h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Ticket Type</span>
                    <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{ticket.type}</span>
                  </div>
                  {ticket.category && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Category</span>
                      <span className="font-semibold text-slate-800">{ticket.category}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Priority</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${pStyle.bg} ${pStyle.text}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Status</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Assigned To</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                      {ticket.assignedTo || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium">Created On</span>
                    <span className="text-slate-700 font-medium">{ticket.createdDate} {ticket.createdTime}</span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Complaint / Description</h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {ticket.description || 'No description provided.'}
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attachments</h4>
                {ticket.attachments && ticket.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-[#F5A623] shrink-0 font-bold text-[10px]">
                            FILE
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">{att.filename || `Attachment ${idx+1}`}</div>
                            {att.size && <div className="text-[10px] text-slate-400">{att.size}</div>}
                          </div>
                        </div>
                        {att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No attachments provided with this ticket.</p>
                )}
              </div>
            </>
          )}

          {/* Tab: Conversation */}
          {activeTab === 'Conversation' && (
            <div className="flex flex-col h-full space-y-4">
              <div className="space-y-3 flex-1">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No messages in this conversation yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Send a reply below to reach out to the customer.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.isStaff || msg.senderRole === 'Support' || msg.senderRole === 'Admin' || msg.sender?.toLowerCase().includes('admin') || msg.sender?.toLowerCase().includes('support')
                    const dateStr = (msg.sentAt || msg.timestamp) ? new Date(msg.sentAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] ${
                          isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-600">{msg.sender}</span>
                          <span className={`text-[9px] font-semibold px-1 py-0.2 rounded ${
                            isAdmin ? 'bg-amber-100 text-[#D98200]' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {msg.senderRole || (isAdmin ? 'Admin' : 'Customer')}
                          </span>
                          {dateStr && <span className="text-[9px] text-slate-400">{dateStr}</span>}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isAdmin
                              ? 'bg-amber-50 border border-amber-200 text-slate-800 rounded-tr-xs'
                              : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          {msg.text || msg.message}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSend} className="pt-3 border-t border-slate-200 sticky bottom-0 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply to the customer..."
                    disabled={isSending}
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F5A623] focus:border-[#F5A623] bg-white text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="px-3.5 py-2.5 bg-[#F5A623] hover:bg-[#E09400] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab: Activity Log */}
          {activeTab === 'Activity' && (
            <div className="space-y-3.5">
              {activityLog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <History className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">No activity log recorded.</p>
                </div>
              ) : (
                activityLog.map((log, idx) => {
                  const logDate = log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''
                  return (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#F5A623] mt-1.5 shrink-0 ring-4 ring-amber-100" />
                      <div className="flex-1 bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{log.action}</span>
                          <span className="text-[10px] text-slate-400">{logDate}</span>
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-slate-600 mt-1">{log.details}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          By: <span className="text-slate-600 font-semibold">{log.performedBy || log.author || 'System'}</span>
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
          {ticket.status === 'Open' && onInProgress && (
            <button
              type="button"
              onClick={() => onInProgress(ticket)}
              className="flex-1 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
            >
              In Progress
            </button>
          )}

          {ticket.status !== 'Resolved' && (
            <button
              type="button"
              onClick={() => onResolve(ticket)}
              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Resolve
            </button>
          )}

          <button
            type="button"
            onClick={() => onReassign(ticket)}
            className="flex-1 py-2 text-xs font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 bg-white rounded-lg cursor-pointer transition-colors"
          >
            Reassign
          </button>

          {ticket.status !== 'Closed' && (
            <button
              type="button"
              onClick={() => onCloseTicket(ticket)}
              className="flex-1 py-2 text-xs font-bold text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-300 rounded-lg cursor-pointer transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
