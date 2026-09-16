import React from 'react'
import { ShieldCheck } from 'lucide-react'

export function SecurityBadge() {
  return (
    <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
        <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-800 leading-tight">
          Secure Admin Access
        </h4>
        <p className="text-[10.5px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">
          Your data is protected with industry-standard security.
        </p>
      </div>
    </div>
  )
}
