import React from 'react'

export function Toast({ message }) {
  if (!message) return null

  return (
    <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="w-2.5 h-2.5 rounded-full bg-[#F5A623] animate-ping shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}
