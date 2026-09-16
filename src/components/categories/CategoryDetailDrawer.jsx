import React from 'react'
import {
  X,
  Tag,
  FolderTree,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  Edit3,
} from 'lucide-react'
import { getImageUrl } from '../../utils/imageUtils'

export function CategoryDetailDrawer({
  isOpen = false,
  category,
  onClose,
  onStatusToggle,
  onEditClick,
}) {
  if (!isOpen || !category) return null

  const id = category._id || category.id
  const isActive = category.status === 'Active'

  const createdOnFormatted = category.createdAt
    ? new Date(category.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : category.createdOn || 'Recent'

  return (
    <>
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* 2. Slide-Over Sheet */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[520px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Category Image */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center p-1.5">
              <img
                src={
                  getImageUrl(category.image) ||
                  'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=200&auto=format&fit=crop&q=80'
                }
                alt={category.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = '🚜'
                }}
              />
            </div>

            {/* Name & Status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                  {category.name}
                </h2>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {category.status || 'Active'}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                slug: /{category.slug}
              </div>

              <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Created {createdOnFormatted}</span>
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

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
          {/* Description Card */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Category Description
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {category.description || 'No description provided for this category.'}
            </p>
          </div>

          {/* Counts & Statistics */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Catalog Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-400 font-semibold">
                    Subcategories
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {category.subcategories || 1}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-400 font-semibold">
                    Listed Machines
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {category.machinesCount || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
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
                  <span>Deactivate Category</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Activate Category</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose()
                onEditClick(category)
              }}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
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
